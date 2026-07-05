---
name: Academic Pulse
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d8f2'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#eeecff'
  surface-container-high: '#e7e6ff'
  surface-container-highest: '#e1e0fb'
  on-surface: '#191a2d'
  on-surface-variant: '#474554'
  inverse-surface: '#2e2f43'
  inverse-on-surface: '#f1efff'
  outline: '#787585'
  outline-variant: '#c8c4d6'
  surface-tint: '#5748d0'
  primary: '#5545cd'
  on-primary: '#ffffff'
  primary-container: '#6e60e8'
  on-primary-container: '#fffbff'
  inverse-primary: '#c6c0ff'
  secondary: '#0060a7'
  on-secondary: '#ffffff'
  secondary-container: '#64acfe'
  on-secondary-container: '#003f70'
  tertiary: '#5a568b'
  on-tertiary: '#ffffff'
  tertiary-container: '#736ea5'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c6c0ff'
  on-primary-fixed: '#150066'
  on-primary-fixed-variant: '#3f2bb8'
  secondary-fixed: '#d2e4ff'
  secondary-fixed-dim: '#a1c9ff'
  on-secondary-fixed: '#001c37'
  on-secondary-fixed-variant: '#004880'
  tertiary-fixed: '#e4dfff'
  tertiary-fixed-dim: '#c6c0fd'
  on-tertiary-fixed: '#191346'
  on-tertiary-fixed-variant: '#454074'
  background: '#fbf8ff'
  on-background: '#191a2d'
  surface-variant: '#e1e0fb'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
---

## Brand & Style
The design system is built for a modern academic portfolio environment, balancing high-performance utility with an approachable, student-centric aesthetic. The personality is **sophisticated, organized, and optimistic**. 

The visual style follows a **Modern Corporate** direction with **Soft-UI** influences. It utilizes a layered approach to information architecture, using subtle lavender-tinted shadows and a cool-toned palette to reduce cognitive load. The goal is to evoke a sense of professional readiness and academic achievement through clean lines, ample whitespace, and high-quality typography.

## Colors
The palette is rooted in a "Cool Lavender" spectrum. The primary accent (#7C6FF7) is used for high-emphasis actions and active states. Secondary blue provides a refreshing contrast for informational highlights.

The neutral system is intentionally tinted with blue and violet undertones—avoiding true greys to maintain the design system's cohesive cool temperature. Text levels are strictly enforced to ensure WCAG AA accessibility standards against the pale backgrounds.

## Typography
The system uses **Hanken Grotesk** as a modern, high-legibility substitute for Helvetica Neue, offering better variable weight control and a more contemporary feel suitable for SaaS environments.

- **Scale:** Uses a major second (1.125) scale for hierarchical clarity.
- **Headlines:** Use SemiBold (600) or Bold (700) with slight negative letter spacing to feel "locked in."
- **Body:** Regular (400) weight is preferred for long-form reading, with Medium (500) used for emphasis within text blocks.
- **Labels:** Small caps or uppercase are used sparingly for metadata categories to differentiate from interactive labels.

## Layout & Spacing
This design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **The Sidebar:** Remains fixed at 260px on desktop to provide a persistent navigation anchor.
- **Rhythm:** A strict 4px/8px baseline grid is applied. All vertical margins and paddings must be multiples of 8px.
- **Density:** The system prioritizes "breathability." Large cards (Project/Student cards) should utilize `lg` (24px) internal padding, while utility cards (StatCard) can scale down to `md` (16px).

## Elevation & Depth
Depth is created through **Tonal Layering** combined with soft, chromatic shadows.

- **Level 0 (Base):** `#F4F7FF` - The canvas layer.
- **Level 1 (Sub-navigation):** `#EEF1FF` - Sidebars and nested navigation containers. No shadow.
- **Level 2 (Surface):** `#FFFFFF` - Cards and primary containers. Utilizes the signature lavender shadow: `0 2px 12px rgba(124,111,247,0.08)`.
- **Level 3 (Overlay):** Floating action buttons or dropdowns. Uses a deeper shadow: `0 8px 24px rgba(124,111,247,0.12)`.

Borders are used primarily as structural reinforcement on Level 1 and 2 surfaces using `#E2E6F3`.

## Shapes
The shape language is "Variably Rounded," where the radius is mapped to the component's scale and frequency of use:

1.  **Functional Elements (8px - 10px):** Inputs and buttons use a tighter radius to imply precision and interactability.
2.  **Structural Elements (16px):** Main cards and containers use a generous radius to feel friendly and modern.
3.  **Status Elements (24px):** Pills and badges are fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons & Inputs
- **Primary Button:** Solid `#7C6FF7` with white text, 10px radius.
- **Secondary Button:** Ghost style with `#7C6FF7` border and text.
- **Input Fields:** 8px radius, `#E2E6F3` border. Focus state uses a 2px stroke of `#7C6FF7` with a soft lavender glow.

### Specialized Cards
- **StatCard:** Minimalist container for metrics. Value in `headline-md`, label in `label-sm` secondary text.
- **StudentCard:** Features a rounded-stroke avatar, student name, and the signature **Cohort Badge**.
- **ProjectCard:** Includes a thumbnail area (16px radius), project title, and a row of **SkillPills**.

### Signature Elements
- **Cohort Badge:** A pill-shaped badge using `bg: #C8C2FF` and `text: #7C6FF7`. This is the primary identifier for student affiliation.
- **SkillPill:** Small, neutral-themed pills (`bg: #EEF1FF`, `text: #6B7094`) used for tagging technical competencies.
- **Icons:** Use a 2px stroke width with rounded caps and joins to match the soft UI language.