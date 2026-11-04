# swatigupta-site

Source for Swati Gupta's personal website (swatigupta.info).

- **Canonical:** `main` is the live site. Vercel (team swatiiidotcom, project swatigupta-site) deploys every push to `main`.
- **Status:** prototype. The three hero objects are drawn SVG placeholders. Draft copy and audit live in
  `../second-brain/inbox/drafts/2026-10-12-website-refresh.md`.
- **Domain:** swatigupta.info still points at Wix until launch.
- **Commits:** personal email (gupta71swati@gmail.com), not the Heron one.

## Structure

- `index.html`: one page in four parts: hero (portrait, name, three moveable
  objects), About (paragraph, photo stack, NYC route map of the resume), a
  Highlights folder of dossiers, and Say hi
- `css/site.css`: all styles; palette and fonts are tokens at the top
- `js/desk.js`: drop-in, drag, throw, parallax and shadow loop for the hero objects
- `js/site.js`: scroll reveals, the map trail and pins, the folder opening,
  the dossier switcher, the results postcard
- `img/`: Swati's own photos, cropped so only she is in frame

Preview locally: `python3 -m http.server 4321` in this folder, then open
http://127.0.0.1:4321.

Images: only her own photos or public-domain / free-licence images. Never
Pinterest or other copyrighted images (the repo is public).
