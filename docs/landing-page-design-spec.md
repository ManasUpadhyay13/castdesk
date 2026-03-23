# CastDeck Landing Page — Design Specification

## Global

| Property | Value |
|----------|-------|
| Background | `#0a0a0a` (zinc-950) |
| Text primary | `#fafafa` (zinc-50) |
| Text secondary | `#a1a1aa` (zinc-400) |
| Text muted | `#71717a` (zinc-500) |
| Border | `#27272a` at 50% opacity |
| Primary accent | `#fafafa` (white — used sparingly) |
| Font | Inter, -apple-system, sans-serif |
| Max content width | `1152px` (max-w-6xl) |
| Page padding | `16px` mobile, `24px` tablet+ |
| Section spacing | `96px` vertical padding between sections |
| Border radius | Cards: `12px`, Buttons: `6px`, Avatars: `12px`, Badges: `9999px` (full) |

---

## Section 1: Navbar (fixed, sticky)

**Dimensions:** Full width, `56px` height, `z-50`
**Background:** `#0a0a0a` at 80% opacity + `backdrop-blur(12px)` — content underneath bleeds through subtly
**Border:** 1px bottom, `#27272a` at 50%

**Layout:** Flexbox, space-between, max-w `1152px` centered

| Element | Left | Center | Right |
|---------|------|--------|-------|
| Logo | `28px` square, white bg, rounded `6px`, Mic2 icon inside (dark) + "CastDeck" text `14px` semibold | Nav links (desktop only): "How it works", "Investors", "Pricing" — `14px`, zinc-400, hover→white | "Sign in" ghost button + "Get Started" filled button |

**Responsive:** Nav links hidden on mobile (`md:flex`). Buttons always visible.

**Animation:**
- On scroll past 100px: navbar gets a subtle `box-shadow: 0 1px 3px rgba(0,0,0,0.3)` — transition `300ms`
- Nav links: `color` transition `150ms` on hover

---

## Section 2: Hero

**Spacing:** `padding-top: 128px` (clears fixed navbar + breathing room), `padding-bottom: 96px`
**Overflow:** `hidden` (clips ambient glows)

### Background effects (3 layers, `aria-hidden`, `pointer-events: none`)

| Layer | Size | Position | Color | Blur |
|-------|------|----------|-------|------|
| Center glow | `600px` circle | Centered vertically in section | `rgba(250,250,250, 0.05)` | `120px` |
| Left accent | `400px` circle | Top, 25% from left | `rgba(139,92,246, 0.05)` (violet) | `100px` |
| Right accent | `300px` circle | Top-right, 75% from left | `rgba(59,130,246, 0.04)` (blue) | `80px` |

**Animation:** All three glow layers should have a slow breathing animation:
```css
@keyframes ambient-breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}
/* Duration: 8s, 10s, 12s respectively — staggered for organic feel */
```

### Badge (above headline)
- Pill shape, outline border `#27272a` at 60%
- Sparkles icon (12px) + "AI-powered pitch practice" text
- `12px` font, `500` weight, zinc-400
- `margin-bottom: 24px`

**Animation:** Fade in + slide up `12px` on page load, `600ms`, `ease-out`, `delay: 100ms`

### Headline
- **Size:** `60px` desktop / `48px` tablet / `36px` mobile
- **Weight:** `800` (extra bold)
- **Letter spacing:** `-0.03em` (tight)
- **Line height:** `1.1`
- **Color:** white
- **Gradient text** on "AI investors": `background: linear-gradient(to right, #fafafa, rgba(250,250,250,0.8), #a1a1aa)` with `background-clip: text`
- `text-wrap: balance`
- `margin-bottom: 24px`

**Animation:** Fade in + slide up `20px`, `700ms`, `ease-out`, `delay: 200ms`. The gradient text should have a subtle shimmer:
```css
@keyframes gradient-shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
/* background-size: 200% auto, duration: 6s, infinite */
```

### Subtitle
- `18px`, zinc-400, `line-height: 1.6`, `max-width: 672px`, centered
- `text-wrap: balance`
- `margin-bottom: 40px`

**Animation:** Fade in, `600ms`, `delay: 400ms`

### CTA Buttons (flex row, `gap: 12px`)

| Button | Style | Size |
|--------|-------|------|
| "Try Free Demo" | Outline — border `#27272a` at 60%, transparent bg, white text, hover: border brightens | `height: 44px`, `padding: 0 32px` |
| "Get Started →" | Filled — white bg, dark text, hover: `rgba(250,250,250,0.9)` | Same. Arrow icon `16px` |

**Animation:** Fade in + slide up `12px`, `500ms`, `delay: 500ms`. On hover, "Get Started" arrow should nudge `4px` right (`transform: translateX(4px)`, `200ms`).

