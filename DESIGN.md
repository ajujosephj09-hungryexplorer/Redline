---
name: Redline
description: "Your contract, diagnosed."
colors:
  navy: "#1e293b"
  severity-critical: "#dc2626"
  severity-moderate: "#f59e0b"
  severity-clear: "#16a34a"
  clinical-white: "#ffffff"
  surface-muted: "#f8fafc"
  border-light: "#e2e8f0"
  text-secondary: "#64748b"
  text-tertiary: "#94a3b8"
  counter-offer-bg: "#ecfdf5"
typography:
  display:
    fontFamily: "Libre Franklin, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Libre Franklin, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Libre Franklin, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  body-large:
    fontFamily: "Libre Franklin, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Libre Franklin, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.05em"
  mono:
    fontFamily: "Roboto Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
rounded:
  sm: "2px"
  md: "6px"
  full: "9999px"
spacing:
  section-x: "24px"
  section-y: "80px"
  container: "768px"
  element-gap: "32px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.clinical-white}"
    rounded: "{rounded.md}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "#1e293b"
  severity-pill-critical:
    backgroundColor: "{colors.severity-critical}"
    textColor: "{colors.clinical-white}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  severity-pill-moderate:
    backgroundColor: "{colors.severity-moderate}"
    textColor: "{colors.navy}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
---

# Design System: Redline

## Overview

**Creative North Star: "The Diagnostic Report"**

The system presents contract analysis as a clinical workup. The visual language borrows from medical diagnostics and lab reports: white ground, restrained palette, tabular findings, severity indicators as the only saturated color. Authority comes from structure and evidence, not decoration. The page is the report; the report is the product.

The density is high for a landing page but appropriate for the form it imitates. Every visual element either conveys a finding, cites evidence, or prompts an action. Decorative elements are absent by design, not by omission.

**Key Characteristics:**
- Clinical white ground with a single structural color (deep navy)
- Severity as the only source of saturated color (red, amber, green)
- Monospace face distinguishes cited contract text from analysis
- Tabular findings layout with expandable rows
- Single narrow column (max 768px) for readability and report feel

## Colors

A deliberately constrained palette: one structural color and three diagnostic signals. Saturation is rationed to severity.

