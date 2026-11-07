# dpsk.github.io

Site for [Museum Wallpapers](https://nikaliuk.in/): endless public-domain paintings as your wallpaper, for
[Windows](https://github.com/dpsk/museum-wallpapers-windows), [macOS](https://github.com/dpsk/museum-wallpapers-macos) and [Omarchy](https://github.com/dpsk/omarchy-museum-wallpapers)
(listed in the [Omarchy Plugin Marketplace](https://plugins.omarchy.org/plugin.html?id=io.github.dpsk.museum-wallpapers)).

Static HTML served by GitHub Pages from `master`. The previous site lives in the `archive` branch.

## Pages

- `index.html` (English) and `ru/index.html` (Russian) are the same page; change both. Images are shared from `img/`.
- `js/site.js`, shared by both pages:
  - picks the visitor's platform: their download button goes first and stays solid, and phones get "send to my computer";
  - turns `?utm_source=` / `?ref=` (or the referring site) into the Microsoft Store campaign ID `cid=site[-ru][-source]`, so installs per channel show up in Partner Center → Acquisitions;
  - runs the copy buttons.
- GoatCounter counts clicks on every element with `data-goatcounter-click` (`get-windows-hero`, `get-mac-command`, `phone-send`, `ko-fi`, …).
- Links for posts: `https://nikaliuk.in/?ref=hn`, `?ref=reddit-windows11`, `/ru/?ref=habr`. GoatCounter shows these as campaigns.
