// The barber's chair: eight moustaches, six beards, three sideburns, the
// rare nose hair, a top hat and a monocle. vincentt.studio head accessories
// (public/models/vincentt-*.glb), authored in metres in the "Complete 3D
// Reference - Spark AR" face frame (origin at the front of the face, +Y up,
// +Z out of the face) — see FRAME.

export type Part = {
  /** File name in public/models without `vincentt-` / `.glb`. */
  id: string;
  /**
   * Material swaps by name, to another material in the same file. The
   * default preset's finish is applied first.
   */
  materials?: Record<string, string>;
  /** Tints by material name (on this part's own copy of the material). */
  colors?: Record<string, string>;
  /** Fine placement: `x` / `y` / `z` canonical cm, `scale` about its middle. */
  fit?: { x?: number; y?: number; z?: number; scale?: number };
};

/** Raise your eyebrows for the next one. */
export const MOUSTACHES: readonly Part[] = [
  { id: "mustache-handlebar" },
  { id: "mustache-dali" },
  { id: "mustache-walrus" },
  { id: "mustache-fu-manchu" },
  { id: "mustache-imperial" },
  { id: "mustache-cartoon-villain" },
  { id: "mustache-painters-brush" },
  { id: "mustache-lampshade" },
];

/** Open your mouth for the next one. */
export const BEARDS: readonly Part[] = [
  { id: "beard-full" },
  { id: "beard-goatee" },
  { id: "beard-viking-braids" },
  { id: "beard-long-wizard" },
  { id: "beard-forked" },
  { id: "beard-pirate-captain" },
];

/** Tilt your head for the next one. */
// They hug the cheeks, nearly edge-on from the front: forward and a touch
// bigger so they read on camera.
const CHEEKS = { z: 1.4, scale: 1.1 };
export const SIDEBURNS: readonly Part[] = [
  { id: "mutton-chops", fit: CHEEKS },
  { id: "friendly-mutton-chops", fit: CHEEKS },
  { id: "sideburns-lamb-chops-flared", fit: CHEEKS },
];

/** The rare surprise. */
export const NOSE_HAIR: readonly Part[] = [
  // Tiny as authored: bigger, so a surprise reads on a phone.
  { id: "nasal-hair-wisps", fit: { scale: 2.2 } },
  { id: "nasal-hair-bushy-tufts", fit: { scale: 1.9 } },
  { id: "nasal-hair-absurdly-long" },
];

export const TOP_HAT: Part = { id: "top-hat" };
export const MONOCLE: Part = { id: "eye-monocle" };

export const modelUrl = (id: string) => `/models/vincentt-${id}.glb`;

/** The SDK's v3 head occluder, hosted here until the SDK CDN serves it. */
export const OCCLUDER_URL = "/models/head-occluder-v3.glb";

/** The SDK's neck-and-shoulders bust occluder (same story). */
export const NECK_OCCLUDER_URL = "/models/neck-occluder-bust-v1.glb";

/**
 * The models' frame → the SDK's canonical head frame (centimetres): ×100,
 * then the same shift the SDK used to move the Spark AR reference into the
 * canonical frame (chins and nose tips aligned; vincentt-xr-sdk
 * assets-src/head-occluder/README.md).
 */
export const FRAME = {
  scale: 100,
  position: [0, -1.03, 7.3] as const,
};
