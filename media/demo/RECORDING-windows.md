# Recording the Windows demo

A handoff for whoever re-records the Windows demo (a Claude Code session on the Windows machine, or a person). The goal: a recording as smooth as the Mac one (`mac-en.mp4`), with the real animations instead of the cross-fades the current `windows-*-2` cut adds in editing.

## Why the first recording looks jerky

It was captured with `gdigrab`, which copies the screen through GDI and manages only a few frames a second at 1920×1080. In the 23.5 s recording only 12 frames differ: every painting change and every card opening is a jump, and the flyout animations were lost. Desktop Duplication (`ddagrab` in FFmpeg) takes the frames the compositor already has on the GPU and keeps up at 30–60 fps.

## Setup

- Windows 11, one monitor at 1920×1080, display scale 100%.
- Settings → Accessibility → Visual effects → **Animation effects on** (without it the card has no animation to capture).
- A quiet desktop: Do Not Disturb on, no other windows, desktop icons hidden (right-click the desktop → View → Show desktop icons), only a few pinned taskbar apps.
- The Store build of Museum Wallpapers, with the landscape genre filter (no nudes), the label on, fit mode Blur.
- English recording: Windows and the app in English. Russian recording: the app's interface in Russian, so the label and the card read in Russian.
- FFmpeg 6.0 or later with `ddagrab` (the gyan.dev builds via `winget install --id Gyan.FFmpeg` should have it). Check: `ffmpeg -hide_banner -filters | findstr ddagrab`.

## Capture

Record a lossless intermediate at 60 fps; the cut and the encode come later:

```powershell
ffmpeg -hide_banner -filter_complex "ddagrab=output_idx=0:framerate=60:draw_mouse=1,hwdownload,format=bgra" -c:v libx264 -preset ultrafast -qp 0 -pix_fmt yuv444p raw-en.mkv
```

Notes from the FFmpeg docs (https://ffmpeg.org/ffmpeg-filters.html#ddagrab):

- `ddagrab` outputs D3D11 frames, so encoding with libx264 needs `hwdownload,format=bgra`. With an NVIDIA GPU `-f lavfi -i ddagrab=framerate=60 -c:v h264_nvenc -cq 12` works as well, without the download.
- `framerate` is a maximum. `dup_frames` (on by default) repeats the last frame while the desktop is idle, so the rate stays roughly constant.
- `draw_mouse` only draws a hardware cursor. If the cursor is missing in the result, check whether the pointer is hardware.
- `output_idx` is the display number in Windows minus one.

Stop with `q` in the ffmpeg window rather than killing it, so the file is closed cleanly.

## Choreography

Aim for the Mac pacing: about 15 s in all, no still hold longer than about 2 s, the card open for about 2.5 s, and the end looking like the start so the loop has no seam. Drive it with a script (PowerShell with `user32` `SetCursorPos` / `SendInput`), never by hand, so English and Russian match:

1. The first painting with its label: about 1.5 s.
2. The cursor glides to the tray icon (over about 0.6 s, eased, not teleporting) and clicks it: the card opens.
3. The card stays open for about 2.5 s. The cursor rests on **Next** for a moment, then clicks it.
4. The painting changes to the second one, then hold for about 1.5 s.
5. Open the card again for about 2 s, then close it (click the tray icon or outside the card).
6. `museum-wallpapers next` (or Next in the card) brings the third painting, then hold for about 2 s.
7. Finish on the first painting again, or plan to cross-fade the last 0.6 s into the first frame in the edit.

Pick three landscapes that read well small (the current ones: Shishkin's *Rye Fields*, Friedrich's *Seaside by Moonlight*, Bruegel's *The Hunters in the Snow*; the Russian ones are listed in [README.md](README.md)). Record a few takes and keep the cleanest.

Check that the animations were captured. The number of distinct frames should be in the hundreds, not a dozen:

```powershell
ffmpeg -hide_banner -i raw-en.mkv -vf mpdecimate,showinfo -f null - 2>&1 | findstr /c:"pts_time" | find /c /v ""
```

## Encode

The files go into `media/demo`. Take the next unused cut number (`-3` after the current `-2`) and never overwrite an existing name. Below, `IN` is the trimmed raw take and `N` the cut number.

Video for the site (H.264, 30 fps, no audio, moov at the front):

```powershell
ffmpeg -i IN -vf "fps=30,scale=1920:-2:flags=lanczos" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart -an windows-en-N.mp4
```

The poster is the first frame at 1280 px. Make it only if the first frame differs from the current `windows-<lang>.webp`. If you make one, it needs the new name too, and the site must point at it:

```powershell
ffmpeg -i windows-en-N.mp4 -frames:v 1 -vf scale=1280:-2 -quality 85 windows-en-N.webp
```

The GIF for the app README is 800 px wide at 8 fps, with one palette for the whole clip:

```powershell
ffmpeg -i windows-en-N.mp4 -filter_complex "fps=8,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" windows-en-N.gif
```

Size targets: the MP4 at about 7 MB or less (the `-2` cuts are 5.3 and 7.2 MB), the GIF at 4 MB or less. If either is over, raise the CRF by one or two, or make the GIF from a cut with shorter fades.

## Publish

1. Commit the new files under `media/demo` in this repository and update the Windows paragraph in [README.md](README.md).
2. Point the site at the new cut: `REC.windows.file` in `js/site.js` (for example `windows-%-3`), plus `REC.windows.poster` and the `poster` attribute of the video in `index.html` and `ru/index.html` if there is a new poster.
3. Push and wait until `https://nikaliuk.in/media/demo/windows-en-N.gif` loads.
4. Only then change the GIF links in the README of `dpsk/museum-wallpapers-windows` to the new names.
