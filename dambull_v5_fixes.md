# Dambull V5: State Bugs, Map Grid View & Full-Screen Animations

## 1. Swipe Kaydırma Bug'ı ve Tam Ekran Animasyonlar
- **Sorun:** Kart kaydırıldığında (sağa/sola) veya butonlara basıldığında ekrana hep aynı kişi geliyor, state (dizi indeksi) güncellenmiyor.
- **Çözüm:** `swipe.tsx` içindeki kaydırma/oylama fonksiyonlarını (Like/Pass) düzelt. Bir kişi oylandığında diziden (`users` state'inden) çıkarılsın veya indeks bir sonrakine geçsin.
- **Tam Ekran Feedback:** Kullanıcı sağa kaydırdığında/Kalp'e bastığında ekranda tam ekran parlayan neon bir "LIKE" veya "ATEŞ" efekti, sola kaydırdığında/Çarpı'ya bastığında "PASS" efekti belirmelidir (React Native Reanimated veya Lottie ile yapılabilir).

## 2. Harita Profilleri ve UI Temizliği
- Haritadaki kullanıcı pinlerinin (avatarların) altındaki isim yazılarını tamamen kaldır.
- Haritadaki kullanıcı avatarlarının boyutunu büyüt (Örn: 52x52 yerine 64x64 veya 72x72 yap).
- Haritanın sol üst köşesindeki hava durumu bilgisini/ikonunu tamamen sil, sadece "Konum" kalsın.
- Sol üstteki Konum metnine tıklayınca açılan ama bozulan "Arama (Search)" modalını onar.

## 3. Harita Modu / Grid Modu (4. Buton)
- Haritanın sağ tarafındaki dikey buton grubuna 4. bir buton ekle (Grid / Izgara ikonu).
- **Toggle Mantığı:** Bu butona basıldığında harita (Map) tamamen gizlenmeli ve yerine siyah arka planda "Grid (Izgara) Profil Görünümü" açılmalıdır (`image_17.png` referansı). 
- Grid modunda kullanıcılar 3'lü veya 2'li sütunlar halinde listelenir. Tıklandığında yine Swipe ekranındaki detaylı profil görünümü açılır.

## 4. El Sallama (Wave) Özelliği
- Grid modundaki kullanıcı avatarlarının sağ üst köşesine bir "El Sallama (Wave / Hand)" butonu ekle.
- Bu butona basıldığında arka planda bir API tetiklensin ve karşı tarafa eşleşme zorunluluğu olmadan bildirim gitsin (Örn: "Muhammet sana merhaba dedi!"). 
- Karşı tarafın doğrudan bu bildirime yanıt verebileceği bir mesajlaşma/yanıt altyapısı (veya modalı) kurgula.

## 5. Map -> Swipe Profil Senkronizasyonu
- Haritadan (veya Grid modundan) bir kullanıcının profiline tıklandığında açılan ekran, Swipe sayfasındaki detaylı Hinge stili görünüm ile **birebir aynı bileşeni (Component)** kullanmalıdır. Kod tekrarı yapma, tek bir `ProfileDetail` bileşeni oluştur ve iki tarafta da bunu çağır.

## 6. Etkinlik (Vibe) İşleyişi
- Haritadaki Etkinlik (Takvim) butonuna tıklandığında hemen "Yeni Etkinlik Oluştur" sayfası açılmamalıdır.
- Önce mevcut/eski etkinliklerin (Vibe'ların) listelendiği bir sayfa veya modal açılmalı.
- Bu listenin uygun bir yerinde (üstte veya FAB olarak) "+" (Yeni Ekle) butonu olmalı.
- Yeni Vibe oluştururken çıkan "Konum" input'u kesinlikle serbest metin (test, deneme vb.) kabul etmemeli, haritadaki arama motorunun aynısını kullanarak gerçek lokasyon (İl, İlçe) seçtirmelidir.