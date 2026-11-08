# Demo recordings

One recording per platform and language, named `<platform>-<lang>[-<n>].<ext>`:

- platform: `windows`, `mac`, `omarchy`
- lang: `en`, `ru`
- n: the cut, from `-2` on; the first cut has none (see the last paragraph)
- `.mp4`: H.264, no audio, 1440–1920 px wide, 14–25 s; for the site (`<video muted loop playsinline>`, played by script while on screen).
- `.webp`: the first frame, 1280 px wide; the video's poster on the site (and all a visitor with reduced motion sees until they press play).
- `.gif`: 800 px wide, 8 fps; for the app READMEs, which link here so the GIFs stay out of the app repositories.

The Omarchy recordings use a landscape-genre filter (no nudes) and have the top bar cropped out; the Mac ones are the recordings from the macOS repository (screenshots/demo-*.mp4), with the GIFs re-encoded to the size above.

The Windows ones (23.5 s, 1920×1080) use the same landscape filter and were recorded on Windows 11 with ffmpeg (gdigrab) while a script drove the Store app: a second launch opens its card, `museum-wallpapers next` switches the painting. English: Ivan Shishkin's *Rye Fields* → Caspar David Friedrich's *Seaside by Moonlight* → Pieter Bruegel the Elder's *The Hunters in the Snow*. Russian: Шишкин, «Утро в сосновом лесу» → Ван Гог, «Луковичные поля» → Моне, «Лавакур под снегом».

The `-2` cuts of Windows and Omarchy (about 15 s, like the Mac ones) are edits of those recordings. Omarchy keeps every real transition and card animation at real speed and only shortens the still holds (to 1.4 s, 2.4 s with the card open), with a fade across the loop seam. The Windows recording has no motion between its states (gdigrab missed the animations), so it is rebuilt from five stills of it (the first painting, its card, the second, its card, the third) with 0.2 s fades for the card and 0.6 s cross-fades between paintings (0.4 s in the GIF, to keep it under 4 MB). The posters are still the first-cut ones: the first frame is the same. A better Windows recording, captured with Desktop Duplication, is described in [RECORDING-windows.md](RECORDING-windows.md).

The `-3` cuts of Windows (17.6 s, 1920×1080, 30 fps) replace the `-2` ones: new takes with Desktop Duplication, as [RECORDING-windows.md](RECORDING-windows.md) describes, with the real card and cursor motion. Each is one 24 s take at 60 fps with the still holds shortened in the edit (to 1–1.5 s, 1–1.3 s with the card open) and a 0.6 s fade across the loop seam. English: John Constable's *Weymouth Bay* → his *Wivenhoe Park* → Claude Monet's *Houses on the Achterzaan*. Russian: Моне, «Пруд в Аржантёе» → Фридрих, «Одинокое дерево» → Моне, «Сорока». They have their own posters (`windows-<lang>-3.webp`).

Never replace a published file under the same name: GitHub's image proxy caches it. Publish a new name (the next `-<n>`) instead, and point the site at it (`REC` in `js/site.js`) and the app README at the new GIF.
