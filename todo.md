# TODO.md — Dating App Full Implementation

## Stack
- Frontend: Vite + React 19 + React Router 7 + Tailwind + Radix UI (port 5173)
- Backend: Express.js API server (port 3001)
- Database: Neon PostgreSQL (neon_connection_string)
- Auth: Google OAuth2 (google_oauth_client_id, google_oauth_client_secret)
- Real-time: Ably (ably_token)
- Map: Mapbox GL JS (map_box_token)
- Upload: Vercel Blob

## Env var key names (values already in .env)
- map_box_token
- neon_connection_string
- ably_token
- google_oauth_client_id
- google_oauth_client_secret

## Rules
- Complete each task fully before moving to the next
- TypeScript throughout
- All user-facing text in Turkish
- npm run dev → frontend (5173)
- npm run dev:server → backend (3001)
- npm run dev:all → both concurrently
- Every page except /map and /login has ChevronDown button top-right → navigates to /map
- FloatingTabBar only renders on /map route
- All API calls use http://localhost:3001

---

## TASK 1 — Backend Setup + Google OAuth

- Create /server directory with Express app (server/index.ts)
- Install: express, cors, cookie-session, passport, passport-google-oauth20, pg, @neondatabase/serverless, dotenv, concurrently, ts-node
- Connect to Neon using process.env.neon_connection_string
- Setup Passport Google OAuth2 strategy:
  - On login: find or create user in users table by google_id
  - Store user id in session cookie
  - Redirect to http://localhost:5173/map on success
  - Redirect to http://localhost:5173/login on failure
- Routes:
  - GET /api/auth/google → start OAuth
  - GET /api/auth/google/callback → handle callback
  - GET /api/auth/me → return current user from session (401 if not logged in)
  - POST /api/auth/logout → clear session
- Add scripts to package.json:
  - "dev:server": "ts-node server/index.ts"
  - "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\""
- Frontend:
  - Create /login route with "Google ile Giriş Yap" button → href to http://localhost:3001/api/auth/google
  - Auth guard: if /api/auth/me returns 401 → redirect to /login
  - If user has no city/lat/lng after login → redirect to /onboarding

---

## TASK 2 — Onboarding (Profile Setup)

- Route: /onboarding
- Only shown once after first Google login if profile is incomplete
- Single scrollable page form:
  - Profile photo upload → POST /api/upload → save URL to users.avatar_url
  - Name (pre-filled from Google), city, height (cm)
  - Gender select: Kadın / Erkek / Diğer
  - Bio text area
  - Tags input: add/remove chips (lifestyle, hobbies)
  - Personality sliders (0–100 each):
    - Mizahın: Alaycı ←→ Pozitif
    - Enerji: İçe dönük ←→ Dışa dönük
    - Yaşam tarzın: Güvenli ←→ Maceracı
    - İlk adım: Ben atarım ←→ Beklerim
    - Aşk dilin: Kelime ←→ Dokunma
    - Hafta sonu: Evde chill ←→ Macera
  - Submit → PATCH /api/users/me → redirect to /map
- Backend:
  - POST /api/upload → accept image → upload to Vercel Blob → return URL
  - PATCH /api/users/me → update all user fields for current session user

---

## TASK 3 — Mapbox 3D Globe Map

