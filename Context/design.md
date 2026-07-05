# Luminous Academic — Design System

> A sophisticated blend of high-end ed-tech professionalism and modern glassmorphism.  
> Designed to evoke clarity, intelligence, and calm focus for students and educators alike.

---

## Brand Philosophy

The visual narrative is built around **Glassmorphism** as its core structural principle. Surfaces are translucent panes that interact with vibrant, soft-focus gradients in the background — creating spatial depth and modernity rather than a flat or industrial feel.

The tone is **premium yet accessible**: light lavender hues reduce eye strain while vivid indigo accents drive critical actions. The result is an interface that feels organic, inviting, and unmistakably academic.

---

## Colors

The palette spans a sophisticated spectrum of violet and indigo.

### Roles

| Role | Hex | Usage |
|---|---|---|
| **Primary** | `#4837B7` | Actions, links, brand highlights |
| **Primary Container** | `#6152D1` | Button fills, active states |
| **On Primary** | `#FFFFFF` | Text/icons on primary surfaces |
| **On Primary Container** | `#E6E1FF` | Text/icons inside primary containers |
| **Secondary** | `#5C588D` | Secondary text, sidebar icons |
| **Secondary Container** | `#C8C3FF` | Secondary fills |
| **Tertiary** | `#5638A8` | Accent fills |
| **Tertiary Container** | `#6E52C2` | Accent containers |
| **Error** | `#BA1A1A` | Errors, destructive states |
| **Error Container** | `#FFDAD6` | Error backgrounds |

### Surfaces

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#FCF8FF` | Base canvas |
| `surface-dim` | `#DBD8E5` | Dimmed surfaces |
| `surface-bright` | `#FCF8FF` | Elevated bright surfaces |
| `surface-container-lowest` | `#FFFFFF` | Innermost containers |
| `surface-container-low` | `#F5F2FF` | Secondary sections |
| `surface-container` | `#EFECF9` | Standard containers |
| `surface-container-high` | `#E9E6F3` | Elevated containers |
| `surface-container-highest` | `#E4E1EE` | Top-level containers |
| `on-surface` | `#1B1B24` | Primary body text |
| `on-surface-variant` | `#474553` | Secondary / supporting text |

### Structure

| Token | Hex | Usage |
|---|---|---|
| `outline` | `#787585` | Borders, dividers |
| `outline-variant` | `#C8C4D6` | Subtle borders |
| `inverse-surface` | `#302F39` | Dark mode surfaces |
| `inverse-on-surface` | `#F2EFFC` | Text on dark surfaces |
| `inverse-primary` | `#C6BFFF` | Primary in dark contexts |
| `surface-tint` | `#594AC9` | Tint overlay on elevated surfaces |
| `background` | `#FCF8FF` | Page background |
| `on-background` | `#1B1B24` | Text on background |
| `surface-variant` | `#E4E1EE` | Chip/tag backgrounds |

### Fixed Palette

| Token | Hex |
|---|---|
| `primary-fixed` | `#E4DFFF` |
| `primary-fixed-dim` | `#C6BFFF` |
| `on-primary-fixed` | `#170066` |
| `on-primary-fixed-variant` | `#412EB0` |
| `secondary-fixed` | `#E4DFFF` |
| `secondary-fixed-dim` | `#C5C0FC` |
| `on-secondary-fixed` | `#191446` |
| `on-secondary-fixed-variant` | `#444174` |
| `tertiary-fixed` | `#E8DDFF` |
| `tertiary-fixed-dim` | `#CEBDFF` |
| `on-tertiary-fixed` | `#20005E` |
| `on-tertiary-fixed-variant` | `#4E2FA0` |

---

## Typography

The system uses **Helvetica Neue** as its typeface — a neutral, highly legible foundation that balances the expressive glassmorphic UI.

| Token | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `display-lg` | Helvetica Neue | 48px | 700 | 1.1 | −0.02em |
| `headline-lg` | Helvetica Neue | 32px | 600 | 1.2 | — |
| `headline-md` | Helvetica Neue | 24px | 600 | 1.3 | — |
| `body-lg` | Helvetica Neue | 18px | 400 | 1.6 | — |
| `body-md` | Helvetica Neue | 16px | 400 | 1.5 | — |
| `label-md` | Helvetica Neue | 14px | 500 | 1.2 | 0.01em |
| `label-sm` | Helvetica Neue | 12px | 600 | 1.2 | — |

### Guidelines

