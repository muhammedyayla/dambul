# Dambul — Tüm Geliştirme ve Tasarım Görev Listesi (TODO)

## A. Altyapı, Sunucu ve Kimlik Doğrulama (Tamamlananlar)
- [x] **1. Yerel & Render Tek Sunucu Mimarisi:** Localhost (`3001` & `5173`) ve Render (`https://dambul.onrender.com`) için dinamik ortam değişkenleri, SPA `dist` statik sunumu ve `dev-login` korumasının yapılması[cite: 3].
- [x] **2. Web ve Mobil Arayüz Birleştirmesi:** Eski Vite arayüzünün kaldırılıp `expo-app` projesinin hem Web hem Mobil için tek kaynak yapılması ve paket çakışmalarının (`legacy-peer-deps`) giderilmesi.
- [x] **3. Google OAuth 2.0 Akışı:** Web ve Mobil OAuth callback yönlendirmelerinin ayrıştırılması ve JWT token ile mobil uygulamaya dönüş sağlanması[cite: 3].
- [x] **4. Veritabanı `users` Sütun Migrasyonu:** `users` tablosundaki eksik `created_at` ve `updated_at` sütunlarının tamamlanması[cite: 3, 4].
- [x] **5. Harita & Profil Canlı Konum Arama:** `map.tsx` ana arama çubuğunda ve profil şehir seçiminde OpenStreetMap Nominatim API ile canlı il/ilçe/semt araması.
- [x] **6. Kullanıcının Kendi Cinsiyeti (`gender`):** Kayıt (onboarding) ve profil düzenleme ekranlarına kullanıcının kendi cinsiyetini (`Kadın` / `Erkek`) seçme özelliğinin eklenmesi[cite: 3, 4].

---

## B. Yeni Yapılacak Düzeltmeler ve Görsel Arayüz (UI) Tasarımları

### Vibe Etkinlik Şeması ve Canlı Konum Seçimi
- [x] Eski `vibe_posts` tablolarına eksik `user_id`, `title`, `location_tag` ve `created_at` sütunlarını idempotent migrasyonlarla ekleyip etkinlik listeleme/oluşturma hatalarını gider.
- [x] Yeni Etkinlik konum seçicisinde en az 2 karakterden sonra 300 ms debounce ile aynı Nominatim aramasını kullan; arama boşken popüler lokasyonları öneri olarak göster.

###  Tercihler ve Boy Seçiminde Sürüklenebilir (Draggable) Kaydırma Çubukları (Sliders) (`settings.tsx`)
- [x] **TERCİHLER Kartı (`#18181b` arka plan, `borderRadius: 24`, `padding: 20`):**
  - En üstte `Görmek istiyorum` başlığı (`fontSize: 20, fontWeight: '700', color: '#fff'`) ve altında 3 yan yana seçim butonu: `Kadınlar`, `Erkekler`, `Herkes` (`height: 54, borderRadius: 16`). Seçili olan buton canlı pembe/fuşya (`#ff007f` / `#ec4899`) dolgulu ve pembe parlama (glow) efektli, seçili olmayanlar koyu gri (`#27272a`) çerçeveli[cite: 6, 12].
  - **`+` ve `-` butonları tamamen kaldırılacak, kilit ikonu KESİNLİKLE OLMAYACAK.** Tüm kontroller parmakla/fareyle sürüklenebilir (draggable) slider olacak:
  - **1. Yaş aralığı (`18` - `100`):** Başlık `Yaş aralığı` (`color: '#a1a1aa'`, sağında seçili değer örn. `18 - 35`). Altında yatay kaydırma çubuğu: İz (track) koyu mor/bordo (`#4a153b`), seçili aralık dolgusu pembe (`#ec4899`), iki ucunda (`min` ve `max`) `28x28` boyutunda yuvarlak sürüklenebilir tutamaç (thumb). Çubuğun sol altında `18`, sağ altında `100` etiketi[cite: 6, 12].
  - **2. Mesafe (`min` - `max`):** Başlık `Mesafe`. Altında üzerinde 5 adet küçük durak noktası (dot) bulunan yatay kaydırma çubuğu ve tek bir yuvarlak sürüklenebilir tutamaç. Çubuğun altında eşit aralıklarla hizalanmış 5 metin etiketi: `min`, `25 km`, `50 km`, `100 km`, `max`[cite: 6, 12].
  - **3. Boy (`130 cm` - `210 cm`):** Başlık `Boy`. Altında iki uçlu (`min` ve `max` yuvarlak tutamaçlı) sürüklenebilir range slider. Sol altında `130 cm`, sağ altında `210 cm` etiketi[cite: 6, 12].
- [x] **BASICS -> Boy Seçim Bottom-Sheet'i:**
  - Sol üstte cetvel ikonu, pembe `BASICS` yazısı, altında beyaz `Boy` başlığı ve gri `Boyunu paylaş` alt yazısı[cite: 5].
  - Ortada büyük kalın beyaz fontla seçili boy değeri: örn. `183 cm` (`fontSize: 32, fontWeight: '800'`)[cite: 5].
  - Altında sol tarafı parlak pembe (`#ec4899`), sağ tarafı koyu gri (`#27272a`) olan, beyaz yuvarlak tutamaçlı (`28x28`) tek uçlu sürüklenebilir yatay slider[cite: 5].
  - En altta ortada pembe yuvarlak anahtarlı `cm` toggle kapsülü[cite: 5].