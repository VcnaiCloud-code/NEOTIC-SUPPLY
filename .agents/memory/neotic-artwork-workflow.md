---
name: NEOTIC artwork workflow
description: Keep storefront art focused and preserve NEOTIC's original-character and layout constraints.
---

Treat supplied NEOTIC boards as source sheets, not ready-to-use page backgrounds. Extract focused hero, product, environment, and character assets, then use optimized WebP files in the storefront. Keep source PNGs outside `public/` so full-resolution originals are not shipped to visitors.

Preserve the existing storefront layout, branding, typography, sections, and product structure unless the user explicitly asks for a redesign. The only approved characters are NEO, VEX, RAZE, and MIKO; do not use or reference Rick & Morty or other existing characters.

**Why:** The user explicitly set the character and no-redesign constraints. The boards also contain embedded navigation, copy, and full interface mockups; using them as backgrounds can obscure live content.

**How to apply:** For each visual section, crop the focal subject to the target aspect ratio, preview it at desktop and mobile sizes, and keep optimized render assets in `public/brand`. Keep supplied source PNGs outside `public/`.