- **Headlines** — Tight letter spacing and heavier weights create strong hierarchy.
- **Body** — Generous line heights ensure readability during long-form academic tasks.
- **Labels** — Medium-to-semibold weight keeps labels legible on glass surfaces.
- **Mobile scaling** — `display-lg` scales down to `32px`; `headline-lg` to `24px`.

---

## Spacing

All spacing follows an **8px linear scale**.

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Micro gaps |
| `sm` | 12px | Tight internal spacing |
| `base` | 8px | Grid unit |
| `md` | 24px | Standard card padding |
| `lg` | 40px | Section gaps |
| `xl` | 64px | Page-level vertical rhythm |
| `gutter` | 24px | Column gutters |
| `margin` | 32px | Page-edge margins |

---

## Layout

The layout follows a **Fluid Grid** philosophy for data-heavy dashboards.

| Breakpoint | Columns |
|---|---|
| Desktop | 12 |
| Tablet | 8 |
| Mobile | 4 |

**Sidebar** — Fixed at ~260px width with a frosted glass effect to differentiate global navigation from the workspace.

---

## Border Radius

The shape language is ultra-modern and approachable — exaggerated rounded corners reinforce the "liquid-glass" feel.

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 0.5rem / 8px | Small utility elements |
| `rounded` | 1rem / 16px | Input fields |
| `rounded-md` | 1.5rem / 24px | Moderate cards |
| `rounded-lg` | 2rem / 32px | Dashboard cards, primary buttons |
| `rounded-xl` | 3rem / 48px | Hero sections, large surfaces |
| `rounded-full` | 9999px | Chips, tags, pill buttons |

---

## Elevation & Depth

Depth is created through **layered translucency** rather than heavy shadows.

| Property | Value |
|---|---|
| Surface opacity | 75–85% white or light lavender |
| Backdrop blur | `12px – 16px` (applied to all glass elements) |
| Border | `1px solid rgba(255,255,255, 0.2–0.4)` |
| Shadow | Ambient only — `#5A568B` at 10% opacity, large blur radius |

The `1px` semi-opaque border creates a **specular highlight** effect, defining the edge of each glass pane without hard lines.

---

## Components

### Buttons

| Variant | Background | Text | Radius | Border |
|---|---|---|---|---|
| Primary | `#6152D1` | `#FFFFFF` | `rounded-lg` | None |
| Ghost | Transparent | `on-surface` | `rounded-lg` | `1px rgba(255,255,255, 0.3)` |

- Hover state: subtle tint overlay on ghost; slight scale or glow on primary.

### Cards

Glass cards are the primary dashboard widget container.

```
background: rgba(255, 255, 255, 0.80)
backdrop-filter: blur(16px)
border: 1px solid rgba(255, 255, 255, 0.3)
border-radius: rounded-lg (2rem)
padding: md (24px)
box-shadow: 0 8px 32px rgba(90, 86, 139, 0.10)
```

### Chips / Tags

Used for status indicators: `Active`, `Pending`, etc.

```
background: rgba(<semantic-color>, 0.10)
color: <semantic-color> (full opacity)
border-radius: rounded-full
padding: xs sm (4px 12px)
font: label-sm
```

### Input Fields

```
background: rgba(255, 255, 255, 0.60)
border: 1px solid outline-variant
border-radius: rounded (1rem)
focus-border: 2px solid primary (#4837B7)
placeholder-color: rgba(90, 86, 139, 0.50)
```

### Lists & Tables

- **Zebra-striping** — Alternating rows use `surface-container-low` (`#F5F2FF`) at 5% opacity tint.
- No heavy horizontal rules — row separation relies solely on the alternating tint.

---

## Quick Reference

```css
/* Core tokens */
--color-primary:            #4837B7;
--color-primary-container:  #6152D1;
--color-surface:            #FCF8FF;
--color-surface-container:  #EFECF9;
--color-on-surface:         #1B1B24;
--color-outline:            #787585;

/* Glass surface */
--glass-bg:                 rgba(255, 255, 255, 0.80);
--glass-blur:               blur(16px);
--glass-border:             1px solid rgba(255, 255, 255, 0.30);
--glass-shadow:             0 8px 32px rgba(90, 86, 139, 0.10);

/* Radii */
--radius-sm:   0.5rem;
--radius:      1rem;
--radius-md:   1.5rem;
--radius-lg:   2rem;
--radius-xl:   3rem;
--radius-full: 9999px;

/* Spacing */
--space-xs: 4px;
--space-sm: 12px;
--space-md: 24px;
--space-lg: 40px;
--space-xl: 64px;
```
