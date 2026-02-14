# Kitfly Brand Palette

## Primary Colors

| Name      | Hex       | RGB               | Usage                                 |
| --------- | --------- | ----------------- | ------------------------------------- |
| **Navy**  | `#152F46` | rgb(21, 47, 70)   | Document shape, headers, primary text |
| **Teal**  | `#007182` | rgb(0, 113, 130)  | Feather/wing, links, accents          |
| **Coral** | `#D17059` | rgb(209, 112, 89) | Call-to-action, energy accent         |

## Secondary Colors

| Name                | Hex       | RGB                | Usage                                        |
| ------------------- | --------- | ------------------ | -------------------------------------------- |
| **Dark Background** | `#0D1117` | rgb(13, 17, 23)    | Dark mode backgrounds (GitHub-style neutral) |
| **Teal Mid**        | `#0A6172` | rgb(10, 97, 114)   | Hover states, secondary accent               |
| **Teal Light**      | `#709EA6` | rgb(112, 158, 166) | Disabled states, subtle borders              |

## Neutral Colors

| Name           | Hex       | RGB                | Usage                           |
| -------------- | --------- | ------------------ | ------------------------------- |
| **White**      | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, text on dark       |
| **Light Gray** | `#F5F7F8` | rgb(245, 247, 248) | Code blocks, subtle backgrounds |
| **Mid Gray**   | `#6B7280` | rgb(107, 114, 128) | Secondary text, borders         |
| **Dark Gray**  | `#374151` | rgb(55, 65, 81)    | Body text                       |

## CSS Variables

```css
:root {
  /* Primary */
  --kitfly-navy: #152f46;
  --kitfly-teal: #007182;
  --kitfly-coral: #d17059;

  /* Secondary */
  --kitfly-dark-bg: #0d1117;
  --kitfly-teal-mid: #0a6172;
  --kitfly-teal-light: #709ea6;

  /* Neutral */
  --kitfly-white: #ffffff;
  --kitfly-gray-100: #f5f7f8;
  --kitfly-gray-500: #6b7280;
  --kitfly-gray-700: #374151;
}
```

## Dark Mode

| Light Mode             | Dark Mode               |
| ---------------------- | ----------------------- |
| Navy text on white     | White text on deep navy |
| Teal accents           | Teal light accents      |
| Light gray backgrounds | Deep navy backgrounds   |

## Color Swatches

```
Navy        ████████  #152F46
Teal        ████████  #007182
Coral       ████████  #D17059
Dark BG     ████████  #0D1117
Teal Mid    ████████  #0A6172
Teal Light  ████████  #709EA6
```

## Brand Rationale

- **Navy**: Professional, trustworthy - represents the "kit" (document/container)
- **Teal**: Fresh, tech-forward - represents "fly" (motion, speed)
- **Coral**: Energy, action - draws attention to CTAs without being aggressive

The palette avoids pure black for better readability and uses blue-green tones that work well in both light and dark modes.
