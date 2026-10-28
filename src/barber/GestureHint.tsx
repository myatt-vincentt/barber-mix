// The only hint, wordless and in the scene: at the start, and when nobody
// has changed anything for a while, a ghost face (the SDK's
// FaceExpressionHint) appears beside the head for a moment and shows one
// move: a surprised face (brows up, mouth open: moustache and beard), a
// head tilt (sideburns) or a wink (monocle), in turn. It fades in and out
// (strict ease-out). On the filtered head, canonical cm.
import { useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import type { Group } from "three";
// eslint-disable-next-line import/extensions
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
// eslint-disable-next-line import/extensions
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  FaceExpressionHint,
  type FaceExpressionHintProps,
} from "@vincentt-xr/sdk/instructions";

import { live } from "./live";

const HINT = {
  /** Seconds after the face appears, then after the last change, before it shows. */
  first: 3,
  idle: 10,
  /** Seconds it stays (one loop of the face). */
  show: 2.8,
  /** Beside the head (cm), turned in toward the camera, and its height. */
  at: [21, 1, 0] as const,
  turn: -0.4,
  height: 10,
  /** Degrees the ghost rolls for the tilt. */
  tilt: 22,
  renderOrder: 15,
};

type Move = {
  expression: FaceExpressionHintProps["expression"];
  tilt: boolean;
};
const MOVES: readonly Move[] = [
  { expression: "surprised", tilt: false },
  { expression: { targets: { smile: 0.3 } }, tilt: true },
  { expression: "wink", tilt: false },
];

const FACE_URL = "/models/face-v1.glb";
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export const GestureHint = () => {
  // face-v1.glb is meshopt-compressed: the loader needs the decoder.
  const face = useLoader(GLTFLoader, FACE_URL, (l) =>
    l.setMeshoptDecoder(MeshoptDecoder),
  );
  const g = useRef<Group>(null);
  const tilter = useRef<Group>(null);
  const shownAt = useRef(-1);
  const seenAt = useRef(-1);
  const count = useRef(0);
  const [move, setMove] = useState(0);
  const model = useMemo(() => face.scene, [face]);

  useFrame(() => {
    const o = g.current;
    if (!o) return;
    const t = performance.now() / 1000;
    if (!live.tracked) {
      seenAt.current = -1;
      shownAt.current = -1;
      o.visible = false;
      return;
    }
    if (seenAt.current < 0) seenAt.current = t;
    const since = Math.max(live.lastAction, seenAt.current);
    const wait = live.lastAction > 0 ? HINT.idle : HINT.first;
    // Start one when it's been quiet long enough; stop at once on a change.
    if (shownAt.current < 0 && t - since > wait) {
      shownAt.current = t;
      setMove(count.current % MOVES.length);
      count.current += 1;
    }
    if (shownAt.current < 0) {
      o.visible = false;
      return;
    }
    const age = t - shownAt.current;
    if (age > HINT.show || live.lastAction > shownAt.current) {
      // Done (or someone played): wait the idle time again before the next.
      if (age > HINT.show) live.lastAction = Math.max(live.lastAction, t);
      shownAt.current = -1;
      o.visible = false;
      return;
    }
    o.visible = true;
    const fadeIn = easeOut(Math.min(1, age / 0.35));
    const fadeOut = easeOut(Math.min(1, (HINT.show - age) / 0.35));
    o.scale.setScalar(Math.max(1e-4, Math.min(fadeIn, fadeOut)));
    if (tilter.current) {
      // Tilt to one side and back, once.
      const k = Math.sin(Math.PI * Math.min(1, age / HINT.show));
      tilter.current.rotation.z = MOVES[move].tilt
        ? (k * k * HINT.tilt * Math.PI) / 180
        : 0;
    }
  });

  return (
    <group ref={g} position={HINT.at} visible={false}>
      <group ref={tilter} rotation-y={HINT.turn}>
        <FaceExpressionHint
          key={move}
          expression={MOVES[move].expression}
          model={model}
          height={HINT.height}
          orbit={0}
          renderOrder={HINT.renderOrder}
        />
      </group>
    </group>
  );
};
