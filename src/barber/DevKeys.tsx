// Dev only: M / B / S step the moustache, beard and sideburns, N cycles the
// nose hair (and off), O toggles the monocle; window.__barber exposes the
// store and the live face readings for debugging. Scene.tsx lazy-imports
// this behind an inline NODE_ENV check, so it never reaches production.
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

import { live } from "./live";
import { getLook, lookActions } from "./state";
import { NOSE_HAIR } from "./styles";

const DevKeys = () => {
  const scene = useThree((st) => st.scene);
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__barber = {
      actions: lookActions,
      get: getLook,
      live,
      scene,
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "m") lookActions.next("moustache");
      else if (e.key === "b") lookActions.next("beard");
      else if (e.key === "s") lookActions.next("sideburns");
      else if (e.key === "n") {
        const n = getLook().nose + 1;
        lookActions.nose(n >= NOSE_HAIR.length ? -1 : n);
      } else if (e.key === "o") lookActions.monocle(!getLook().monocle);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene]);
  return null;
};

export default DevKeys;
