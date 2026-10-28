# Plan — Barber Mix

A silly gentleman maker: your face is the barber. Built on SDK 2.0.0-alpha.9 with the
vincentt.studio head accessories.

## Design

- A top hat is always on. You start clean-shaven with a handlebar moustache.
- Raise your eyebrows for the next moustache (8), open your mouth for the next beard (6), tilt your
  head for the next sideburns (3). Each steps through a fixed order, round and round.
- Now and then (about one change in twelve) nose hair sprouts for a few seconds, then shrinks back.
- A wink pops a monocle in for a moment.
- No overlay: at the start and when idle, a small 3D ghost face beside the head shows one move.

## How it works

- `styles.ts`: the pieces and their fit (the two small nose hairs are scaled up; the sideburns are
  brought forward so they read from the front).
- `Part.tsx`: loads a piece (shared cache), applies its default preset's finish, plays its idle
  loops, mirrors the face through its authored face triggers (`rig.ts`), wobbles on a head shake,
  pops in and shrinks away. `Swap.tsx`: the new style pops in as the old one shrinks away.
- `FilteredHead.tsx` + `headFilter.ts` (unit-tested): the SDK's canonical head fit through a
  speed-adaptive critically damped spring, the depth-only v3 head occluder in the same group, the
  SDK's `NeckOccluder` in the face tracker. Face model 20 Hz.
- `gestures.ts` (unit-tested): brows, mouth and wink are read against your own calm face (learned
  in the first 1.5 s, and slowly after); a cue fires when it holds for a moment and must let go
  before firing again. A wink is one eye shut with the other open. The tilt is a 15° head roll.
- `GestureInput.tsx`: the cues step the look (`state.ts`), roll the nose-hair chance and time the
  nose hair (3.2 s) and the monocle (2.6 s).
- `GestureHint.tsx`: the SDK's `FaceExpressionHint` (`face-v1.glb`) beside the head 3 s after the
  face appears and then after every 10 s without a change, showing a surprised face, a head tilt or
  a wink in turn.
- Dev only: `DevKeys.tsx` (M / B / S step, N nose hair, O monocle, `window.__barber`),
  `DevMediaSwitcher.tsx`, `?occ`.

## Known limits

- A surprised face (brows up and mouth open) changes the moustache and the beard together.
- The sideburns sit on the sides of the face, so they show best with the head turned a little.