**Mobile:** Stack vertically, full width

### Social proof line
- `12px`, zinc-400 at 70%, `letter-spacing: 0.05em`
- "Built for founders preparing for YC, Shark Tank India, and Series A rounds"

**Animation:** Fade in, `400ms`, `delay: 700ms`

### App Mockup (below hero text, `margin-top: 80px`)

**Container:** `max-width: 1024px`, centered, `border-radius: 12px`, `border: 1px solid` zinc-800 at 50%, `bg: rgba(card, 0.5)` + `backdrop-blur(4px)`, `box-shadow: 0 25px 50px rgba(0,0,0,0.4)`

**Title bar:** `padding: 12px 16px`, border-bottom, muted bg
- 3 traffic light dots: red/yellow/green at 60% opacity, `10px` diameter, `gap: 6px`
- URL text: `12px`, mono font, zinc-400 at 50%: "castdesk.app / session"

**Body:** 3-column grid (3:6:3 ratio), divided by vertical borders

| Left (Slides panel) | Center (Content) | Right (Chat) |
|---------------------|-------------------|--------------|
| 5 slide labels stacked | "Solution · Slide 02" header + skeleton lines | 3 chat bubbles (2 investor, 1 user) |
| Active slide (02) has primary bg tint + border | 3 skeleton text lines (widths: 66%, 100%, 80%) | Investor: gray bg, skeleton text |
| Others: zinc text, hover state | Status pill: "Marcus Reid is listening..." with pulsing green dot | User: primary tint bg, skeleton text |

