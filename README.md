# NOCTURNE

A lightweight, scroll-driven metamorphosis experience.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

No build step or framework is required. The butterfly is rendered as a detailed SVG with GPU-friendly CSS transforms, while scroll animation is driven through requestAnimationFrame to avoid layout thrashing.
