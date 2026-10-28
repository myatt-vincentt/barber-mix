// The gestures, every frame: raised brows step the moustache, an open mouth
// the beard, a head tilt the sideburns (gestures.ts reads them), each change
// with a one-in-twelve chance of nose hair, which shrinks back after a few
// seconds. A wink brings the monocle in for a moment.
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { gestureState, stepGestures, type Cue } from "./gestures";
import { live } from "./live";
import { getLook, lookActions, type Slot } from "./state";

const SLOT: Record<Exclude<Cue, "wink">, Slot> = {
  brows: "moustache",
  mouth: "beard",
  tilt: "sideburns",
};

/** Seconds the nose hair and the monocle stay. */
export const NOSE_STAY = 3.2;
export const MONOCLE_STAY = 2.6;

export const GestureInput = () => {
  const state = useRef(useMemo(gestureState, []));
  const noseAt = useRef(0);
  const monocleAt = useRef(0);

  useFrame(() => {
    const t = performance.now() / 1000;
    const face = live.tracked ? (live.override ?? live.blendshapes) : null;
    const { state: next, fired } = stepGestures(
      state.current,
      t,
      face,
      live.roll,
    );
    state.current = next;
    fired.forEach((cue) => {
      live.lastAction = t;
      if (cue === "wink") {
        lookActions.monocle(true);
        monocleAt.current = t;
      } else if (lookActions.change(SLOT[cue])) noseAt.current = t;
    });
    const look = getLook();
    if (look.nose >= 0 && noseAt.current === 0) noseAt.current = t;
    if (look.nose >= 0 && t - noseAt.current > NOSE_STAY) {
      lookActions.nose(-1);
      noseAt.current = 0;
    }
    if (look.monocle && monocleAt.current === 0) monocleAt.current = t;
    if (look.monocle && t - monocleAt.current > MONOCLE_STAY) {
      lookActions.monocle(false);
      monocleAt.current = 0;
    }
  });
  return null;
};
