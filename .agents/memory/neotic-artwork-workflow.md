---
name: NEOTIC artwork workflow
description: Keep storefront art focused and preserve NEOTIC's original-character and layout constraints.
---

Treat supplied NEOTIC collage boards as source sheets, not ready-to-use page backgrounds. Extract focused environment and character assets, then use optimized WebP files in the storefront. Keep collage source PNGs outside `public/` so full-resolution boards are not shipped to visitors. Finished official shirt images are distinct from these reference boards.

Preserve the existing storefront layout, branding, typography, sections, and product structure unless the user explicitly asks for a redesign. The only approved characters are NEO, VEX, RAZE, and MIKO; do not use or reference Rick & Morty or other existing characters.

The user has approved HOME/HERO and its cinematic animation, THE WORLD, CHARACTERS, DROPS, ABOUT, SHOP, PRODUCT DETAIL, CART/BAG, CHECKOUT DEMO, navigation, visual system, and refined grain/noise treatment.

**Why:** The user explicitly listed these areas as already approved in the ABOUT and full-site QA briefs.

**How to apply:** Keep new section work isolated. Preserve approved areas and behavior unless the user explicitly requests a change to them.

When improving product details, preserve HOME, the completed SHOP section, and the approved shirt images unless the user explicitly requests changes to them.

**Why for product details:** The user repeatedly separated product-detail improvements from the storefront and explicitly prohibited changes to HOME, SHOP, and shirt images.

The current NEO TEE product-detail design is approved. Finalization and functional fixes must preserve its typography, spacing, colors, layout, animations, and overall aesthetic across all four products.

**Why for the approved design:** The user explicitly said the current NEO TEE page looks good and requested full testing without a redesign.

**How to apply:** Limit finalization changes to demonstrated functional defects; do not visually restyle the product-detail experience without a new request.

HERO performance refinements must preserve the approved composition, four characters, typography, logo, colors, CTA, background, and subtle static grain. Mouse/cursor parallax and continuous floating are no longer wanted.

**Why for HERO motion:** The user reported stutter during pointer movement, character appearances, section handoffs, and returns, and explicitly prioritized responsiveness over additional motion while keeping the visual design approved.

**How to apply:** Keep only the initial cinematic reveal and a simple shared transform/opacity handoff. Returns must show the settled composition immediately, never replay or resume heavy entrances. Do not add replacement cursor effects, continuous loops, or new grain. Preserve other sections unless separately requested.

Performance work may serve responsive derivatives, but the original approved transparent artwork remains canonical and must not be overwritten.

**Why for image optimization:** The user requested smaller images without replacing the artwork or changing the visual identity. Lossless full-resolution copies preserve visible pixels; responsive sizes reduce thumbnail decoding work.

**How to apply:** Generate new derivatives from the original artwork, preserve alpha, and verify full-resolution visual pixel equality. Keep original image data and URLs available rather than changing the product catalog to a new design.

The desired finish is “90% clean / sharp editorial, 10% subtle cinematic texture,” like a premium fashion campaign rather than a VHS filter.

**Why for the visual finish:** The user said excessive grain was reducing perceived sharpness and premium quality throughout the site.

**How to apply:** Keep any remaining texture static and background-only, never over artwork, typography, logos, or controls. Disable unnecessary mobile noise; preserve the palette and existing cinematic lighting rather than compensating with extra blur or glow.

Cart QA must preserve the current dark drawer design, typography, spacing, cyan accent, and animations. Demo checkout is permitted, but real payment processing must remain inactive; do not add payment or shipping providers unless the user explicitly requests them.

**Why for cart QA:** The user explicitly prohibited a cart redesign and payment integration, then requested a first checkout implementation limited to test/demo orders.

**How to apply:** Fix demonstrated cart behavior issues without restyling the drawer. Demo orders must clearly state no real payment or fulfillment occurred, and must never request card details.

The official SHOP collection is NEO TEE (001, BLACK), VEX TEE (002, WHITE), RAZE TEE (003, WHITE), and MIKO TEE (004, WHITE). Use the user's finished shirt images as product artwork, not generated replacements, generic tees, collages, or character cutouts composited onto shirts.

**Why:** The user explicitly set the character and no-redesign constraints. The boards also contain embedded navigation, copy, and full interface mockups; using them as backgrounds can obscure live content.

**Why for SHOP:** The user identified the four supplied shirt images as NEOTIC SUPPLY's official products and requested replacement, not additions alongside the older products.

**How to apply:** For artwork extracted from reference boards, crop the focal subject to the target aspect ratio, preview it at desktop and mobile sizes, and keep optimized render assets in `public/brand`. Keep collage source PNGs outside `public/`. Preserve the supplied finished shirt designs in SHOP.