### Primary
- **Deep Navy** (#1e293b): The structural backbone. Used for headings, body text, primary button fills, left-border accents on citation blocks, selection highlight background, and focus outlines. Carries authority through omnipresence at low saturation.

### Tertiary
- **Severity Critical** (#dc2626): Red. Used exclusively for critical-severity pills (filled background, white text) and critical status dots. Never decorative.
- **Severity Moderate** (#f59e0b): Amber. Used exclusively for moderate-severity pills (filled background, navy text) and moderate status dots.
- **Severity Clear** (#16a34a): Green. Used for clear-status text labels, clear status dots, and as the left-border accent on counter-offer blocks.

### Neutral
- **Clinical White** (#ffffff): Page background, report card background, button text.
- **Surface Muted** (#f8fafc / slate-50): Alternating section backgrounds, citation block backgrounds, hover state on finding rows.
- **Border Light** (#e2e8f0 / slate-200): All borders, dividers, and the report card's shadow tint.
- **Text Secondary** (#64748b / slate-500): Label text inside citation and counter-offer blocks.
- **Text Tertiary** (#94a3b8 / slate-400): Footer text, placeholder text, muted annotations.
- **Counter-Offer Background** (#ecfdf5 / emerald-50): Background for counter-offer blocks, pairing with the green left border.

### Named Rules
**The Severity Monopoly Rule.** Red, amber, and green appear only as severity indicators. They are never used for buttons, backgrounds, links, decorative elements, or branding. Their diagnostic meaning depends on this exclusivity.

**The Navy-Is-Ink Rule.** Navy (#1e293b) functions as ink, not as an accent. It is the default text color, the heading color, and the button fill. There is no separate "text color" and "brand color" -- they are the same value.

## Typography

**Display Font:** Libre Franklin (with sans-serif fallback)
**Mono Font:** Roboto Mono (with monospace fallback)

**Character:** A single sans-serif family (Libre Franklin) handles all structural and body text. It is a workhorse face -- readable, authoritative, and invisible. Roboto Mono is reserved strictly for cited contract text, creating a visual firewall between evidence and analysis.

### Hierarchy
- **Display** (700, text-4xl to text-5xl / clamp ~2.25rem-3rem, tracking-tight, line-height ~1.1): The "Redline" wordmark and nothing else.
- **Headline** (700, 1.5rem / text-2xl, line-height ~1.3): Section headings ("How it works", "Six rules, checked every time").
- **Body Large** (400, 1.125rem / text-lg to text-xl, leading-relaxed): The tagline and section lead-in paragraphs.
- **Body** (400/600, 0.875rem / text-sm, leading-relaxed): Finding assessments, descriptive text, list items. Semibold weight for inline emphasis and row titles.
- **Label** (600, 0.75rem / text-xs, uppercase, tracking-wider / 0.05em): Severity pills, section labels inside citation blocks ("Cited from your contract", "Counter-offer"), status text in the rules checklist.
- **Mono** (400, 0.875rem / text-sm, leading-relaxed): Cited contract sentences inside finding expansions. Set via CSS variable `var(--font-mono)`.

### Named Rules
**The Evidence Wall Rule.** Cited contract text is always set in Roboto Mono. Analysis and counter-offers are always set in Libre Franklin. The typeface boundary is the credibility boundary -- it tells the reader what came from their document versus what the tool produced.

## Layout

Single-column, vertically stacked sections at a narrow measure. The container is max-width 768px (max-w-3xl), centered with auto margins, with 24px horizontal padding (px-6). This width matches a printed report or letter page and reinforces the diagnostic-document form.

Sections alternate between white and muted (slate-50) backgrounds to create visual separation without borders or spacing tricks. Vertical rhythm: the hero uses 64px/96px vertical padding (py-16 md:py-24); all subsequent sections use 80px (py-20). Internal element spacing is 32px (space-y-8) for list groups, 40px (mt-10) for content below section headings.

The first viewport is a flex column centered vertically (min-h-screen, justify-center), placing the wordmark, tagline, and report in a single scrollable frame. No fixed navigation; no sidebar; no grid. Responsive behavior is minimal because the narrow measure already works on mobile -- only the display size steps down and vertical padding compresses.

## Elevation & Depth

The system is flat by default. Depth is conveyed through tonal layering (white sections over slate-50 sections) and left-border accents on nested blocks, not through shadows.

One exception: the diagnostic report card in the hero carries a minimal shadow (`shadow-sm shadow-slate-200/50` -- approximately `0 1px 2px rgba(226,232,240,0.5)`). This lifts the report just enough to read as a document sitting on the page, consistent with the lab-report metaphor. No other element carries a shadow.

### Named Rules
**The One Document Rule.** Only the report card casts a shadow. It is the artifact being examined; the subtle lift distinguishes it from the page surface. Extending shadows to other elements would dilute this distinction.

## Shapes

Gently rounded corners (6px / rounded-md) on the report card, buttons, and rule-checklist container. Smaller rounding (2px / rounded-sm) on severity pills. Full rounding (9999px) on the small status-indicator dots in the report header.

Left-border accents (border-l) mark nested evidence blocks: navy left border on cited contract text, green (severity-clear) left border on counter-offers. These vertical rules act as margin markers, borrowing from the convention of annotation bars in medical charts and legal document review.

No circles, no decorative shapes, no clipping, no border-radius larger than 6px on any rectangular element.

## Components

### Buttons
- **Shape:** Gently rounded (6px / rounded-md)
- **Primary:** Navy background, white text, semibold, 1rem font size, 14px 32px padding (py-3.5 px-8). Used for both CTAs ("Try it on your contract").
- **Hover:** Background shifts to slate-800 (visually identical range to navy; the transition-colors provides the interactive signal).
- **Focus:** 2px solid navy outline, 2px offset (global :focus-visible rule).
- **No secondary or ghost variants exist in the build.**

### Severity Pills
Small uppercase labels indicating finding severity. Tight padding (4px 10px), minimal rounding (2px). Two variants:
- **Critical:** Red background (#dc2626), white text.
- **Moderate:** Amber background (#f59e0b), navy text.
- Clear findings use text-only labels (no pill shape) in green.

### Finding Rows (Signature Component)
The signature interaction. An expandable accordion row inside the report card.
- **Collapsed:** Severity pill left-aligned, rule name in semibold navy, one-line assessment in slate-600, chevron indicator right-aligned. Full-width click target. Hover: slate-50 background.
- **Expanded:** Reveals two stacked blocks below the row -- citation block (slate-50 background, navy left border, monospace text) and counter-offer block (emerald-50 background, green left border, sans-serif text). Each block has an uppercase label header.
- **Animation:** Grid-template-rows transition from 0fr to 1fr, 300ms ease-out. Chevron rotates 180 degrees on the same curve.

### Report Card
The diagnostic report container in the hero.
- **Corner Style:** 6px (rounded-md)
- **Background:** White
- **Shadow:** shadow-sm with slate-200/50 tint -- the only shadowed element
- **Border:** 1px solid slate-200
- **Header:** Navy semibold document title left, severity summary counts right (using colored dots + tabular-nums)
- **Internal:** Finding rows separated by slate-200 bottom borders

### Rules Checklist
A bordered, rounded container with divider rows.
- **Corner Style:** 6px (rounded-md)
- **Border:** 1px solid slate-200, internal dividers via divide-y
- **Rows:** Rule name left (navy, semibold, text-sm), status label right (colored uppercase text matching severity -- no pill, just text color)
- **Padding:** 20px horizontal (px-5), 14px vertical (py-3.5)

## Do's and Don'ts

### Do:
- **Do** use navy (#1e293b) as the default text color. It is ink, not an accent -- every heading and body element uses it.
- **Do** set cited contract text in Roboto Mono and all other text in Libre Franklin. The typeface is the trust signal.
- **Do** keep the container at max-w-3xl (768px). The narrow measure is the form, not a constraint to break out of.
- **Do** use alternating white/slate-50 section backgrounds to create rhythm without borders.
- **Do** pair left-border accents with background tints for nested evidence blocks (navy border + slate-50 for citations, green border + emerald-50 for counter-offers).

### Don't:
- **Don't** use severity colors (red, amber, green) for anything other than severity indicators. Buttons, links, backgrounds, and decorative elements stay navy or neutral.
- **Don't** add shadows to elements other than the report card. Depth comes from tonal layering.
- **Don't** introduce gradients, decorative illustrations, or background patterns. The data visualization is the design.
- **Don't** use display-size type for anything other than the product name. Section headings stay at headline scale (1.5rem).
- **Don't** break the single-column layout with sidebars, multi-column grids, or full-bleed media. The report form depends on the narrow measure.
