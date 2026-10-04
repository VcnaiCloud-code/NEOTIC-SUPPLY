---
name: Browser motion verification
description: Desktop pointer capability limits in the automated browser used for NEOTIC motion checks.
---

Do not assume a desktop-sized automated browser exposes fine-pointer or hover capabilities. The browser runtime has reported neither capability even in a fresh non-mobile, non-touch context.

**Why:** Hero verification could check layouts, navigation, reduced motion, and commerce, but could not activate the native media-query gates for desktop mouse parallax, custom cursor, or CSS hover.

**How to apply:** Check native pointer/hover media capabilities before claiming those effects were browser-verified. Do not spoof matchMedia or weaken production accessibility/device gates just to make a test pass. If the runtime still lacks those capabilities, state the verification limit explicitly.