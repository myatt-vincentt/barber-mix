import { describe, expect, it } from "vitest";

import {
  GESTURES,
  gestureState,
  stepGestures,
  type Blendshapes,
  type Cue,
} from "./gestures";

type Frame = { face?: Blendshapes | null; roll?: number };

/** Run `input(t)` at 30 fps for `seconds`; the cues that fired, with times. */
const run = (seconds: number, input: (t: number) => Frame) => {
  let s = gestureState();
  const fired: [number, Cue][] = [];
  for (let i = 1; i <= seconds * 30; i += 1) {
    const t = i / 30;
    const { face = {}, roll = 0 } = input(t);
    const r = stepGestures(s, t, face, roll);
    s = r.state;
    r.fired.forEach((c) => fired.push([+t.toFixed(2), c]));
  }
  return fired;
};

/** Calm for the calibration, then `face` from `from` to `to` seconds. */
const during = (from: number, to: number, f: Frame) => (t: number) =>
  t >= from && t < to ? f : {};
const CAL = GESTURES.calibrate + 0.2;

describe("cues", () => {
  it("raised brows fire once, however long they're held", () => {
    const fired = run(6, during(CAL, CAL + 3, { face: { browInnerUp: 0.7 } }));
    expect(fired.map((f) => f[1])).toEqual(["brows"]);
  });
  it("an open mouth fires; open again, it fires again", () => {
    const fired = run(6, (t) =>
      (t > CAL && t < CAL + 0.6) || (t > CAL + 1.5 && t < CAL + 2.1)
        ? { face: { jawOpen: 0.7 } }
        : {},
    );
    expect(fired.map((f) => f[1])).toEqual(["mouth", "mouth"]);
  });
  it("a head tilt fires either way", () => {
    const fired = run(6, (t) =>
      t > CAL && t < CAL + 0.8
        ? { roll: 0.4 }
        : t > CAL + 1.6 && t < CAL + 2.4
          ? { roll: -0.4 }
          : {},
    );
    expect(fired.map((f) => f[1])).toEqual(["tilt", "tilt"]);
  });
  it("a wink fires, a blink doesn't", () => {
    const wink = run(
      4,
      during(CAL, CAL + 0.6, {
        face: { eyeBlinkLeft: 0.8, eyeBlinkRight: 0.1 },
      }),
    );
    expect(wink.map((f) => f[1])).toEqual(["wink"]);
    const blink = run(
      4,
      during(CAL, CAL + 0.3, {
        face: { eyeBlinkLeft: 0.9, eyeBlinkRight: 0.85 },
      }),
    );
    expect(blink).toEqual([]);
  });
  it("a flicker shorter than the hold doesn't count", () => {
    const fired = run(4, during(CAL, CAL + 0.05, { face: { jawOpen: 0.8 } }));
    expect(fired).toEqual([]);
  });
  it("nothing fires while the calm face is being learned", () => {
    const fired = run(1, () => ({ face: { jawOpen: 0.9 } }));
    expect(fired).toEqual([]);
  });
  it("brows that sit high at rest need to rise from there", () => {
    const high = { browInnerUp: 0.25 };
    const fired = run(6, (t) =>
      t > CAL && t < CAL + 1 ? { face: { browInnerUp: 0.45 } } : { face: high },
    );
    expect(fired).toEqual([]);
    const raised = run(6, (t) =>
      t > CAL && t < CAL + 1 ? { face: { browInnerUp: 0.62 } } : { face: high },
    );
    expect(raised.map((f) => f[1])).toEqual(["brows"]);
  });
  it("losing the face resets a cue in progress", () => {
    const fired = run(4, (t) =>
      t > CAL && t < CAL + 0.4
        ? { face: t < CAL + 0.08 ? { jawOpen: 0.8 } : null }
        : {},
    );
    expect(fired).toEqual([]);
  });
});
