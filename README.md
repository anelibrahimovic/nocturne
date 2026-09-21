# Full of Memories — Drift Build

A lightweight cinematic fan experience designed around drifting through Anakin Skywalker and Padmé Amidala memories.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Required media

Create `assets/` and add your own licensed/personal-use media:

### Music
- `tiktok-soundtrack.mp3`

### Video memories
- `clip-01.mp4`
- `clip-02.mp4`
- `clip-03.mp4`
- `clip-04.mp4`
- `clip-05.mp4`
- `clip-06.mp4`

### Optional posters
- `poster-01.webp`
- `poster-02.webp`
- `poster-03.webp`
- `poster-04.webp`
- `poster-05.webp`
- `poster-06.webp`

If a clip is missing, the site shows a cinematic color fallback instead of breaking.

## Performance changes

This rebuild removes Three.js and GSAP. It uses:
- one 2D canvas
- one requestAnimationFrame loop
- fewer than 500 stars on desktop
- fewer than 300 stars on mobile
- only the nearest memory video playing
- capped canvas pixel ratio
- CSS transforms instead of layout-heavy animation

## Audio

Browsers block autoplay audio. The opening **Enter the memories** button starts the soundtrack after the required user gesture.

The TikTok link itself cannot be used as a direct audio file URL. Put the audio file you have permission to use at `assets/tiktok-soundtrack.mp3`.
