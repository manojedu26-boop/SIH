# DepthCarousel Validation

The opening evidence field now mounts the supplied DepthCarousel interaction instead of the previous page-scroll-linked card transforms. It uses the existing MPLADS photos as the items and passes the requested values: depth 220, spread 90, tilt 22, right tilt direction, perspective 1400, four visible cards, falloff 0.2, blur 6, autoplay, and loop. GSAP handles the 700ms power3.out position transition. The carousel supports wheel movement, pointer drag, ArrowLeft/ArrowRight navigation, previous/next controls, indicators, pause/resume, and reduced-motion fallback.

The 1280px preview shows the hero with the multi-photo depth rail, active card metadata, and controls. The 390px preview keeps the landing typography compact and leaves the signal field available below the hero without horizontal page overflow; the carousel scales to its container width. Type check and production build pass.
