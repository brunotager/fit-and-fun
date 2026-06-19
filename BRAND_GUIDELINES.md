# Fit & Fun — Brand Guidelines

> **Last updated:** 2026-05-18
> This is the single source of truth for all visual and verbal brand decisions.
> Every new component, page, or piece of copy must follow these guidelines.

---

## 1. Color Palette

### Primary

| Token            | Hex       | Usage                                       |
|------------------|-----------|---------------------------------------------|
| `primary`        | `#E86A20` | CTAs, active nav, toggle-on, brand accents   |
| `primary-hover`  | `#C7571A` | Hover state for primary buttons              |
| `primary-pressed`| `#A84812` | Active/pressed state for primary buttons     |
| `primary-light`  | `#FFF0E5` | Tinted backgrounds, soft tags, highlights    |

### Semantic

| Token     | Hex       | Usage                                  |
|-----------|-----------|----------------------------------------|
| `success` | `#267E00` | Progress bars, checkmarks, positive    |
| `error`   | `#7E0000` | Destructive actions, error states      |

### Neutrals

| Token           | Hex       | Usage                                         |
|-----------------|-----------|-----------------------------------------------|
| `background`    | `#FFFDF7` | Page background (warm off-white)               |
| `surface`       | `#F8F6F3` | Card backgrounds (settings, profile sections)  |
| `neutral`       | `#EEEAEA` | Dividers, borders, disabled backgrounds        |
| `text-primary`  | `#171717` | Headings, primary body text                    |
| `text-secondary`| `#78716C` | Supporting text, descriptions (stone-500)      |
| `text-muted`    | `#A8A29E` | Placeholder text, tertiary labels (stone-400)  |
| `white`         | `#FFFFFF` | Text on dark/colored backgrounds, card bg      |

### Accessibility Rules

