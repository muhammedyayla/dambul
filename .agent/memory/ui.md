Design Style:
- Minimal
- Dark mode first
- Circular avatars on map
- Clean modern UI (iOS style)

Screens:
- Login
- Register
- Map# UI Design System

## Color palette — STRICT, never deviate

| Token | Hex | Usage |
|---|---|---|
| `colorBackground` | #0A0F1E | App background (deep midnight blue) |
| `colorSurface` | #111827 | Cards, sheets, nav bar |
| `colorSurfaceElevated` | #1E2A3A | Elevated cards, modals |
| `colorPrimary` | #1D3A6B | Primary brand blue |
| `colorAccent` | #4A7FC1 | Interactive highlights, active states, progress rings |
| `colorOnPrimary` | #FFFFFF | Text/icons on primary |
| `colorTextPrimary` | #FFFFFF | Main body text |
| `colorTextSecondary` | #9CA3AF | Muted / helper text |
| `colorTextTertiary` | #4B5563 | Placeholders, disabled |
| `colorBorder` | #1F2D40 | Dividers, input underlines |
| `colorBorderStrong` | #2E4060 | Card outlines, focused inputs |
| `colorButtonPrimary` | #FFFFFF | Primary pill button fill |
| `colorButtonPrimaryText` | #0A0F1E | Text on primary button |
| `colorButtonSecondary` | #1E2A3A | Secondary pill button fill |
| `colorButtonSecondaryText` | #FFFFFF | Text on secondary button |
| `colorPinGlow` | #4A7FC1 | Map pin aura / glow ring |
| `colorFAB` | #FFFFFF | Floating action button fill |
| `colorFABIcon` | #0A0F1E | Icon on FAB |
| `colorTagSelected` | #FFFFFF | Selected interest chip fill |
| `colorTagSelectedText` | #0A0F1E | Text on selected chip |
| `colorTagUnselected` | transparent | Unselected chip fill |
| `colorTagBorder` | #2E4060 | Unselected chip border |
| `colorStarActive` | #4A7FC1 | Active star (rating screen) |

## Typography

| Role | Size | Weight | Color token |
|---|---|---|---|
| Heading large | 24px | Bold (700) | colorTextPrimary |
| Heading medium | 20px | SemiBold (600) | colorTextPrimary |
| Body | 15px | Regular (400) | colorTextPrimary |
| Helper / subtext | 13px | Regular (400) | colorTextSecondary |
| Field label | 12px | Regular (400) | colorTextSecondary |
| Field value | 16px | SemiBold (600) | colorTextPrimary |
| Counter (e.g. 9/20) | 12px | Regular | colorTextTertiary — bottom-right |
| Step badge (e.g. 2/14) | 13px | Bold (700) | colorTextPrimary |
| Button label | 16px | SemiBold (600) | per button token |
| Nav label | 11px | Regular (400) | colorTextSecondary |

- Base font: system default (SF Pro on iOS, Roboto on Android) unless project font is defined
- Never use font sizes below 11px

## Spacing & layout

| Token | Value |
|---|---|
| `spacingXS` | 4px |
| `spacingS` | 8px |
| `spacingM` | 16px |
| `spacingL` | 24px |
| `spacingXL` | 32px |
| `spacingXXL` | 48px |
| Screen horizontal padding | 20px |
| Card inner padding | 24px |
| Bottom button area padding | 20px |

## Border radius

| Token | Value | Usage |
|---|---|---|
| `radiusSM` | 8px | Small chips, badges |
| `radiusMD` | 12px | Input fields |
| `radiusLG` | 20px | Cards, bottom sheets |
| `radiusPill` | 999px | Buttons, tag chips |
| `radiusCircle` | 50% | Avatars, logo, FAB |

## Component rules

### Screen structure (onboarding)
```
Screen bg: colorBackground
├── Top center: mascot logo circle (64px, colorSurface bg)
├── Top right: step badge (colorSurface circle + colorAccent progress ring)
├── Center: single surface card (colorSurface, radiusLG, no shadow)
│   ├── Bold white heading
│   ├── Muted helper text
│   └── Input row (icon + gray label + white value + colorBorder underline)
└── Bottom: two pill buttons side by side (full width split)
    ├── Left: secondary pill (← Geri / ✕ İptal)
    └── Right: primary pill (İleri → / action)
```

### Cards
- Background: `colorSurface`
- Border-radius: `radiusLG` (20px)
- Border: 1px solid `colorBorderStrong` — subtle outline only
- No drop shadows — flat design
- Padding: 24px

### Buttons
- Height: 56px
- Border-radius: `radiusPill`
- Primary: fill `colorButtonPrimary`, text `colorButtonPrimaryText`
- Secondary: fill `colorButtonSecondary`, text `colorButtonSecondaryText`, border 1px `colorBorderStrong`
- Never use floating action button alongside bottom nav during onboarding

### Input fields
- Icon (20px, colorTextSecondary) + label row
- Value text: colorTextPrimary, semibold
- Bottom border: 1px `colorBorder`
- On focus: border changes to `colorAccent`
- Clear (✕) button: colorTextSecondary, right-aligned

### Bottom sheet / dropdown
- Background: `colorSurface`
- Top border-radius: 20px
- Drag handle: 4×40px pill, `colorBorder`, centered top
- Header row: icon + label + chevron-down
- Option row: 56px tall, icon + text, no dividers
- Selected row: `colorAccent` left bar (3px) + text `colorTextPrimary`

### Tag / interest chips
- Border-radius: `radiusPill`
- Unselected: transparent fill, 1px `colorTagBorder` border, `colorTextSecondary` text
- Selected: `colorTagSelected` fill, `colorTagSelectedText` text
- Height: 36px, horizontal padding: 14px
- Wrapping flex-wrap layout, 8px gap

### Progress ring (step badge)
- Outer ring: `colorAccent` arc on `colorBorder` track
- Inner circle: `colorSurface`
- Text: "N/14" in `colorTextPrimary`
- Size: 44px diameter

### Sliders
- Track (completed): `colorAccent`
- Track (remaining): `colorBorder`
- Thumb: `colorButtonPrimary` (white circle, 22px)

### Toggle switch
- ON: `colorAccent` track
- OFF: `colorBorder` track
- Thumb: `colorButtonPrimary`

### Map screen
- Map tile style: dark (Mapbox dark / custom dark style)
- User pin: circular photo (48px) with `colorPinGlow` aura ring
- Cluster badge: `colorSurface` circle, `colorTextPrimary` number
- FAB (center-bottom): `colorFAB` circle (56px), `colorFABIcon` "+" icon, outline `colorAccent` ring
- Side action buttons: `colorSurface` circles (44px), icon `colorTextPrimary`

### Bottom navigation bar
- Background: `colorSurface`
- Top border: 1px `colorBorder`
- Height: 72px (including safe area)
- 5 items: icon (24px) + label (11px) stacked
- Active: icon `colorAccent`, label `colorAccent`
- Inactive: icon `colorTextTertiary`, label `colorTextTertiary`

## Do not rules
- ❌ Never use gradients
- ❌ Never add drop shadows to cards or buttons
- ❌ Never use yellow, pink, red, green, or orange — not in this palette
- ❌ Never use system/platform UI components (Material chips, iOS pickers, etc.)
- ❌ Never place readable text directly on `colorBackground` without a card
- ❌ Never use border-radius below 8px on interactive elements
- ❌ Never show bottom nav on onboarding screens
- ❌ Never use more than one card on screen simultaneously during onboarding
- ❌ Never change the app name
- Profile

UX:
- Simple
- Fast
- No clutter