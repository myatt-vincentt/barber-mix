# dev-media

Optional dev-only preview media. Nothing here ships: only
`src/DevMediaSwitcher.tsx` reads this folder, and it is stripped from
production builds.

You don't need anything here. Without a webcam, `pnpm dev` starts on the SDK's
built-in "Person Shaking Head" video and lists every SDK sample video and
image. In development M, B and S step the moustache, beard and sideburns, N
cycles the nose hair and O toggles the monocle.

To preview with your own clip, add it at `dev-media/barber.mp4` (H.264 MP4); it
is listed first and used as the start. A clip with room above the head shows
the whole top hat. Clips here are git-ignored. Restart `pnpm dev` after adding
or removing one.