- Install: mapbox-gl @types/mapbox-gl
- vite.config.ts: use loadEnv, inject import.meta.env.MAP_BOX_TOKEN from env.map_box_token
- Import mapbox-gl/dist/mapbox-gl.css in main.tsx
- Rewrite MapScreen.tsx:
  - Full viewport mapboxgl.Map
  - Projection: globe
  - Style: mapbox://styles/mapbox/dark-v11
  - Disable NavigationControl (no +/- buttons)
  - Enable: drag pan, drag rotate, scroll zoom, touch pitch, touch rotate
  - Remove all old controls
  - Fetch all users with show_on_map=true from GET /api/users/map
  - Add heatmap layer from user coordinates
  - Add avatar photo markers — click → navigate to /profile/:userId
  - Top left overlay:
    - MapPin icon + bold neighborhood/city name (from current user's city)
    - Clock icon + current time
    - Weather icon + mock 18°C
  - Top right overlay (vertical stack of circular buttons):
    - User avatar → navigate to /settings
    - Rocket icon → Boost (mock, show toast)
    - Calendar icon → Events (mock, show toast)
  - Bottom: FloatingTabBar pill with 4 tabs: Swipe | Chat | Scene | Bildirim
  - If map token missing: show clear error message on screen
- Backend:
  - GET /api/users/map → all users where show_on_map=true with id, name, avatar_url, lat, lng

---

## TASK 4 — Swipe Screen

- Route: /swipe
- ChevronDown top-right → /map
- Fetch users from GET /api/users/swipe?gender=X
- Full screen card stack. Each card: full width photo, name/age/city overlay at bottom
- Drag right → like, drag left → pass (use framer-motion)
- Bottom buttons: ✕ Pass | ★ Super Like | ♥ Like
- On like/super like:
  - POST /api/likes { to_user, type }
  - Backend creates notification for target user (action: "seni beğendi")
  - If mutual like → auto-create chat_thread between both users
- Backend:
  - GET /api/users/swipe?gender=X → users filtered by gender, excluding already-liked and self
  - POST /api/likes → save like, create notification, check mutual → create thread if match

---

## TASK 5 — Chat (List + Thread + Real-time)

- Install: ably
- Chat list route: /chat
  - ChevronDown → /map
  - Fetch GET /api/chat/threads → threads with other user info + last message
  - Each row: avatar, name, last message preview, timestamp → navigate to /chat/:threadId
- Chat thread route: /chat/:threadId
  - ChevronDown → /map
  - Fetch GET /api/chat/:threadId/messages → message history
  - Real-time: fetch Ably token from GET /api/ably/token, subscribe to channel "chat:threadId"
  - Input + send button → POST /api/chat/:threadId/messages
    - Backend saves to messages table
    - Backend publishes to Ably channel "chat:threadId"
  - Messages render in scrollable list, newest at bottom, auto-scroll
- Backend routes:
  - GET /api/chat/threads → threads for current user with last message + other user info
  - GET /api/chat/:threadId/messages → all messages in thread (verify user is participant)
  - POST /api/chat/:threadId/messages → save message + publish to Ably
  - GET /api/ably/token → return Ably token request using ably_token env var as API key
  - POST /api/chat/threads → find or create thread between current user and other_user_id

---

## TASK 6 — Scene Screen

- Routes: /scene (feed), /scene/:postId (detail)
- ChevronDown on both → /map
- Feed:
  - Fetch GET /api/scene/posts
  - Each row: avatar, name, post title, location tag, relative time (Turkish)
  - FAB (+) button bottom right → opens create post modal
  - Create post form: title + location tag → POST /api/scene/posts
- Post detail /scene/:postId:
  - Fetch GET /api/scene/posts/:postId
  - Show poster mini profile card: avatar, name, city, tags
  - "Mesaj Gönder" button → POST /api/chat/threads { other_user_id } → navigate to /chat/:threadId
- Backend routes:
  - GET /api/scene/posts → all posts with author info, newest first
  - POST /api/scene/posts → create post for current session user
  - GET /api/scene/posts/:id → single post with author info

---

## TASK 7 — Notifications Screen

- Route: /notifications
- ChevronDown → /map
- Fetch GET /api/notifications
- Each row: actor avatar + action text + relative time (Turkish)
- Mark all read on page load: PATCH /api/notifications/read
- Show unread badge count on Bildirim tab in FloatingTabBar
- Backend routes:
  - GET /api/notifications → notifications for current user with actor info, newest first
  - PATCH /api/notifications/read → mark all as read for current user

---

## TASK 8 — Full Profile Screen

- Route: /profile/:userId
- ChevronDown → navigate(-1)
- Fetch GET /api/users/:userId
- On view: POST /api/profile-views { viewed_id } → creates notification for viewed user
- Scrollable layout top to bottom:
  - Hero photo (full width)
  - Name, city, height
  - Bio text
  - Extra photos interspersed between info sections
  - Tags as chips
  - Soyut Röportaj Q&A section
  - Personality section — read-only horizontal bars:
    - Mizahın? → Alaycı ——— Karışık ——— Pozitif
    - Enerji seviyen → İçe dönük ——— Dengeli ——— Dışa dönük
    - Yaşam tarzın → Güvenli ve rahat ——— Orta ——— Maceracı ve riskli
    - İlk adımı kim atar? → Ben atarım ——— Herhangi biri ——— Beklerim
    - Aşk dilin ne? → Kelime aşığı ——— Hediye bağımlısı ——— Dokunma arayıcı
    - İdeal hafta sonun? → Evde chill ——— Arkadaşlarla dışarı ——— Macera modu
  - Block button + Report button at bottom (mock actions)
- Backend:
  - GET /api/users/:userId → full user profile excluding sensitive fields
  - POST /api/profile-views → record view + create notification for viewed user

---

## TASK 9 — Settings Screen

- Route: /settings
- ChevronDown → /map
- Fetch current user from GET /api/auth/me
- Scrollable sections top to bottom:
  - Profile photo (tappable → upload new → Vercel Blob → PATCH /api/users/me)
  - Editable fields: name, city, height → PATCH /api/users/me on save
  - Tercihler (all horizontal sliders, save on change):
    - Görmek istiyorum: Kadınlar / Erkekler / Herkes
    - Yaş aralığı: 18–100
    - Mesafe: min, 25km, 50km, 100km, max
    - Boy: 130–230 cm
  - Personality editable sliders (same 6 dimensions) → PATCH /api/users/me
  - Ayarlar list rows:
    - Dilim → arrow (mock)
    - Titreme → toggle → PATCH /api/users/me
    - Bildirimler → toggle → PATCH /api/users/me
    - Beni haritada göster → toggle → PATCH /api/users/me
    - Satın Alımları Geri Yükle → arrow (mock)
    - SSS → arrow (mock)
    - İletişim → arrow (mock)
    - Terimler → arrow (mock)
    - Mahremiyet → arrow (mock)
    - Topluluk Kuralları → arrow (mock)
    - Çıkış Yap → POST /api/auth/logout → redirect to /login