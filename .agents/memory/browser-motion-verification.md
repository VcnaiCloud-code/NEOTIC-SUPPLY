---
name: Browser motion verification
description: Native pointer capability and actual artwork visibility limits in browser motion checks.
---

Do not assume a desktop-sized automated browser exposes fine-pointer or hover capabilities. The browser runtime has reported neither capability even in a fresh non-mobile, non-touch context.

**Why:** Hero verification could check layouts, navigation, reduced motion, and commerce, but could not activate the native media-query gates for desktop mouse parallax, custom cursor, or CSS hover.

**How to apply:** Check native pointer/hover media capabilities before claiming those effects were browser-verified. Do not spoof matchMedia or weaken production accessibility/device gates just to make a test pass. If the runtime still lacks those capabilities, state the verification limit explicitly.

A loaded image and positive, fully in-viewport bounds do not prove the artwork is visible or can trigger an IntersectionObserver.

**Why:** A collapsed ancestor reveal mask kept loaded artwork invisible even when its bounding rectangle was fully on screen; intersection uses clipped geometry, unlike the reported layout bounds.

**How to apply:** Observe an unmasked wrapper for zero-area clip-path reveals. Verify settled rendered artwork rather than treating asset completion or layout bounds as proof of visible paint.