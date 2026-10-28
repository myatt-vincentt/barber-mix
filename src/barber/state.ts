// What's on your face: one moustache, one beard, one pair of sideburns, and
// now and then nose hair and a monocle. One small store for the scene, the
// input and the dev keys.
import { useSyncExternalStore } from "react";

import { BEARDS, MOUSTACHES, NOSE_HAIR, SIDEBURNS } from "./styles";

export type Look = {
  /** Indices into MOUSTACHES, BEARDS, SIDEBURNS (−1 = clean-shaven). */
  moustache: number;
  beard: number;
  sideburns: number;
  /** Index into NOSE_HAIR, −1 = none (it's a rare surprise). */
  nose: number;
  monocle: boolean;
};

export type Slot = "moustache" | "beard" | "sideburns";

const SIZES: Record<Slot, number> = {
  moustache: MOUSTACHES.length,
  beard: BEARDS.length,
  sideburns: SIDEBURNS.length,
};

let current: Look = {
  moustache: 0,
  beard: -1,
  sideburns: -1,
  nose: -1,
  monocle: false,
};
const listeners = new Set<() => void>();

const set = (next: Look) => {
  current = next;
  listeners.forEach((l) => l());
};

export const getLook = () => current;

export const useLook = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getLook,
    getLook,
  );

/** About one change in this many brings the nose hair out. */
export const NOSE_CHANCE = 12;

export const lookActions = {
  /** The next style in a slot (in order, round and round; from clean-shaven, the first). */
  next(slot: Slot) {
    set({ ...current, [slot]: (current[slot] + 1) % SIZES[slot] });
  },
  /**
   * A gesture's change: the next style in `slot`, and now and then (one in
   * NOSE_CHANCE) a nose hair sprouts too. Returns whether it did.
   */
  change(slot: Slot, random: () => number = Math.random) {
    lookActions.next(slot);
    if (current.nose >= 0 || random() * NOSE_CHANCE >= 1) return false;
    lookActions.nose(Math.floor(random() * NOSE_HAIR.length));
    return true;
  },
  /** Nose hair `i` (−1 = none). */
  nose(i: number) {
    if (i !== current.nose)
      set({ ...current, nose: i < 0 ? -1 : i % NOSE_HAIR.length });
  },
  monocle(on: boolean) {
    if (on !== current.monocle) set({ ...current, monocle: on });
  },
  /** Dev: a whole look at once. */
  set(look: Partial<Look>) {
    set({ ...current, ...look });
  },
};