**Animations:**
1. **On page load** (`delay: 800ms`): Mockup fades in + slides up `40px` + slight scale from `0.97` to `1`, `1000ms`, `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like)
2. **Pulsing dot** in "Marcus Reid is listening": CSS pulse animation, `1.5s` infinite
3. **Skeleton shimmer**: The skeleton text lines should have a shimmer sweep:
```css
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
/* background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent) */
/* background-size: 200% 100%, duration: 2s, infinite */
```
4. **Chat typing animation**: In the chat panel, add a 4th bubble at the bottom showing 3 animated dots (the investor "typing"), appearing after a `2s` delay:
```css
@keyframes typing-dot {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
/* 3 dots, each delayed 0.15s, duration: 1s */
```
5. **Reflection fade**: Below the mockup, a `80px` gradient from transparent to `#0a0a0a` creates a "floating" effect

---

## Section 3: How It Works

**Background:** Same as page (`#0a0a0a`), no tint
**Padding:** `96px` vertical

### Section header (centered)
- Badge pill: "How it works" — outline style
- Heading: `36px` desktop / `30px` mobile, `800` weight, `-0.02em` tracking
- Subtitle: zinc-400, `max-width: 576px`, centered

### 3-step grid (`gap: 24px`, 3 columns desktop, 1 mobile)

**Connector line (desktop only):** Horizontal `1px` line at `top: 40px` (center of icons), spanning from 16.66% to 83.33%, gradient: `transparent → border color → transparent`

**Animation:** The connector line should animate on scroll — draw from left to right:
```css
@keyframes line-draw {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
/* Trigger: when section enters viewport, duration: 1s, ease-out */
```

**Each step card:**

| Property | Value |
|----------|-------|
| Layout | Flex column, centered, text-center |
| Icon box | `80px` square, `border-radius: 16px`, card bg, border zinc-800 at 60%, shadow-sm |
| Icon | `32px`, zinc-400, hover→white transition `200ms` |
| Step number | `24px` circle, positioned `-8px` top-right of icon box, bg=page bg, border zinc-800, `10px` mono font bold |
| Title | `18px`, `600` weight, `margin-top: 24px`, `margin-bottom: 12px` |
| Description | `14px`, zinc-400, `line-height: 1.6` |

**Animations (scroll-triggered):**
- Each card fades in + slides up `24px`, staggered: card 1 at `0ms`, card 2 at `150ms`, card 3 at `300ms`
- On hover: icon box border transitions to `primary/30` (faint white glow), icon color transitions to white
- Step number: subtle scale bounce on scroll-trigger (`scale: 0 → 1.2 → 1`, `400ms`, spring)

---

## Section 4: Investor Personas

**Background:** `rgba(muted, 0.05)` — barely perceptible lighter tint to separate from adjacent sections
**Padding:** `96px` vertical

### Section header
- Badge: "8 investor personas"
- Heading: "Every room you might walk into"
- Subtitle: about attack styles, `max-width: 576px`

### 8 persona cards — `grid: 4 cols` (lg), `2 cols` (sm), `1 col` (mobile), `gap: 16px`

**Card dimensions:** Auto height, `min-height: ~220px`

**Card structure (top to bottom):**

```
┌──────────────────────────────┐
│ [Avatar 40px]  Name          │  ← CardHeader, pb: 12px
│                Title         │
│                              │
│ ┌──────────────┐             │
│ │ Style badge  │             │  ← Colored pill (per persona)
│ └──────────────┘             │
│                              │
│ Attack description text      │  ← CardContent, 12px, zinc-400
│ (3-line clamp)               │
│                              │
│ ─────────────────            │  ← Separator, border at 40%
│ SIGNATURE MOVE               │  ← 10px uppercase, zinc-500
│ "Sample question..."         │  ← 12px italic, zinc-400/80
└──────────────────────────────┘
```

**Per-persona color map:**

| Persona | Avatar bg | Badge colors | Hover glow |
|---------|-----------|-------------|------------|
| Marcus Reid | `violet-500/20` | `violet-500/10` bg, `violet-400` text | `violet-500/5` shadow |
| Victoria Cross | `blue-500/20` | `blue-500/10`, `blue-400` | `blue-500/5` |
| James Whitfield | `amber-500/20` | `amber-500/10`, `amber-400` | `amber-500/5` |
| Sandra Blake | `red-500/20` | `red-500/10`, `red-400` | `red-500/5` |
| Oliver Strauss | `cyan-500/20` | `cyan-500/10`, `cyan-400` | `cyan-500/5` |
| Rachel Monroe | `pink-500/20` | `pink-500/10`, `pink-400` | `pink-500/5` |
| Daniel Park | `green-500/20` | `green-500/10`, `green-400` | `green-500/5` |
| Sophia Laurent | `teal-500/20` | `teal-500/10`, `teal-400` | `teal-500/5` |

**Card states:**
- **Default:** `border: zinc-800/50`, `bg: card/50`
- **Hover:** `border: zinc-800`, `bg: card`, `box-shadow: 0 10px 30px rgba(0,0,0,0.2)`, slight `translateY(-2px)`

**Animations:**
1. **Scroll-triggered stagger:** Cards fade in + slide up `20px`, staggered by `75ms` each (so card 8 appears `525ms` after card 1). Use `cubic-bezier(0.16, 1, 0.3, 1)` for a snappy spring.
2. **Hover lift:** `transform: translateY(-2px)`, `box-shadow` grows, `200ms ease-out`
3. **Avatar pulse:** On hover, the avatar has a single soft pulse ring expanding outward in the persona's color, `600ms`:
```css
@keyframes avatar-ring {
  0% { box-shadow: 0 0 0 0 var(--persona-color); opacity: 0.4; }
  100% { box-shadow: 0 0 0 8px var(--persona-color); opacity: 0; }
}
```
4. **Signature quote reveal:** On hover, the signature move section's italic text fades from 60% to 100% opacity, `200ms`

---

## Section 5: Pricing

**Background:** Same as page
**Padding:** `96px` vertical
**Max width:** `896px` (max-w-4xl) — narrower than other sections

### Section header
- Badge: "Pricing"
- Heading: "Credits, not subscriptions"
- Subtitle: "Buy once, use whenever. Credits never expire."

### 4-column pricing grid (`gap: 20px`)

**Responsive:** `4 cols` (md), `2 cols` (sm), `1 col` (mobile)

#### Free Demo card (leftmost)

| Property | Value |
|----------|-------|
| Border | `1px dashed`, zinc-800 at 50% |
| Background | `rgba(muted, 0.1)` |
| Price | "₹0" in `36px` bold but zinc-400 (muted) |
| Credits | "No signup needed" in zinc-500 |
| Features | zinc-400 at 70%, checkmarks at 40% (desaturated) |
| Button | Outline variant, "Try Demo" |

#### Starter / Founder / Studio cards

| Property | Starter | **Founder (popular)** | Studio |
|----------|---------|----------------------|--------|
| Border | zinc-800/50 | `primary/50` (white glow) | zinc-800/50 |
| Background | card/50 | `primary/5` (faint white tint) | card/50 |
| Scale | `1` | `1.02` | `1` |
| Shadow | none | `0 20px 40px rgba(primary, 0.1)` | none |
| Badge | none | "Most Popular" floating above card, `-12px` top | none |
| Button | Secondary (gray) | Primary (white) | Secondary (gray) |

**Card structure:**
```
┌─────────────────────────┐
│  [Most Popular badge]   │  ← Only on Founder, floating
├─────────────────────────┤
│  Pack name (14px muted) │
│  ₹1,499 (36px bold)    │
│  ⚡ 400 credits (primary)│
│                         │
│  Description text       │
│                         │
│  ✓ Feature 1            │
│  ✓ Feature 2            │
│  ✓ Feature 3            │
│  ✓ Feature 4            │
│                         │
│  [Buy button full-width]│
└─────────────────────────┘
```

**Animations:**
1. **Scroll-triggered:** All 4 cards fade in + slide up `20px`, staggered `100ms` each
2. **Founder card entrance (special):** After the stagger, the Founder card does a subtle "pop" — `scale: 0.98 → 1.02`, `400ms`, spring easing. This draws the eye.
3. **Hover on non-popular cards:** `border` transitions to zinc-700, `200ms`
4. **Button hover:** Scale `1.02` on hover, `150ms`
5. **Price number countup:** When the section scrolls into view, the price numbers animate from 0 to their value over `800ms` using a counting animation:
```
₹0 → ₹499 → ₹1,499 → ₹3,499
(all count up simultaneously, ease-out)
```

### Credit cost reference box
- `border-radius: 12px`, `border: 1px zinc-800/40`, `bg: muted/20`
- Header: "WHAT DO CREDITS COST?" — `12px`, uppercase, `0.1em` tracking, zinc-400, centered
- 4-column grid: each item = cost bold (`14px`) + action label (`12px`, zinc-400)
- `margin-top: 40px`

---

## Section 6: Final CTA

**Padding:** `96px` vertical
**Max width:** `672px`, centered

### Background effect
- Single `400px` radial glow, `primary/5`, `blur: 80px`, positioned behind text
- `z-index: -1`

**Animation:** Glow slowly breathes (same as hero ambient, `8s`)

### Content
- Heading: `36px`, bold, "Walk in knowing what's coming."
- Subtitle: zinc-400, `16px`, `line-height: 1.6`
- 2 CTAs: Same as hero ("Try Free Demo" outline + "Start Practicing →" filled)

**Animation:**
1. Fade in + slide up on scroll, `600ms`
2. The heading words should have a subtle typewriter-reveal feel: each word fades in left-to-right with `30ms` stagger between words. Not an actual typewriter — just opacity + slight `translateY(4px)` per word.

---

## Section 7: Footer

**Border:** `1px top`, zinc-800/50
**Padding:** `40px` vertical

**Layout:** Flex, space-between (row on desktop, column centered on mobile)

| Left | Right |
|------|-------|
| Logo (24px square, white bg) + "CastDeck" 14px semibold | "© 2026 CastDeck. Built for founders who take the meeting seriously." 12px zinc-400 |

---

## Scroll Animation Implementation

Use **CSS `@keyframes` + Intersection Observer** (or `framer-motion`). Key principles:

1. **Trigger once:** Animations play on first scroll into viewport, don't replay
2. **Threshold:** Trigger at `0.15` (15% visible)
3. **Initial state:** All animated elements start as `opacity: 0; transform: translateY(20px)`
4. **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for spring-like feel on entrances
5. **No animation on reduced-motion:** Respect `prefers-reduced-motion: reduce`

### Animation timeline on full page scroll

```
0ms     — Navbar visible (no animation, always there)
100ms   — Badge fades in
200ms   — Headline fades in
400ms   — Subtitle fades in
500ms   — CTA buttons fade in
700ms   — Social proof line fades in
800ms   — App mockup slides up with spring
2000ms  — Typing dots appear in mockup chat

[scroll to How It Works]
0ms     — Section header fades in
200ms   — Connector line draws left→right
300ms   — Step 1 card enters
450ms   — Step 2 card enters
600ms   — Step 3 card enters

[scroll to Personas]
0ms     — Header enters
200ms   — Cards stagger in (75ms each, 8 cards = 525ms total)

[scroll to Pricing]
0ms     — Header enters
200ms   — Free Demo card enters
300ms   — Starter card enters
400ms   — Founder card enters + pop
500ms   — Studio card enters
600ms   — Price numbers count up

[scroll to Final CTA]
0ms     — Glow breathes
200ms   — Heading words reveal
500ms   — Subtitle fades in
600ms   — Buttons fade in
```

---

## Responsive Breakpoints

| Breakpoint | Navbar | Hero text | Grid columns | Mockup |
|------------|--------|-----------|-------------|--------|
| `< 640px` (mobile) | Logo + buttons only, no nav links | `36px` headline | 1 column everything | Hidden |
| `640-768px` (sm) | Same | `48px` | 2 cols personas, 2 pricing | Hidden or scaled down |
| `768-1024px` (md) | Full nav visible | `48px` | 3 cols how-it-works, 2 personas | Visible |
| `> 1024px` (lg/xl) | Full | `60px` | All grids at full columns | Full mockup |

**Mobile-specific:**
- Mockup hidden below `768px` (doesn't work at small sizes)
- Pricing grid: 1 column with Founder card still highlighted
- Persona grid: 2 columns
- All horizontal padding: `16px`
- Section padding reduces to `64px`
