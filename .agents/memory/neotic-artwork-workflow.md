---
name: NEOTIC artwork workflow
description: Keep storefront art focused and preserve NEOTIC's original-character and layout constraints.
---

Treat supplied NEOTIC collage boards as source sheets, not ready-to-use page backgrounds. Extract focused environment and character assets, then use optimized WebP files in the storefront. Keep collage source PNGs outside `public/` so full-resolution boards are not shipped to visitors. Finished official shirt images are distinct from these reference boards.

Preserve the existing storefront layout, branding, typography, sections, and product structure unless the user explicitly asks for a redesign. The only approved characters are NEO, VEX, RAZE, and MIKO; do not use or reference Rick & Morty or other existing characters.

When improving product details, preserve HOME, the completed SHOP section, and the approved shirt images unless the user explicitly requests changes to them.

**Why for product details:** The user repeatedly separated product-detail improvements from the storefront and explicitly prohibited changes to HOME, SHOP, and shirt images.

The current NEO TEE product-detail design is approved. Finalization and functional fixes must preserve its typography, spacing, colors, layout, animations, and overall aesthetic across all four products.

**Why for the approved design:** The user explicitly said the current NEO TEE page looks good and requested full testing without a redesign.

**How to apply:** Limit finalization changes to demonstrated functional defects; do not visually restyle the product-detail experience without a new request.

Cart QA must preserve the current dark drawer design, typography, spacing, cyan accent, and animations. Keep checkout inactive and do not add payment providers unless the user requests activation.

**Why for cart QA:** The user explicitly prohibited a cart redesign and payment integration during final shopping-bag verification.

**How to apply:** Fix demonstrated cart behavior issues without restyling the drawer, and keep the message "Checkout is not active yet. No payment will be collected."

The official SHOP collection is NEO TEE (001, BLACK), VEX TEE (002, WHITE), RAZE TEE (003, WHITE), and MIKO TEE (004, WHITE). Use the user's finished shirt images as product artwork, not generated replacements, generic tees, collages, or character cutouts composited onto shirts.

**Why:** The user explicitly set the character and no-redesign constraints. The boards also contain embedded navigation, copy, and full interface mockups; using them as backgrounds can obscure live content.

**Why for SHOP:** The user identified the four supplied shirt images as NEOTIC SUPPLY's official products and requested replacement, not additions alongside the older products.

**How to apply:** For artwork extracted from reference boards, crop the focal subject to the target aspect ratio, preview it at desktop and mobile sizes, and keep optimized render assets in `public/brand`. Keep collage source PNGs outside `public/`. Preserve the supplied finished shirt designs in SHOP.