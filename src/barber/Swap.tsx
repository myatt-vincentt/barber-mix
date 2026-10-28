// One slot's piece, swapped with a little life: the new style pops in while
// the old one shrinks away (Part's `leaving`), and a piece that goes (the
// nose hair, the monocle) shrinks back instead of vanishing. The same Part
// instance carries on into leaving, so nothing jumps.
import { useEffect, useState } from "react";

import { LEAVE, Part } from "./Part";
import type { Part as PartSpec } from "./styles";

export const Swap = ({ part }: { part: PartSpec | null }) => {
  const [current, setCurrent] = useState(part);
  const [gone, setGone] = useState<PartSpec | null>(null);
  // A new part: the old one starts leaving (set during render, so the same
  // keyed instance turns into the leaving one without a frame between).
  if (part !== current) {
    setGone(current);
    setCurrent(part);
  }
  useEffect(() => {
    if (!gone) return undefined;
    const id = window.setTimeout(() => setGone(null), LEAVE * 1000 + 80);
    return () => window.clearTimeout(id);
  }, [gone]);
  return [
    gone && gone !== part ? <Part key={gone.id} part={gone} leaving /> : null,
    part ? <Part key={part.id} part={part} /> : null,
  ];
};
