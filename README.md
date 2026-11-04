# swatigupta-site

Source for Swati Gupta's personal website (swatigupta.info).

- **Canonical:** `main` is the live site. Vercel (team swatiiidotcom, project swatigupta-site) deploys every push to `main`.
- **Status:** prototype of the desk (draggable objects) and the folder-tab
  sections. Objects are drawn SVG placeholders until real photos arrive. Draft copy and audit live in
  `../second-brain/inbox/drafts/2026-10-12-website-refresh.md`.
- **Domain:** swatigupta.info still points at Wix until launch.
- **Commits:** personal email (gupta71swati@gmail.com), not the Heron one.

## Structure

- `index.html`: the desk objects (inline SVG) and the folder panels
- `css/site.css`: all styles; palette and fonts are tokens at the top
- `js/desk.js`: drop-in, drag, throw, parallax and shadow loop for the objects
- `js/files.js`: folder tabs, results postcard flip, dot chart

Preview locally: `python3 -m http.server 4321` in this folder, then open
http://127.0.0.1:4321.

Images: only her own photos or public-domain / free-licence images. Never
Pinterest or other copyrighted images (the repo is public).
