# ThePlantsCompany · Home Plant Systems 🌿

A beautifully designed, fully interactive marketing site for ThePlantsCompany — smart
home plant care systems (watering, light, and soil sensing).

## Highlights

- **Animated hero** — swaying SVG plant, floating sensor chips, drifting color
  blobs, parallax leaves, and count-up stats.
- **Plant Finder quiz** — three questions (light, care level, pets) match the
  visitor with one of ten plants.
- **Filterable catalog** — twelve plants with real photos, filter chips, buy links, and a care-detail
  modal for each.
- **Live care dashboard** — drag moisture / light / humidity sliders and watch
  the plant-happiness gauge and advice respond in real time.
- **Watering calculator** — plant type × pot size × season → ml and cadence.
- **Plantscape Studio** — upload a photo of your room or yard (or pick an
  example) and beautify it two ways: **AI Beautify** sends the photo to your
  choice of Google's Gemini image model or Hugging Face (Qwen-Image-Edit via
  Inference Providers) — bring your own free key, entered in the browser and
  stored locally — for a photorealistic plant makeover, while
  **Sticker preview** composites illustrated plants instantly and offline.
  Drag plants around, compare before/after with a slider, and download the
  result. Photos stay in the browser except when AI Beautify is used.
- **Delight everywhere** — dark/light theme with saved preference, 3D-tilt
  cards with cursor glow, scroll-reveal animations, testimonial carousel,
  marquee, and a mobile burger nav. Honors `prefers-reduced-motion`.

## Running

No build step — it's hand-crafted HTML, CSS, and vanilla JavaScript.

```sh
open index.html          # or serve the folder:
python3 -m http.server   # then visit http://localhost:8000
```

## Files

| File         | Purpose                                    |
| ------------ | ------------------------------------------ |
| `index.html` | Page structure and content                 |
| `styles.css` | Design system, theming, layout, animations |
| `script.js`  | Quiz, catalog, dashboard, and interactions |
| `assets/img/` | Plant photos (see `ATTRIBUTIONS.md` for credits) |
