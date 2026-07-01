# Section Style Policy Guidelines

This document describes the background colour style policies available for the **Section** component in AEM (Adobe Experience Manager) using Edge Delivery Services (EDS).

---

## Overview

Sections are the top-level content containers on a page. Authors can apply a background colour to any section by adding a **Style** value in the Section Metadata block. The applied class controls background colour, text colour, and link colour automatically.

---

## Available Style Policies

| Style Name  | Class Applied      | Background Colour | Text Colour | Hex Value  |
|-------------|-------------------|-------------------|-------------|------------|
| Default     | _(none)_          | White `#ffffff`   | Black       | `#ffffff`  |
| Light       | `light`           | Light grey        | Black       | `#eeeeee`  |
| Aubergine   | `aubergine`       | Deep purple       | White       | `#3d0030`  |
| Charcoal    | `charcoal`        | Dark grey         | White       | `#2b2b2b`  |
| Teal        | `teal`            | Teal blue-green   | White       | `#007b8a`  |

---

## How to Apply a Style in the Document

1. Add a **Section Metadata** block at the bottom of the section (below all content in that section).
2. In the metadata block, set the **Style** row to one of the values above.

**Example table in Google Docs / SharePoint:**

| Section Metadata |            |
|------------------|------------|
| Style            | aubergine  |

The value is case-insensitive; `Aubergine`, `aubergine`, and `AUBERGINE` all work.

---

## Style Details

### Default (no style)

- **Background:** White (`#ffffff`)
- **Text:** Black
- **Use when:** Standard content sections with no visual emphasis.

---

### Light / Highlight

- **Class:** `light` or `highlight`
- **Background:** Light grey (`#eeeeee`)
- **Text:** Black
- **Use when:** Subtle separation between sections; callout or supporting content that should feel distinct but not bold.

---

### Aubergine

- **Class:** `aubergine`
- **Background:** Deep purple (`#3d0030`)
- **Text:** White
- **Use when:** High-impact hero areas, campaign headers, or brand-led sections that need a bold, premium feel. Use sparingly — one or two sections per page maximum.

**Accessibility:** Meets WCAG AA contrast ratio for normal and large text on white text against `#3d0030`.

---

### Charcoal

- **Class:** `charcoal`
- **Background:** Dark grey (`#2b2b2b`)
- **Text:** White
- **Use when:** Footer-adjacent sections, dark-themed content bands, or sections that need a neutral but strong visual contrast without using brand colour.

**Accessibility:** Meets WCAG AA contrast ratio for white text on `#2b2b2b`.

---

### Teal

- **Class:** `teal`
- **Background:** Teal (`#007b8a`)
- **Text:** White
- **Use when:** Feature highlight sections, calls-to-action, or informational bands. Communicates trust and clarity.

**Accessibility:** Meets WCAG AA contrast ratio for white text on `#007b8a`.

---

## Authoring Rules

| Rule | Detail |
|------|--------|
| One style per section | Only one background style can be applied per section. Do not combine style names (e.g. `aubergine teal` is not valid). |
| Dark sections need light content | When using `aubergine`, `charcoal`, or `teal`, ensure all text, headings, and icons use white or light-coloured variants. |
| Avoid consecutive dark sections | Do not stack two dark-background sections (e.g. aubergine followed immediately by charcoal) — alternate with a light or default section. |
| Limit bold colours per page | Use `aubergine` and `teal` at most once or twice per page to preserve visual hierarchy. |
| Images and icons | Ensure images placed inside dark sections have transparent backgrounds or are otherwise legible on the section colour. |

---

## CSS Variables Reference

The style policies are implemented via CSS custom properties defined in `styles/styles.css`:

```css
--color-aubergine: #3d0030;
--color-aubergine-text: #ffffff;

--color-charcoal: #2b2b2b;
--color-charcoal-text: #ffffff;

--color-teal: #007b8a;
--color-teal-text: #ffffff;
```

These variables allow a single-source colour update — changing the variable value in `:root` automatically updates every section that uses that style across the site.

---

## Developer Notes

Section style classes are added automatically by AEM EDS when a Section Metadata block is present. The CSS selectors follow the pattern:

```css
main .section.aubergine { ... }
main .section.charcoal  { ... }
main .section.teal      { ... }
```

Each dark-background section also overrides `a:any-link` colour to white so that links remain visible without additional authoring work.

To add a new style policy:

1. Add a new CSS custom property pair (`--color-<name>` and `--color-<name>-text`) to `:root` in `styles/styles.css`.
2. Add a `main .section.<name>` rule setting `background-color` and `color`.
3. Add a `main .section.<name> a:any-link` rule if text link contrast requires it.
4. Document the new style in this file.
