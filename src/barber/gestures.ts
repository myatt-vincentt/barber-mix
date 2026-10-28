// Reading the barber's four cues from the face. Pure (no React, no three),
// so it is tested on its own (gestures.test.ts).
//
// Raised brows, an open mouth and a wink are read from the blendshapes,
// each against your own calm face: the first CALIBRATE seconds with a face
// in view learn it (up to REST_MAX, so someone who starts mid-grin still
// works), and a cue fires when its reading rises SPAN above that and holds
// for a moment. A head tilt is the roll angle. Every cue must let go (drop
// below RELEASE) before it can fire again, so holding a face steps once.

export type Blendshapes = Readonly<Record<string, number | undefined>>;

export type Cue = "brows" | "mouth" | "tilt" | "wink";
export const CUES: readonly Cue[] = ["brows", "mouth", "tilt", "wink"];

/** The face cues read from the blendshapes (tilt comes from the roll). */
type FaceCue = Exclude<Cue, "tilt">;
const FACE_CUES: readonly FaceCue[] = ["brows", "mouth", "wink"];

const avg = (b: Blendshapes, a: string, c: string) =>
  ((b[a] ?? 0) + (b[c] ?? 0)) / 2;

export const SIGNALS: Record<FaceCue, (b: Blendshapes) => number> = {
  brows: (b) =>
    Math.max(b.browInnerUp ?? 0, avg(b, "browOuterUpLeft", "browOuterUpRight")),
  mouth: (b) => b.jawOpen ?? 0,
  // One eye shut, the other open: a blink closes both.
  wink: (b) => Math.abs((b.eyeBlinkLeft ?? 0) - (b.eyeBlinkRight ?? 0)),
};

export const GESTURES = {
  /** Seconds of face to learn the calm face from. */
  calibrate: 1.5,
  /** The most each reading can be at rest. */
  restMax: { brows: 0.3, mouth: 0.15, wink: 0.2 } as Record<FaceCue, number>,
  /** How far above your calm face a reading must rise to fire. */
  span: { brows: 0.3, mouth: 0.35, wink: 0.4 } as Record<FaceCue, number>,
  /** Head roll to fire, and to let go (radians). */
  tilt: { fire: (15 * Math.PI) / 180, release: (7 * Math.PI) / 180 },
  /** Fraction of the span (or tilt) to drop below before firing again. */
  release: 0.45,
  /** Seconds a cue must hold before it fires (a blink isn't a wink). */
  hold: { brows: 0.12, mouth: 0.12, tilt: 0.15, wink: 0.18 } as Record<
    Cue,
    number
  >,
  /** The calm face keeps learning: seconds to follow a drift. */
  adapt: 20,
};

export type GestureState = {
  /** Calm-face readings (null until calibrated). */
  base: Record<FaceCue, number> | null;
  sum: Record<FaceCue, number>;
  seen: number;
  /** Per cue: since when it has been showing (−1 = not), and whether it must let go first. */
  since: Record<Cue, number>;
  armed: Record<Cue, boolean>;
  t: number;
};

const per = <T>(cues: readonly Cue[], v: T) =>
  Object.fromEntries(cues.map((c) => [c, v])) as Record<Cue, T>;

export const gestureState = (): GestureState => ({
  base: null,
  sum: { brows: 0, mouth: 0, wink: 0 },
  seen: 0,
  since: per(CUES, -1),
  armed: per(CUES, true),
  t: 0,
});

/**
 * One step. `face` is the blendshapes (null = no face), `roll` the head's
 * roll in radians. Returns the new state and the cues that fired now.
 */
export const stepGestures = (
  prev: GestureState,
  t: number,
  face: Blendshapes | null,
  roll: number,
): { state: GestureState; fired: Cue[] } => {
  const dt = Math.min(Math.max(t - prev.t, 0), 0.1);
  const s: GestureState = {
    ...prev,
    since: { ...prev.since },
    armed: { ...prev.armed },
    t,
  };
  const fired: Cue[] = [];
  if (!face) {
    CUES.forEach((c) => {
      s.since[c] = -1;
    });
    return { state: s, fired };
  }

  // Learning the calm face.
  if (!s.base) {
    s.sum = { ...s.sum };
    FACE_CUES.forEach((c) => {
      s.sum[c] += SIGNALS[c](face) * dt;
    });
    s.seen += dt;
    if (s.seen >= GESTURES.calibrate) {
      const base = { brows: 0, mouth: 0, wink: 0 };
      FACE_CUES.forEach((c) => {
        base[c] = Math.min(s.sum[c] / s.seen, GESTURES.restMax[c]);
      });
      s.base = base;
    }
    return { state: s, fired };
  }

  // How far each cue is showing: 1 = enough to fire.
  const level = per(CUES, 0);
  FACE_CUES.forEach((c) => {
    level[c] = (SIGNALS[c](face) - s.base![c]) / GESTURES.span[c];
  });
  level.tilt = Math.abs(roll) / GESTURES.tilt.fire;
  const releaseAt = per(CUES, GESTURES.release);
  releaseAt.tilt = GESTURES.tilt.release / GESTURES.tilt.fire;

  // The calm face keeps learning, from calm readings only.
  const base = { ...s.base };
  FACE_CUES.forEach((c) => {
    if (level[c] < 0.3)
      base[c] = Math.min(
        base[c] + (SIGNALS[c](face) - base[c]) * (dt / GESTURES.adapt),
        GESTURES.restMax[c],
      );
  });
  s.base = base;

  CUES.forEach((c) => {
    if (level[c] < releaseAt[c]) {
      s.armed[c] = true;
      s.since[c] = -1;
      return;
    }
    if (level[c] < 1 || !s.armed[c]) {
      s.since[c] = -1;
      return;
    }
    if (s.since[c] < 0) s.since[c] = t;
    if (t - s.since[c] >= GESTURES.hold[c]) {
      fired.push(c);
      s.armed[c] = false;
      s.since[c] = -1;
    }
  });
  return { state: s, fired };
};
