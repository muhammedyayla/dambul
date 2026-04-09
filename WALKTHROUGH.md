# Dambull — Flutter Project Walkthrough

## Rules (her oturumda önce oku)
- Her yeni Claude oturumunda önce `memory-bank/` klasörünü oku
- Hiçbir zaman hardcoded hex renk kullanma → `constants/colors.dart`
- Hiçbir zaman magic number spacing kullanma → `constants/spacing.dart`
- Bir dosya 200 satırı geçerse refactor et
- Her adımı tamamladıktan sonra bu dosyada ✅ işaretle

---

## Phase 0 — Project Bootstrap
- [x] `flutter create dambull --org com.dambull --platforms ios,android` ✅
- [x] `pubspec.yaml` bağımlılıklarını ekle (aşağıya bak) ✅
- [x] Klasör yapısını oluştur (`lib/` altında tüm feature klasörleri) ✅
- [x] `constants/colors.dart` → ui.md'deki tüm token'ları `const Color` olarak tanımla ✅
- [x] `constants/spacing.dart` → ui.md spacing token'larını tanımla ✅
- [x] `constants/text_styles.dart` → ui.md typography'i tanımla ✅
- [x] `app/theme.dart` → AppTheme, Dark ThemeData, token'larla dolu ✅
- [x] `app/router.dart` → GoRouter skeleton (tüm route'lar placeholder) ✅
- [x] `app/app.dart` → MaterialApp.router + theme ✅

## Phase 0 — pubspec.yaml bağımlılıklar
```yaml
dependencies:
  flutter:
    sdk: flutter
  go_router: ^14.0.0
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0
  google_sign_in: ^6.2.0
  sign_in_with_apple: ^6.0.0
  mapbox_maps_flutter: ^2.0.0
  image_picker: ^1.1.0
  geolocator: ^12.0.0
  shared_preferences: ^2.3.0
  cached_network_image: ^3.3.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.0
  flutter_lints: ^4.0.0
```

---

## Phase 1 — Shared Widget Library
- [x] `shared/widgets/app_button.dart` → AppButton (primary/secondary, 56px, pill) ✅
- [x] `shared/widgets/app_card.dart` → AppCard (colorSurface, radiusLG, border) ✅
- [x] `shared/widgets/tag_chip.dart` → TagChip (selected/unselected states) ✅
- [x] `shared/widgets/slider_field.dart` → SliderField (accent track, white thumb) ✅
- [x] `shared/widgets/app_bottom_sheet.dart` → drag handle, option rows ✅

## Phase 2 — Onboarding Screens (14 adım)
Her step için: `features/onboarding/screens/step_XX_name.dart`

- [x] `OnboardingController` (Riverpod StateNotifier) → tüm state burada ✅
- [x] `StepBadge` widget → progress ring, current/total ✅
- [x] `OnboardingCard` widget → ortak card wrapper ✅
- [x] `PillButtonRow` widget → ikili buton satırı ✅

Step'ler sırayla:
- [x] Step 01 — Nickname (text input) ✅
- [x] Step 02 — Date of Birth (custom date picker, no system picker) ✅
- [x] Step 03 — Gender (3 seçenek, tag chip tarzı) ✅
- [x] Step 04 — Relationship Intent (7 seçenek chip) ✅
- [x] Step 05 — Bio (255 char, counter alt-sağ) ✅
- [x] Step 06 — Languages (multi-select chip grid) ✅
- [ ] Step 07 — [Reserved, skip screen]
- [x] Step 08 — Height & Weight (iki slider, cm/kg ↔ ft/lbs toggle) ✅
- [x] Step 09 — Interests (tag chip, max 10, 2 sayfalık scroll) ✅
- [x] Step 10 — Photo Upload (gallery + camera seçenek) ✅
- [x] Step 11 — Location Permission (system dialog trigger) ✅
- [x] Step 12 — Auth (Apple + Google butonları, Firebase entegrasyonu) ✅
- [x] Step 13 — App Store Rating prompt ✅
- [x] Step 14 — Completion / map'e geçiş ✅

## Phase 3 — Map Screen
- [x] `features/map/screens/map_screen.dart` → Mapbox MapWidget fullscreen ✅
- [x] `features/map/widgets/user_pin.dart` → circular photo, glow ring ✅
- [x] `features/map/widgets/cluster_badge.dart` → colorSurface circle, number ✅
- [x] `features/map/widgets/map_fab.dart` → white FAB, colorAccent ring ✅
- [x] `features/map/widgets/side_actions.dart` → 44px icon circles ✅
- [x] Bottom nav bar (5 tab) ✅
- [x] LocationService bağlantısı ✅

## Phase 4 — Auth & Firebase
- [x] `shared/services/auth_service.dart` ✅
- [ ] Firebase project setup (google-services.json / GoogleService-Info.plist)
- [ ] Apple Sign-In entitlements

## Phase 5 — Profile & Diğer Ekranlar
- [ ] Swipe screen (card stack)
- [ ] Chat list screen
- [ ] Hub screen
- [ ] Notifications screen
- [ ] Icebreaker screen

---

## Oturum Başlangıç Komutu
Her yeni Claude oturumunda şunu söyle:
> "memory-bank klasöründeki tüm dosyaları oku, WALKTHROUGH.md'deki ilk işaretsiz adımdan devam et."