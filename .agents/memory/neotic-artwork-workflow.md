---
name: NEOTIC artwork workflow
description: Keep collage reference boards from reading as literal storefront backgrounds.
---

Treat supplied NEOTIC boards as source sheets, not ready-to-use page backgrounds. Extract focused hero, product, environment, and character assets, then use optimized WebP files in the storefront. Keep source PNGs outside `public/` so full-resolution originals are not shipped to visitors.

**Why:** The boards contain embedded navigation, copy, and full interface mockups. Using them as cover images put duplicate interface elements behind live page content and obscured headlines.

**How to apply:** For each visual section, crop the focal subject to the target aspect ratio, preview it at desktop and mobile sizes, and keep the render asset in `public/brand`.