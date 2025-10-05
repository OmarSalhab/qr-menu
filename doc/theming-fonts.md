# Theming & Fonts

## Objectives
- Centralize brand color to allow quick rebranding.
- Support light/dark modes.
- Toggle between two Arabic-friendly font stacks (classic vs elegant) without layout shift.
- Avoid Flash of Unstyled Content (FOUC) or hydration mismatches.

## Data Flow

1. Admin sets `brandColor`, `themeMode`, `fontStyle` in the store record.
2. Home SSR fetch sets headers / root attributes (or directly sets attributes in server HTML) so CSS variables & font class apply before client JS.
3. Client components read CSS variables (`--brand-*`) & `data-theme`, `data-font` to style.

## Brand Color Strategy

- `brandColor` stored as a single hex.
- Derived palette shades (e.g., `--brand-600`, `--brand-700`) can be generated statically or algorithmically. Current approach: manually curated CSS variables in `globals.css` (or `theme.css`) referencing root var for main shade.
- Changing `brandColor` requires re-saving store → triggers SSR new HTML with updated inline style or attribute.

## Theme Mode

- Attribute: `data-theme="light" | "dark"` on `<html>`.
- CSS defines `[data-theme="dark"] { --surface: ... }` etc.
- Toggling in admin immediately applies attributes client-side for preview (without persistence) until save.

## Font Style

- Attribute: `data-font="classic" | "elegant"` on `<html>`.
- CSS font-face declarations loaded for both ahead of time (preload or standard) to minimize swap.
- Classic: e.g., Tajawal; Elegant: e.g., Noto Naskh Arabic (configure actual families in CSS).

## Sample Root Markup

```html
<html dir="rtl" data-theme="light" data-font="classic" lang="ar">
```

## Sample Variable Usage

```css
:root {
  --brand: var(--brand-600);
}
.button-primary { background: var(--brand-700); }
```

## Avoiding Hydration Mismatch

- Never compute theme or font client-side first render; always supply SSR attributes.
- If a user-level preference (future) is introduced, use a server cookie + middleware to inject correct attributes before React hydration.

## Future Enhancements

| Feature | Approach |
|---------|----------|
| User theme override | Add cookie + server middleware reading cookie → attribute injection |
| Dynamic palette | Derive tints/shades via OKLCH or HSL transform at build-time or during admin save, caching results |
| Additional fonts | Extend enum and ensure preloading `<link rel="preload" as="font" ...>` |

---
Return to `working-hours.md` to see time-sensitive label handling.
