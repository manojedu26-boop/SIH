# MPLAD Sentinel — Design Brainstorm

## Approach 1 — Civic Signal Atlas

**Theme Name:** Civic Signal Atlas

**Very Brief Intro:** A dark cartographic intelligence interface that turns public expenditure data into an investigative field guide. It feels precise, accountable, and quietly urgent rather than sensational.

**Probability:** 0.07

## Approach 2 — Monsoon Ledger

**Theme Name:** Monsoon Ledger

**Very Brief Intro:** A warm editorial data-journalism direction inspired by stamped government ledgers, monsoon maps, and archive paper. It makes transparency feel human, grounded, and legible to a broad public audience.

**Probability:** 0.03

## Approach 3 — Electric Audit Room

**Theme Name:** Electric Audit Room

**Very Brief Intro:** A high-contrast investigation room with luminous data traces, kinetic particles, and a cinematic evidence-reveal rhythm. It is built for a hackathon demo where suspicious patterns must feel immediate and memorable.

**Probability:** 0.08

# Chosen Direction — Civic Signal Atlas

## Design Movement
Contemporary data journalism fused with Swiss International Typographic Style and a restrained cartographic systems aesthetic.

## Core Principles
1. **Evidence before spectacle:** Every visual flourish must support the user's understanding of a signal, risk score, or investigation path.
2. **Asymmetric editorial hierarchy:** The layout behaves like a briefing room, with a strong left narrative rail, offset evidence cards, and deliberate visual tension instead of a generic centered marketing grid.
3. **Public-sector precision with human warmth:** Structured typography and chart-like geometry are softened with ember accents, paper-like surfaces, and plain-language explanations.
4. **Motion as discovery:** Scroll and hover reveal context progressively, mimicking how an analyst moves from system overview to a single suspicious record.

## Color Philosophy
The base is a near-black ink (`#0B1118`) that makes the experience feel like an active investigation rather than a static report. Signal coral (`#FF5C68`) marks attention and possible irregularity, while a high-visibility pink glow (`#FF2DAA`) is reserved for hero motion and active focus. Ice blue (`#B9D7E9`) carries trustworthy system telemetry; bone (`#EEF0EA`) carries the document's public-facing editorial voice. The palette intentionally separates **evidence**, **attention**, and **action** instead of using one generic accent for everything.

## Layout Paradigm
A full-bleed hero with a split command rail: narrative copy occupies the left third, while the right side contains a rotating 3D signal carousel and a glowing audit field. Below it, sections alternate between wide evidence bands and offset two-column investigation modules. Cards are shallow and rectangular with clipped corners and fine rules, echoing a government data sheet without looking bureaucratic.

## Signature Elements
- A thin pink **signal bar** that appears as an active system trace between hero layers.
- A rotating constellation of **district/project nodes** with particle trails, replacing generic abstract blobs.
- Small **evidence stamps** using uppercase labels such as `RULE FIRED`, `SOURCE TRACE`, and `REVIEW QUEUE`.

## Interaction Philosophy
Interactions should feel like querying a live evidence system. Buttons expose the next layer of context; hover targets receive a precise cursor frame; cards lift minimally and reveal an explanatory line rather than a decorative effect. Every CTA should either jump to evidence, start a walkthrough, or make the risk model more understandable.

## Animation
The hero uses a slow 3D carousel rotation with a pink glow bar and low-density particles. The first text reveal is a blur-to-sharp transition layered over a muted full-screen video-like field; where no external video asset is used, a CSS-driven moving grain and radial field provide the same atmosphere. ScrollExpand is used for the flagship evidence image so the interface moves from framed briefing to full-bleed investigation. Motion is disabled or simplified under `prefers-reduced-motion`.

## Typography System
Display: **Space Grotesk** in 600–700 weights for headlines, risk scores, and high-confidence labels. Body: **DM Sans** in 400–500 for explanations and navigation. Metadata: Space Grotesk 600 with generous tracking, all caps, and compact line height. Headlines use tight negative tracking; body copy uses a comfortable 1.6 line height. Avoid centered paragraphs except for short hero statements.

## Brand Essence
**MPLAD Sentinel is an explainable civic intelligence layer for investigators, journalists, and citizens who need to see not only where public funds moved, but where the story stops making sense.**

Personality: **watchful, exacting, constructive**.

## Brand Voice
Headlines are direct, evidence-led, and slightly cinematic without becoming alarmist. CTAs sound like investigative actions, not SaaS growth prompts.

Example lines:
- “Find the projects that don’t add up.”
- “Trace every flag back to the rule that fired.”

## Wordmark & Logo
The mark is a compact sentinel glyph built from two offset brackets around a central dot: the brackets represent a review frame, and the dot represents the one record worth examining. The wordmark uses a custom-spaced uppercase `MPLAD` paired with a lighter `SENTINEL` label; the symbol should appear independently as the favicon and as a large hero watermark.

## Signature Brand Color
**Signal Coral — `#FF5C68`**. It is warmer and more civic than warning red, noticeable against ink backgrounds, and ownable as the visual shorthand for “attention required.”

## File-Level Style Reminder
Every CSS, component, and page file created for this project should preserve the Civic Signal Atlas direction: ink field, bone editorial surfaces, coral evidence accents, asymmetric briefing-room composition, cartographic geometry, and motion that reveals rather than decorates.

## React Bits Adaptation Note
The requested Hero 7 and Hero 9 blocks are Pro registry assets whose public docs expose only locked placeholder source. The project will still follow the requested interaction intent with an original implementation: Hero 7 becomes the rotating project-signal carousel with particles and pink signal bar; Hero 9 becomes the full-screen investigative reveal with blur-to-sharp copy and moving atmospheric field. The provided ScrollExpand and TargetCursor sources are integrated as supporting interactions.

## Style Decisions

- Evidence surfaces use squared or clipped audit-sheet geometry, fine rules, stamps, and cartographic marks; avoid soft rounded SaaS cards, heavy shadows, and decorative glassmorphism.
- Signal Coral `#FF5C68` is reserved for attention, risk, rule-fired labels, and investigative actions; Pink Glow `#FF2DAA` appears only in active scan/focus states, while Ice Blue `#B9D7E9` carries telemetry and neutral system trust.
- MPLAD Sentinel is always the primary product voice and visual identity; external systems such as eSAKSHI are referenced as sources or inputs, never as competing hero-level brands.
- The sentinel glyph recurs as an audit-frame motif in navigation, active scan state, and evidence metadata.
