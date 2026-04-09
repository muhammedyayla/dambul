# Architecture

## Tech stack
- **Framework:** Flutter (Dart)
- **State management:** [Define: Riverpod / Bloc / Provider]
- **Navigation:** GoRouter
- **Map:** Mapbox Flutter SDK (dark tile style)
- **Auth:** Firebase Auth — Apple Sign-In + Google Sign-In
- **Backend:** [Define: Firebase / Supabase / custom API]
- **Storage:** [Define: Firebase Storage / S3]

## Folder structure
```
lib/
├── main.dart
├── app/
│   ├── app.dart              # MaterialApp + theme
│   ├── router.dart           # GoRouter route definitions
│   └── theme.dart            # AppTheme, color tokens, text styles
├── features/
│   ├── onboarding/
│   │   ├── screens/          # One file per step (step_01_nickname.dart … step_14_x.dart)
│   │   ├── widgets/          # Shared onboarding card, step badge, pill buttons
│   │   └── controller/       # Onboarding state & navigation logic
│   ├── map/
│   │   ├── screens/
│   │   ├── widgets/          # UserPin, ClusterBadge, MapFAB, SideActions
│   │   └── controller/
│   ├── swipe/
│   ├── chat/
│   ├── hub/
│   ├── notifications/
│   └── icebreaker/
├── shared/
│   ├── widgets/              # AppButton, AppCard, AppBottomSheet, TagChip, SliderField
│   ├── models/               # User, Match, Message, etc.
│   └── services/             # AuthService, LocationService, StorageService
└── constants/
    ├── colors.dart           # All color tokens (mirrors ui.md palette)
    ├── spacing.dart          # Spacing tokens
    └── text_styles.dart      # All typography styles
```

## Naming conventions
- Files: `snake_case.dart`
- Classes: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `kCamelCase` (e.g. `kColorBackground`)
- Feature screens: `[feature]_screen.dart`
- Feature widgets: descriptive noun (e.g. `step_badge.dart`, `user_pin.dart`)

## Theme setup
All colors defined in `constants/colors.dart` as `const Color` values matching `ui.md` tokens.
`AppTheme` in `app/theme.dart` maps tokens to `ThemeData`. Never hardcode hex values outside `colors.dart`.

## Onboarding architecture
- Single `OnboardingController` holds all collected data as a mutable state object
- Each step screen is a stateless widget — reads/writes via controller
- Navigation: `OnboardingController.nextStep()` / `.previousStep()` pushes named GoRouter routes
- Step badge progress computed from `currentStep / totalSteps` (14 total)
- Data persisted to local storage after each step (resume support)
- On step 12 (auth), controller triggers Firebase auth flow; on success continues to step 13

## Map screen
- Mapbox `MapWidget` fills full screen
- User locations fetched from backend, rendered as `UserPin` widgets via Mapbox annotation layer
- Clusters computed client-side for zoom levels < 12
- Location updates via `LocationService` (background location if permitted)
- FAB "+" opens create-post / check-in bottom sheet

## Key shared widgets
| Widget | Props | Notes |
|---|---|---|
| `AppButton` | label, onTap, isPrimary, icon | Pill shape, 56px height |
| `AppCard` | child, padding | colorSurface bg, radiusLG, border |
| `StepBadge` | current, total | Progress ring, top-right position |
| `TagChip` | label, isSelected, onTap | Pill chip, toggle behavior |
| `SliderField` | label, value, min, max, unit | White thumb, accent track |
| `BottomSheetOption` | icon, label, isSelected, onTap | 56px row |

## Code rules
- Refactor as you go — no file should exceed ~200 lines
- Extract any widget used in 2+ places to `shared/widgets/`
- Never use `absolute` positioning; use `Stack` only when layering is semantically required (e.g. map pins)
- Use `const` constructors wherever possible
- All spacing values must reference `constants/spacing.dart` tokens — no magic numbers
- All colors must reference `constants/colors.dart` — no inline hex