// The gentleman: the top hat, the moustache, beard and sideburns you've
// got to, the nose hair and monocle when they turn up, all on the filtered
// head (FilteredHead.tsx: the SDK's canonical head fit through a spring,
// with the depth-only head occluder in the same group). A new style pops in
// as the last one goes. The pieces are in metres in the Spark AR face frame;
// FRAME turns them into canonical centimetres.
import { Suspense, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
// eslint-disable-next-line import/extensions
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useFaceInfo, useGesture } from "@vincentt-xr/sdk/tracking";

import { FACE_FPS, FilteredHead } from "./FilteredHead";
import { GestureHint } from "./GestureHint";
import { GestureInput } from "./GestureInput";
import { live } from "./live";
import { Part } from "./Part";
import { useLook } from "./state";
import { Swap } from "./Swap";
import {
  BEARDS,
  FRAME,
  MONOCLE,
  MOUSTACHES,
  NOSE_HAIR,
  SIDEBURNS,
  TOP_HAT,
} from "./styles";

/**
 * The blendshapes the pieces' face_triggers read (see rig.ts).
 */
const FACE_INPUTS = [
  "jawOpen",
  "mouthSmileLeft",
  "mouthSmileRight",
  "eyeBlinkLeft",
  "eyeBlinkRight",
  "browInnerUp",
  "browOuterUpLeft",
  "browOuterUpRight",
  "browDownLeft",
  "browDownRight",
  "noseSneerLeft",
  "noseSneerRight",
];
/** Per-second easing of the readings (higher = snappier, noisier). */
const FACE_EASE = 14;

/** Copies the face's blendshapes and roll into `live` and counts head shakes. */
const FaceSignals = () => {
  // Same options as FilteredHead's FaceTracker: the first consumer of the
  // shared face model sets its face count and rate.
  const face = useFaceInfo({ active: true, numFaces: 1, targetFps: FACE_FPS });
  const raw = useRef<Readonly<Record<string, number | undefined>>>({});
  raw.current = face?.blendshapes ?? {};
  const rawRoll = useRef(0);
  rawRoll.current = face?.pose.rotation.z ?? 0;
  // Raw blendshapes flicker a few percent frame to frame; ease toward them.
  const smooth = useRef<Record<string, number>>({});
  useFrame((_st, dt) => {
    const k = 1 - Math.exp(-FACE_EASE * Math.min(dt, 0.1));
    const out = smooth.current;
    FACE_INPUTS.forEach((name) => {
      const v = raw.current[name] ?? 0;
      out[name] = (out[name] ?? v) + (v - (out[name] ?? v)) * k;
    });
    live.blendshapes = out;
    // Roll, eased like the rest.
    live.roll += (rawRoll.current - live.roll) * k;
  }, -1);
  useGesture("headShake", {
    onBegin: () => {
      live.shakes += 1;
    },
  });
  return null;
};

/** Soft studio reflections, so hair sheen and the hat's satin read on camera. */
const useStudioLight = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    const before = scene.environment;
    scene.environment = tex;
    return () => {
      scene.environment = before;
      tex.dispose();
    };
  }, [gl, scene]);
};

export const BarberScene = () => {
  const look = useLook();
  useStudioLight();
  return (
    <>
      <FaceSignals />
      <GestureInput />
      <FilteredHead>
        <group
          name="barber-frame"
          scale={FRAME.scale}
          position={FRAME.position}
        >
          <Part part={TOP_HAT} />
          <Swap part={SIDEBURNS[look.sideburns] ?? null} />
          <Swap part={BEARDS[look.beard] ?? null} />
          <Swap part={MOUSTACHES[look.moustache] ?? null} />
          <Swap part={NOSE_HAIR[look.nose] ?? null} />
          <Swap part={look.monocle ? MONOCLE : null} />
        </group>
        <Suspense fallback={null}>
          <GestureHint />
        </Suspense>
      </FilteredHead>
    </>
  );
};
