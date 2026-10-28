// Scene.tsx — Barber Mix: a silly gentleman maker. Raise your eyebrows for
// the next moustache, open your mouth for the next beard, tilt your head
// for the next sideburns; wink for a monocle, and now and then, nose hair.
// See PLAN.md.
import { lazy, Suspense } from "react";

import { BarberScene } from "./barber/BarberScene";

// Dev-only helpers for previewing without a camera. Lazy and behind a
// constant esbuild folds to false in production. Two rules:
// `process.env.NODE_ENV`, not `import.meta.env.DEV` (vincentt-xr/v2-template#112);
// and write the check INSIDE the ternary — hoisted into a `const`, esbuild
// keeps the dead branch.
const DevMediaSwitcher =
  process.env.NODE_ENV !== "production"
    ? lazy(() => import("./DevMediaSwitcher"))
    : null;
const DevKeys =
  process.env.NODE_ENV !== "production"
    ? lazy(() => import("./barber/DevKeys"))
    : null;

export const Scene = () => (
  <>
    <BarberScene />
    {DevMediaSwitcher && DevKeys ? (
      <Suspense fallback={null}>
        <DevMediaSwitcher />
        <DevKeys />
      </Suspense>
    ) : null}
  </>
);
