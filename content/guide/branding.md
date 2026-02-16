---
title: Branding
description: Configure header logos, footer logos, and dark mode variants
---

# Branding

Kitfly sites display your brand in two locations: the **header** (sidebar logo + site title) and the **footer ribbon** (optional logo, copyright, links). Both support light/dark mode variants.

## Header Logo

The header logo appears in the sidebar above the navigation. Configure it in `site.yaml`:

```yaml
brand:
  name: "My Project"
  url: "/"
  logo: "assets/brand/logo.png"
```

The logo renders inside a bounded slot that preserves aspect ratio. Both square icons and wide wordmarks work — set `logoType` to tell kitfly which you're using:

```yaml
brand:
  logo: "assets/brand/logo.png"
  logoType: "icon" # square mark (default)
```

```yaml
brand:
  logo: "assets/brand/wordmark.svg"
  logoType: "wordmark" # wide logo
```

| Breakpoint       | Max Height | Max Width |
| ---------------- | ---------- | --------- |
| Desktop          | 64px       | 180px     |
| Tablet (≤1024px) | 56px       | 150px     |
| Mobile (≤768px)  | 48px       | 130px     |

SVG and PNG formats are supported. For SVGs, ensure the `viewBox` is tightly cropped to the artwork.

If the logo image is missing or fails to load, kitfly falls back to displaying the first letter of your brand name.

## Footer Logo

Add a logo to the footer ribbon — typically a parent company, client, or partner logo that differs from the header brand:

```yaml
footer:
  logo: "assets/brand/footer-logo.png"
```

The footer logo renders at the leading edge of the ribbon, before the version and publish date.

### Footer Logo Options

| Field        | Default                      | Description                         |
| ------------ | ---------------------------- | ----------------------------------- |
| `logo`       | _(none)_                     | Path to footer logo image           |
| `logoUrl`    | _(none)_                     | Make the logo a clickable link      |
| `logoAlt`    | Copyright text or brand name | Alt text for accessibility          |
| `logoHeight` | `20`                         | Max height in pixels (range: 10-40) |

```yaml
footer:
  logo: "assets/brand/footer-logo.png"
  logoUrl: "https://example.com"
  logoAlt: "Example Corp"
  logoHeight: 24
```

If no `footer.logo` is set, the footer renders as text only (version, copyright, links, attribution) — no change from the default.

## Dark Mode Variants

By default, kitfly auto-adjusts logo brightness in dark mode using a CSS filter. This works for many logos but can distort brand colors or fail on dark logos with transparent backgrounds.

For precise control, provide a separate dark mode image:

### Header

```yaml
brand:
  logo: "assets/brand/logo.png"
  logoDark: "assets/brand/logo-dark.png"
```

### Footer

```yaml
footer:
  logo: "assets/brand/footer-logo.png"
  logoDark: "assets/brand/footer-logo-dark.png"
```

### How It Works

When `logoDark` is set, kitfly emits both images and uses CSS to show the correct one based on the active theme. No JavaScript is involved — the swap is instant on theme toggle.

| Configuration       | Light Mode | Dark Mode                         |
| ------------------- | ---------- | --------------------------------- |
| `logo` only         | Shows logo | Shows logo with brightness filter |
| `logo` + `logoDark` | Shows logo | Shows logoDark (no filter)        |

### Recommendations

- Use the **single logo** approach when your logo works on both light and dark backgrounds (e.g. a colorful icon on transparent background)
- Use **light + dark variants** when your logo has a specific background assumption (e.g. dark wordmark that disappears on dark backgrounds)
- Keep both variants at the **same dimensions** so the layout doesn't shift on theme toggle
- SVG is ideal for both variants — resolution-independent and small file size

## Recommended Asset Files

| Asset               | Location                            | Size / Format       |
| ------------------- | ----------------------------------- | ------------------- |
| Logo (light)        | `assets/brand/logo.png`             | 200x50px or SVG     |
| Logo (dark)         | `assets/brand/logo-dark.png`        | Same as logo        |
| Footer logo (light) | `assets/brand/footer-logo.png`      | Max height 20-40px  |
| Footer logo (dark)  | `assets/brand/footer-logo-dark.png` | Same as footer logo |
| Favicon             | `assets/brand/favicon.ico`          | 32x32px             |

## Full Example

A site with separate header and footer logos, both with dark mode variants:

```yaml
# site.yaml
title: "Product Brief"

brand:
  name: "Product Name"
  url: "/"
  logo: "assets/brand/product-logo.png"
  logoDark: "assets/brand/product-logo-dark.png"
  logoType: "wordmark"

footer:
  copyright: "© 2026 Parent Company, Inc."
  copyrightUrl: "https://example.com"
  logo: "assets/brand/parent-logo.png"
  logoDark: "assets/brand/parent-logo-dark.png"
  logoAlt: "Parent Company"
  logoHeight: 20
  attribution: true
```
