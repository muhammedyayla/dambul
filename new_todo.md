# TODO.md — Upgrade Tasks

## Env additions (.env'de zaten tanımlı)
- cloudinary_api_key
- cloudinary_api_secret
- cloudinary_cloud_name

## DB change
- scene_posts tablosunu vibe_posts olarak yeniden adlandır:
  `ALTER TABLE scene_posts RENAME TO vibe_posts;`
- Tüm backend referanslarını scene_posts → vibe_posts olarak güncelle

---

## TASK 1 — Tab Bar: Icebreaker kaldır, Map sekmesi ekleme

- FloatingTabBar'dan Icebreaker sekmesini kaldır
- Tab bar 4 sekme olacak: Swipe | Chat | Vibe | Bildirim
- Tab bar'a Map sekmesi ekleme, map zaten ana sayfa
- /map rotası tab bar'ı render etmeye devam eder

---

## TASK 2 — Mapbox Canvas2D hatasını düzelt

- map.setTerrain() çağrısını kaldır
- Hillshade layer ekleme
- Terrain source ekleme
- mapboxgl.Map init options'a şunu ekle:
  `optimizeForTerrain: false`
- Harita globe projection ve dark-v11 style ile düzgün yüklendiğini doğrula

---

## TASK 3 — Cloudinary foto upload

- Server'a cloudinary ve multer-storage-cloudinary ekle
- process.env.cloudinary_cloud_name, cloudinary_api_key,
  cloudinary_api_secret ile Cloudinary'i yapılandır
- POST /api/upload:
  - multipart/form-data, field adı "photo"
  - Cloudinary'e yükle, folder: "dambull"
  - Lokal kaydetme, Vercel Blob kullanma
  - { url: string } döndür (secure_url)

---

## TASK 4 — Kullanıcı fotoğraf yönetimi (user_photos tablosu)

user_photos tablosu zaten mevcut:
(id, user_id, url, order_index, created_at)

- POST /api/users/me/photos
  - { url, order_index } alır
  - user_photos'a insert eder
  - Maksimum 10 fotoğraf kontrolü yap, aşılırsa 400 döndür

- GET /api/users/:userId/photos
  - order_index ASC sıralı döndür

- DELETE /api/users/me/photos/:photoId
  - Sahiplik kontrolü yap
  - user_photos'tan sil
  - URL'den public_id çıkar, Cloudinary'den de sil

- PATCH /api/users/me/photos/reorder
  - [{ id, order_index }] array alır
  - Her foto için order_index güncelle

---

## TASK 5 — Profil ve Swipe'ta fotoğrafları göster

- /profile/:userId:
  - GET /api/users/:userId/photos ile fotoğrafları çek
  - Fotoğrafları bilgi bölümleriyle dönüşümlü göster
    (her 2-3 fotoda bir bio/tags/personality bilgisi)
  - Maksimum 10 fotoğraf

- /swipe kartları:
  - Her kullanıcı için user_photos'tan ilk fotoyu çek
  - Fallback: avatar_url
  - Karta tıklayınca tam profil açılır, orada tüm fotolar görünür

---

## TASK 6 — Scene → Vibe yeniden adlandır

- Tüm frontend route'larını /scene → /vibe olarak güncelle
- /scene/:postId → /vibe/:postId
- Tüm component/dosya adlarını Scene → Vibe olarak güncelle
- Tab bar label: "Scene" → "Vibe"
- Tüm API route'larını /api/scene → /api/vibe olarak güncelle
- Backend'de scene_posts → vibe_posts sorgu güncellemesi