- **Never use `primary` (#E86A20) as body text** on light backgrounds — it fails AA (3.3:1 on `#FFFDF7`).
- Orange is permitted for **bold labels ≥ 14px**, **icons**, **buttons (white text on orange bg)**, and **decorative elements**.
- `text-primary` on `background` = ~18:1 ✅
- `text-secondary` on `background` = ~4.5:1 ✅ (AA pass)
- `white` on `primary` = ~3.4:1 — passes AA for **large text** (≥ 18.66px bold / ≥ 24px regular). All primary buttons use uppercase bold, so this qualifies.
- `success` (#267E00) on `background` = ~6.5:1 ✅
- `error` (#7E0000) on `background` = ~9:1 ✅

---

## 2. Typography

### Font Family

| Role     | Font         | Variable              |
|----------|--------------|-----------------------|
| Primary  | Geist Sans   | `--font-geist-sans`   |
| Mono     | Geist Mono   | `--font-geist-mono`   |

### Type Scale

All sizes below are **fixed** — do not use arbitrary values outside this scale.

| Token       | Size   | Weight       | Case       | Tracking         | Usage                                    |
|-------------|--------|--------------|------------|------------------|------------------------------------------|
| `display`   | 32px   | `font-black` | UPPERCASE  | `tracking-tight` | Hero numbers (Day counter, timer)        |
| `h1`        | 28px   | `font-black` | UPPERCASE  | `tracking-tight` | Page-level headings                      |
| `h2`        | 24px   | `font-black` | UPPERCASE  | `tracking-tight` | Card titles, modal headings              |
| `h3`        | 20px   | `font-black` | UPPERCASE  | `tracking-wide`  | Section headings, sub-titles             |
| `body`      | 16px   | `font-medium`| Sentence   | default          | Primary body text, descriptions          |
| `body-sm`   | 14px   | `font-medium`| Sentence   | default          | Secondary body text, settings items      |
| `caption`   | 12px   | `font-bold`  | UPPERCASE  | `tracking-wider` | Badges, tags, status labels, nav labels  |
| `label`     | 10px   | `font-black` | UPPERCASE  | `tracking-widest`| Micro labels ("NOW", "NEXT", "STEP")     |

### Rules

- **Headings**: Always `font-black` + `UPPERCASE`.
- **Body**: Always `font-medium` + sentence case.
- **Labels/Captions**: Always `font-bold` or `font-black` + `UPPERCASE` + wide tracking.
- **CTAs (button text)**: Always `UPPERCASE` + `font-bold` + `tracking-wider`.
- **Line height**: Use `leading-tight` for headings, `leading-relaxed` for body text.

---

## 3. Border Radius

**One radius to rule them all: `20px`** (`rounded-[20px]`).

| Element     | Radius   | Tailwind Class     |
|-------------|----------|--------------------|
| Buttons     | 20px     | `rounded-[20px]`   |
| Cards       | 20px     | `rounded-[20px]`   |
| Modals      | 20px     | `rounded-[20px]`   |
| Inputs      | 20px     | `rounded-[20px]`   |
| Tags/Pills  | `full`   | `rounded-full`     |
| Toggles     | `full`   | `rounded-full`     |
| Avatars     | `full`   | `rounded-full`     |

### Exceptions

- **Tags, pills, badges** → `rounded-full` (they are small inline elements where full rounding looks correct).
- **Toggle switches** → `rounded-full` (circular track/knob).
- **Profile avatars** → `rounded-full` (circular).
- Everything else → `20px`.

---

## 4. Spacing

Base unit: **4px**. Use only these values:

| Token | Value | Usage                                                  |
|-------|-------|--------------------------------------------------------|
| `xs`  | 4px   | Micro gaps (icon ↔ label, inline elements, pill padding)|
| `sm`  | 8px   | Inner padding, tight gaps between related elements      |
| `md`  | 16px  | Standard padding, gaps between components               |
| `lg`  | 32px  | Section spacing, major layout gaps                      |

### Layout Rules

- **Page horizontal padding**: `px-6` (24px) — _the one exception to the scale_, needed for visual breathing room on mobile.
- **Section vertical spacing**: `32px` (lg).
- **Component inner padding**: `16px` (md).
- **Gap between stacked elements** (e.g., buttons in a modal): `8px` (sm) or `16px` (md).
- **Icon ↔ text gap**: `4px` (xs) or `8px` (sm).

---

## 5. Shadows

| Token            | Value                                      | Usage                          |
|------------------|--------------------------------------------|--------------------------------|
| `shadow-card`    | `0 8px 30px rgb(0, 0, 0, 0.04)`           | Cards, content containers       |
| `shadow-elevated`| `shadow-2xl`                               | Modals, overlays               |
| `shadow-button`  | `0 8px 30px rgb(232, 106, 32, 0.25)`      | Primary CTA buttons            |
| `shadow-sm`      | `shadow-sm`                                | Tags, badges, subtle lift      |

---

## 6. Interactions & Animations

### Press / Active

| Property         | Value             | Applies to     |
|------------------|-------------------|----------------|
| Press feedback   | `active:scale-95` | All buttons    |
| Transition       | `transition-transform` | All buttons |

### Hover

| Property         | Value               | Applies to               |
|------------------|----------------------|--------------------------|
| Color shift      | `hover:bg-{hover}`   | All buttons              |
| Scale            | `hover:scale-105`    | **Primary FAB only**     |
| No hover effects |                      | Images, cards, non-buttons|

> **Rule**: Only `<button>` and `<a>` elements styled as buttons should have hover effects. No hover on images, coach illustrations, decorative elements.

### Page / View Transitions

| Property          | Value                             | Usage                  |
|-------------------|-----------------------------------|------------------------|
| Enter animation   | `animate-in fade-in duration-700` | Page mounts            |
| Modal enter       | `animate-in fade-in duration-200` | Backdrop               |
| Modal card enter  | `zoom-in-95 slide-in-from-bottom-4 duration-500` | Modal card |

> Page transitions use **opacity (fade)** — a separate system from interactive transform feedback.

### Micro-animations

| Animation              | Usage                         |
|------------------------|-------------------------------|
| `slide-in-from-bottom` | Content appearing on page     |
| `zoom-in-95`           | Modal card appearance         |
| `animate-pulse`        | Active progress indicator     |
| Spring bounce          | Emoji drops, celebratory UI   |

---

## 7. Component Patterns

### Primary Button (CTA)

```
bg-primary text-white font-bold py-4 rounded-[20px]
shadow-button active:scale-95 transition-transform
uppercase tracking-wider text-sm
hover:bg-primary-hover
```

### Secondary Button

```
bg-neutral text-text-primary font-bold py-4 rounded-[20px]
active:scale-95 transition-transform
```

### Ghost / Text Button

```
font-bold text-text-secondary hover:text-text-primary
active:scale-95 transition-transform
```

### Destructive Button

```
bg-error text-white font-bold py-4 rounded-[20px]
shadow-lg active:scale-95 transition-transform
hover:bg-error-dark
```

### Card

```
bg-surface rounded-[20px] p-md shadow-card
```

### Modal

```
Backdrop: bg-black/60 backdrop-blur-sm
Card: bg-white rounded-[20px] p-lg shadow-elevated
```

### Input

```
bg-neutral/80 border-2 border-neutral rounded-[20px]
text-center font-bold text-text-primary
focus:border-primary transition-colors
```

### Toggle Switch

```
Track: w-14 h-8 rounded-full transition-colors duration-300
  ON:  bg-primary
  OFF: bg-neutral
Knob: w-6 h-6 rounded-full bg-white shadow-md
```

---

## 8. Focus States

```css
*:focus-visible {
  outline: 2px solid #E86A20; /* primary */
  outline-offset: 0px;
}
```

All focus rings use the primary color. No double-rings, no browser defaults.

---

## 9. Brand Voice & Copy

### Personality

| Trait       | Description                                                    |
|-------------|----------------------------------------------------------------|
| Playful     | Light-hearted, uses emojis sparingly, celebrates small wins    |
| Direct      | Short sentences. No fluff. Says what it means.                 |
| Warm        | Feels like a supportive friend, not a drill sergeant           |
| Never       | Guilt-tripping, cheesy, condescending, passive-aggressive      |

### Coach Gabi Voice

Gabi is the app's mascot — a penguin coach. Her voice is:

- **Tone**: Encouraging best friend who actually works out with you.
- **Sentence length**: Short. Punchy. One idea per sentence.
- **Format**: No exclamation-mark overload. One per message max.
- **Emojis**: Sparingly, and only in celebration contexts.

#### ✅ Good Examples
- "Start small. Consistency beats intensity."
- "Day 3. You're building something real."
- "No guilt. Just restart. One workout today."
- "Self-care is not selfish."
- "You showed up. That's the win."

#### ❌ Bad Examples
- "OMG you're doing AMAZING!! 🎉🎉🎉 Keep it up bestie!!"
- "Don't give up! You can do this if you just TRY harder!"
- "It's been a while... we miss you 😢"
- "Your body will thank you later! 💪✨🔥"

### Copy Formatting Rules

| Element          | Format                                            |
|------------------|---------------------------------------------------|
| **UI Labels**    | UPPERCASE + wide tracking (e.g., "TOTAL TIME")    |
| **CTA Buttons**  | UPPERCASE + bold (e.g., "START WORKOUT")           |
| **Headings**     | UPPERCASE + black weight (e.g., "CONGRATS!")       |
| **Body text**    | Sentence case + medium weight                     |
| **Coach quotes** | Sentence case, wrapped in smart quotes (" ")      |
| **Stats labels** | Lowercase + medium weight (e.g., "points", "steps")|

---

## 10. Iconography

| Library  | Lucide React                      |
|----------|-----------------------------------|
| Size     | 20–24px for UI, 28–32px for feature icons, 64px for hero |
| Weight   | `strokeWidth={1.5}` default, `2.5` for emphasis |
| Color    | Inherits from parent text color   |

---

## 11. Quick Reference — Tailwind Token Map

```
Primary:         #E86A20  → brand-500 (or custom)
Primary Hover:   #C7571A  → brand-600
Primary Pressed: #A84812  → brand-700
Primary Light:   #FFF0E5  → brand-50
Success:         #267E00
Error:           #7E0000
Background:      #FFFDF7
Surface:         #F8F6F3
Neutral:         #EEEAEA
Text Primary:    #171717
Text Secondary:  #78716C
Text Muted:      #A8A29E
```

---

_This document is the canonical reference. When in doubt, follow these guidelines. If a component deviates, it should be updated to comply._
