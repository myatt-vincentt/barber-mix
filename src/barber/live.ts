// Live face readings, written every frame by FaceSignals (no re-renders).
export const live = {
  blendshapes: {} as Readonly<Record<string, number | undefined>>,
  /** A face is being tracked (FilteredHead). */
  tracked: false,
  /** Head roll, radians (+ = toward the person's own left shoulder). */
  roll: 0,
  /** When (performance.now() s) a gesture last changed something; 0 = never. */
  lastAction: 0,
  /** Bumps on each head shake: the pieces play their wobble. */
  shakes: 0,
  /** Dev only (window.__barber): stands in for the face's readings. */
  override: null as Readonly<Record<string, number | undefined>> | null,
};
