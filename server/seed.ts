import { pool } from "./db.ts";

function sortPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

const MOCK_USERS = [
  {
    name: "Selin Yılmaz",
    gender: "female",
    birth_date: "1999-04-12",
    city: "İstanbul, Kadıköy",
    lat: 40.9902,
    lng: 29.0292,
    height: 168,
    bio: "Mimar & tasarım tutkunu. Hafta sonları yeni 3. nesil kahvecileri keşfetmeyi ve analog fotoğraf çekmeyi seviyorum ☕📸",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 85,
    personality_energy: 70,
    personality_lifestyle: 60,
    personality_first_step: 45,
    personality_love_language: 90,
    personality_weekend: 80,
    personality_type: "ENFP",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Hızlı yanıtlar",
    looking_for: "Uzun süreli ilişki",
    zodiac_sign: "Koç",
    pets: "Kedi",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)", "İtalyanca (Italiano)"],
    lifestyle_tags: ["Kahve Tutkunu", "Sanatsever", "Gezgin", "Tasarımcı", "Gece Yürüyüşü"],
    favorite_activities: ["Kahve keşfi", "Fotoğrafçılık", "Sanat galerisi"],
    sports: ["Pilates", "Yoga"],
  },
  {
    name: "Ece Demir",
    gender: "female",
    birth_date: "2001-08-23",
    city: "İstanbul, Beşiktaş",
    lat: 41.0428,
    lng: 29.0077,
    height: 172,
    bio: "Yazılım mühendisi adayı. Indie rock, festival günleri ve samimi sohbetler arıyorum 🎸✨",
    avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 75,
    personality_energy: 88,
    personality_lifestyle: 70,
    personality_first_step: 60,
    personality_love_language: 80,
    personality_weekend: 95,
    personality_type: "ENTP",
    alcohol_habit: "Bazen",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Sürekli mesajlaşma",
    looking_for: "Kahve & Sohbet",
    zodiac_sign: "Başak",
    pets: "Tüm hayvanları severim",
    education_level: "Öğrenci",
    languages: ["Türkçe", "İngilizce (English)", "Almanca (Deutsch)"],
    lifestyle_tags: ["Müziksever", "Konser Tutkunu", "Teknoloji Meraklısı", "Festival Müdavimi", "Gece Kuşu"],
    favorite_activities: ["Konser & Festival", "Canlı müzik", "Yazılım / Teknoloji"],
    sports: ["Fitness / Gym", "Yüzme"],
  },
  {
    name: "Can Baran",
    gender: "male",
    birth_date: "1997-11-05",
    city: "İstanbul, Ümraniye",
    lat: 41.0285,
    lng: 29.1120,
    height: 184,
    bio: "Crossfit antrenörü & doğa aşığı. Hafta sonu kamp rotaları ve derin felsefi sohbetler 🏕️🌲",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 65,
    personality_energy: 92,
    personality_lifestyle: 85,
    personality_first_step: 75,
    personality_love_language: 70,
    personality_weekend: 90,
    personality_type: "ESTP",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Telefonla arama",
    looking_for: "Ciddi ilişki",
    zodiac_sign: "Akrep",
    pets: "Köpek",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)"],
    lifestyle_tags: ["Fitness Meraklısı", "Kampçı", "Doğa Aşığı", "Maceraperest", "Erken Kalkan"],
    favorite_activities: ["Kampçılık", "Doğa yürüyüşü", "Yolculuk / Road trip"],
    sports: ["Crossfit", "Tırmanış", "Koşu"],
  },
  {
    name: "Merve Çelik",
    gender: "female",
    birth_date: "1998-02-14",
    city: "İstanbul, Moda",
    lat: 40.9835,
    lng: 29.0270,
    height: 165,
    bio: "Klinik psikolog. Kediler, psikolojik gerilim romanları ve sessiz sahil yürüyüşleri huzur verir ☕📖🐈",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 60,
    personality_energy: 50,
    personality_lifestyle: 80,
    personality_first_step: 40,
    personality_love_language: 95,
    personality_weekend: 45,
    personality_type: "INFJ",
    alcohol_habit: "Kullanmıyorum",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Yavaş ama derin sohbetler",
    looking_for: "Uzun süreli ilişki",
    zodiac_sign: "Kova",
    pets: "Kedi",
    education_level: "Yüksek Lisans",
    languages: ["Türkçe", "İngilizce (English)", "Fransızca (Français)"],
    lifestyle_tags: ["Kitap Kurdu", "Kedi İnsanı", "Sessizlik Arayan", "Derin Sohbetler", "Minimalist"],
    favorite_activities: ["Kitap okuma", "Piknik", "Müze gezileri"],
    sports: ["Pilates", "Yüzme"],
  },
  {
    name: "Emre Kaya",
    gender: "male",
    birth_date: "1996-09-18",
    city: "İstanbul, Şişli",
    lat: 41.0602,
    lng: 28.9877,
    height: 180,
    bio: "Finans analisti. Espresso, caz festivalleri ve board game geceleri vazgeçilmezim 🎷🎲",
    avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 70,
    personality_energy: 65,
    personality_lifestyle: 80,
    personality_first_step: 55,
    personality_love_language: 60,
    personality_weekend: 70,
    personality_type: "INTJ",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Yüz yüze buluşma",
    looking_for: "Ciddi ilişki",
    zodiac_sign: "Başak",
    pets: "Evcil hayvanım yok",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)"],
    lifestyle_tags: ["Kahve Tutkunu", "Planlı", "Kariyer Odaklı", "Board Game", "Şehirli"],
    favorite_activities: ["Kutu oyunları (Board games)", "Canlı müzik", "Sinema & Film"],
    sports: ["Tenis", "Fitness / Gym"],
  },
  {
    name: "Buse Aydın",
    gender: "female",
    birth_date: "2000-06-30",
    city: "İstanbul, Nişantaşı",
    lat: 41.0520,
    lng: 28.9930,
    height: 170,
    bio: "İç mimarlık öğrencisi. Seramik atölyeleri, bitki yetiştiriciliği ve vintage plak koleksiyonu 🌿🎨",
    avatar_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 80,
    personality_energy: 75,
    personality_lifestyle: 65,
    personality_first_step: 50,
    personality_love_language: 85,
    personality_weekend: 85,
    personality_type: "INFP",
    alcohol_habit: "Bazen",
    smoking_habit: "Elektronik sigara / Vape",
    communication_style: "Sesli mesaj sever",
    looking_for: "Yeni arkadaşlar",
    zodiac_sign: "Yengeç",
    pets: "Bitki Sever",
    education_level: "Öğrenci",
    languages: ["Türkçe", "İngilizce (English)", "İspanyolca (Español)"],
    lifestyle_tags: ["Vintage Tutkunu", "Bitki Sever", "Sanatsever", "DIY Üretici", "Müziksever"],
    favorite_activities: ["Sanat galerisi", "Kahve keşfi", "Şehir keşfi"],
    sports: ["Yoga", "Pilates"],
  },
  {
    name: "Deniz Kara",
    gender: "female",
    birth_date: "1999-10-10",
    city: "İstanbul, Sarıyer",
    lat: 41.1685,
    lng: 29.0570,
    height: 167,
    bio: "Gastronomi mezunu. Yeni tatlar yaratmayı, şarap eşleştirmelerini ve sokak lezzetlerini çok severim 🍷🍕",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 85,
    personality_energy: 80,
    personality_lifestyle: 75,
    personality_first_step: 65,
    personality_love_language: 80,
    personality_weekend: 85,
    personality_type: "ESFP",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Sürekli mesajlaşma",
    looking_for: "Uzun süreli ilişki",
    zodiac_sign: "Terazi",
    pets: "Köpek",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)", "İtalyanca (Italiano)"],
    lifestyle_tags: ["Gurme", "Yemek Yapan", "Şarap Sever", "Sokak Lezzetleri", "Neşeli"],
    favorite_activities: ["Yemek pişirme", "Kahve keşfi", "Piknik"],
    sports: ["Pilates", "Yüzme"],
  },
  {
    name: "Burak Koç",
    gender: "male",
    birth_date: "1998-05-20",
    city: "İstanbul, Kadıköy",
    lat: 40.9920,
    lng: 29.0320,
    height: 182,
    bio: "Endüstri ürünleri tasarımcısı. 3D baskı, bilimkurgu sineması ve bisiklet turları 🚲🚀",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 75,
    personality_energy: 70,
    personality_lifestyle: 85,
    personality_first_step: 50,
    personality_love_language: 75,
    personality_weekend: 80,
    personality_type: "INTP",
    alcohol_habit: "Bazen",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Yavaş ama derin sohbetler",
    looking_for: "Ciddi ilişki",
    zodiac_sign: "Boğa",
    pets: "Kedi",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)"],
    lifestyle_tags: ["Tasarımcı", "Bilim Kurgu", "Bisikletçi", "Teknoloji Meraklısı", "Kahve Tutkunu"],
    favorite_activities: ["Bisiklet turu", "Sinema & Film", "Müze gezileri"],
    sports: ["Bisiklet", "Tırmanış"],
  },
  {
    name: "Zeynep Aslan",
    gender: "female",
    birth_date: "2001-01-19",
    city: "İstanbul, Beşiktaş",
    lat: 41.0450,
    lng: 29.0060,
    height: 163,
    bio: "Hukuk öğrencisi. Münazara, kahve, tiyatro ve spontane yolculuklar tutkumdur ☕🎭✈️",
    avatar_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 90,
    personality_energy: 85,
    personality_lifestyle: 65,
    personality_first_step: 70,
    personality_love_language: 75,
    personality_weekend: 90,
    personality_type: "ENFJ",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Sürekli mesajlaşma",
    looking_for: "Kahve & Sohbet",
    zodiac_sign: "Oğlak",
    pets: "Alerjim var",
    education_level: "Öğrenci",
    languages: ["Türkçe", "İngilizce (English)", "Almanca (Deutsch)"],
    lifestyle_tags: ["Mizah Sever", "Spontane", "Kahve Tutkunu", "Tiyatrosever", "Sosyal Kelebek"],
    favorite_activities: ["Tiyatro & Gösteri", "Kahve keşfi", "Stand-up gösterileri"],
    sports: ["Koşu", "Pilates"],
  },
  {
    name: "İrem Güneş",
    gender: "female",
    birth_date: "1997-03-25",
    city: "İstanbul, Bebek",
    lat: 41.0770,
    lng: 29.0430,
    height: 169,
    bio: "Moda editörü. Minimalist gardıroplar, Fransız sineması ve gün batımı kahveleri 🌅☕",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 70,
    personality_energy: 70,
    personality_lifestyle: 85,
    personality_first_step: 45,
    personality_love_language: 80,
    personality_weekend: 75,
    personality_type: "ISFP",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Hızlı yanıtlar",
    looking_for: "Ciddi ilişki",
    zodiac_sign: "Koç",
    pets: "Kedi",
    education_level: "Lisans",
    languages: ["Türkçe", "Fransızca (Français)", "İngilizce (English)"],
    lifestyle_tags: ["Modasever", "Minimalist", "Sinemasever", "Gün Batımı", "Kahve Tutkunu"],
    favorite_activities: ["Sinema & Film", "Sanat galerisi", "Kahve keşfi"],
    sports: ["Pilates", "Yoga"],
  },
  {
    name: "Okan Şahin",
    gender: "male",
    birth_date: "1999-11-28",
    city: "İstanbul, Ataşehir",
    lat: 40.9930,
    lng: 29.1130,
    height: 181,
    bio: "Mobil uygulama geliştiricisi. Teknoloji, anime, podcast ve kahve 💻☕",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 85,
    personality_energy: 65,
    personality_lifestyle: 75,
    personality_first_step: 55,
    personality_love_language: 75,
    personality_weekend: 70,
    personality_type: "INTP",
    alcohol_habit: "Bazen",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Sürekli mesajlaşma",
    looking_for: "Yeni arkadaşlar",
    zodiac_sign: "Yay",
    pets: "Kedi",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)", "Japonca (日本語)"],
    lifestyle_tags: ["Teknoloji Meraklısı", "Anime Hayranı", "Podcast Dinleyicisi", "Gamer", "Gece Kuşu"],
    favorite_activities: ["Yazılım / Teknoloji", "Sinema & Film", "Kutu oyunları (Board games)"],
    sports: ["Basketbol", "Masa tenisi"],
  },
  {
    name: "Melis Vural",
    gender: "female",
    birth_date: "2000-12-08",
    city: "İstanbul, Suadiye",
    lat: 40.9630,
    lng: 29.0880,
    height: 171,
    bio: "Pilates eğitmeni. Sağlıklı yaşam, deniz kıyısı, pozitif enerji ve bol kahkaha ☀️🌊",
    avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 80,
    personality_energy: 90,
    personality_lifestyle: 90,
    personality_first_step: 70,
    personality_love_language: 85,
    personality_weekend: 85,
    personality_type: "ESFJ",
    alcohol_habit: "Kullanmıyorum",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Sesli mesaj sever",
    looking_for: "Uzun süreli ilişki",
    zodiac_sign: "Yay",
    pets: "Köpek",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)"],
    lifestyle_tags: ["Fitness Meraklısı", "Yoga Tutkunu", "Sağlıklı Beslenme", "Pozitif", "Sahil Sevdalısı"],
    favorite_activities: ["Doğa yürüyüşü", "Piknik", "Kahve keşfi"],
    sports: ["Pilates", "Yoga", "Yüzme"],
  },
  {
    name: "Kaan Kurt",
    gender: "male",
    birth_date: "1997-08-15",
    city: "İstanbul, Karaköy",
    lat: 41.0235,
    lng: 28.9770,
    height: 185,
    bio: "Fotoğrafçı & seyahat aşığı. Sırt çantamı alıp yola çıkmak hayat felsefem. Beraber dünyayı gezecek birini arıyorum 🌍📷",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 75,
    personality_energy: 85,
    personality_lifestyle: 60,
    personality_first_step: 75,
    personality_love_language: 80,
    personality_weekend: 95,
    personality_type: "ENFP",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Sosyal içici",
    communication_style: "Yüz yüze buluşma",
    looking_for: "Uzun süreli ilişki",
    zodiac_sign: "Aslan",
    pets: "Tüm hayvanları severim",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)", "İspanyolca (Español)"],
    lifestyle_tags: ["Fotoğrafçı", "Gezgin", "Sırt Çantalı", "Maceraperest", "Spontane"],
    favorite_activities: ["Fotoğrafçılık", "Seyahat", "Yolculuk / Road trip"],
    sports: ["Tırmanış", "Kaykay"],
  },
  {
    name: "Sıla Erdem",
    gender: "female",
    birth_date: "1998-09-02",
    city: "İstanbul, Moda",
    lat: 40.9850,
    lng: 29.0280,
    height: 166,
    bio: "Piyano öğretmeni & müzisyen. Klasik müzik, mum ışığı akşamları ve derin entelektüel konuşmalar 🎹🕯️",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 70,
    personality_energy: 60,
    personality_lifestyle: 75,
    personality_first_step: 40,
    personality_love_language: 90,
    personality_weekend: 60,
    personality_type: "ISFJ",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Yavaş ama derin sohbetler",
    looking_for: "Ciddi ilişki",
    zodiac_sign: "Başak",
    pets: "Kedi",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)", "Almanca (Deutsch)"],
    lifestyle_tags: ["Müzisyen", "Sanatsever", "Nostaljik", "Derin Sohbetler", "Sakin Ruhlu"],
    favorite_activities: ["Canlı müzik", "Tiyatro & Gösteri", "Sanat galerisi"],
    sports: ["Yoga"],
  },
  {
    name: "Cem Aksoy",
    gender: "male",
    birth_date: "1995-05-14",
    city: "İstanbul, Cihangir",
    lat: 41.0325,
    lng: 28.9830,
    height: 183,
    bio: "Film yapımcısı & yazar. Bağımsız sinema, festival sohbetleri ve vintage daktilolar 🎬☕",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 80,
    personality_energy: 70,
    personality_lifestyle: 85,
    personality_first_step: 60,
    personality_love_language: 75,
    personality_weekend: 80,
    personality_type: "INTP",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Yavaş ama derin sohbetler",
    looking_for: "Ciddi ilişki",
    zodiac_sign: "Boğa",
    pets: "Kedi",
    education_level: "Lisans",
    languages: ["Türkçe", "İngilizce (English)", "Fransızca (Français)"],
    lifestyle_tags: ["Sinemasever", "Yazar", "Sanatsever", "Kahve Tutkunu", "Nostaljik"],
    favorite_activities: ["Sinema & Film", "Müze gezileri", "Tiyatro & Gösteri"],
    sports: ["Yüzme", "Koşu"],
  },
  {
    name: "Yağmur Tunç",
    gender: "female",
    birth_date: "2000-03-18",
    city: "İstanbul, Suadiye",
    lat: 40.9600,
    lng: 29.0850,
    height: 168,
    bio: "Biyoarkeolog & doğasever. Kazı maceraları, antik uygarlıklar ve doğa yürüyüşleri 🏺🌿",
    avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    ],
    personality_humor: 85,
    personality_energy: 85,
    personality_lifestyle: 70,
    personality_first_step: 65,
    personality_love_language: 80,
    personality_weekend: 90,
    personality_type: "ENTP",
    alcohol_habit: "Sosyal ortamlarda",
    smoking_habit: "Kullanmıyorum",
    communication_style: "Hızlı yanıtlar",
    looking_for: "Uzun süreli ilişki",
    zodiac_sign: "Balık",
    pets: "Köpek",
    education_level: "Yüksek Lisans",
    languages: ["Türkçe", "İngilizce (English)", "Yunanca (Ελληνικά)"],
    lifestyle_tags: ["Doğa Aşığı", "Maceraperest", "Gezgin", "Kahve Tutkunu", "Pozitif"],
    favorite_activities: ["Doğa yürüyüşü", "Müze gezileri", "Kampçılık"],
    sports: ["Tırmanış", "Yüzme"],
  },
];

async function seed() {
  console.log("🚀 Seeding 16 rich mock Dambull users with multiple photos & languages...");

  const createdMockIds: { id: string; name: string; avatar_url: string }[] = [];

  for (let i = 0; i < MOCK_USERS.length; i++) {
    const u = MOCK_USERS[i];
    const googleId = `seed_user_${i + 1}_${u.gender}`;
    const email = `seed_${i + 1}@dambull.test`;

    // 1. Insert or update users table
    const userRes = await pool.query(
      `INSERT INTO users (
        google_id, email, name, avatar_url, city, lat, lng, height, gender, bio,
        show_on_map, pref_gender, birth_date,
        personality_humor, personality_energy, personality_lifestyle,
        personality_first_step, personality_love_language, personality_weekend
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        true, 'everyone', $11,
        $12, $13, $14, $15, $16, $17
      )
      ON CONFLICT (google_id) DO UPDATE SET
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        city = EXCLUDED.city,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        height = EXCLUDED.height,
        gender = EXCLUDED.gender,
        bio = EXCLUDED.bio,
        show_on_map = true,
        birth_date = EXCLUDED.birth_date,
        personality_humor = EXCLUDED.personality_humor,
        personality_energy = EXCLUDED.personality_energy,
        personality_lifestyle = EXCLUDED.personality_lifestyle,
        personality_first_step = EXCLUDED.personality_first_step,
        personality_love_language = EXCLUDED.personality_love_language,
        personality_weekend = EXCLUDED.personality_weekend
      RETURNING id;`,
      [
        googleId, email, u.name, u.avatar_url, u.city, u.lat, u.lng, u.height, u.gender, u.bio,
        u.birth_date,
        u.personality_humor, u.personality_energy, u.personality_lifestyle,
        u.personality_first_step, u.personality_love_language, u.personality_weekend
      ]
    );

    const userId = userRes.rows[0].id;
    createdMockIds.push({ id: userId, name: u.name, avatar_url: u.avatar_url });

    // 2. Insert or update user_profiles
    await pool.query(
      `INSERT INTO user_profiles (
        user_id, preferred_gender, looking_for, personality_type,
        alcohol_habit, smoking_habit, education_level, communication_style,
        pets, zodiac_sign, lifestyle_tags, favorite_activities, sports, languages
      ) VALUES (
        $1, 'everyone', $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )
      ON CONFLICT (user_id) DO UPDATE SET
        looking_for = EXCLUDED.looking_for,
        personality_type = EXCLUDED.personality_type,
        alcohol_habit = EXCLUDED.alcohol_habit,
        smoking_habit = EXCLUDED.smoking_habit,
        education_level = EXCLUDED.education_level,
        communication_style = EXCLUDED.communication_style,
        pets = EXCLUDED.pets,
        zodiac_sign = EXCLUDED.zodiac_sign,
        lifestyle_tags = EXCLUDED.lifestyle_tags,
        favorite_activities = EXCLUDED.favorite_activities,
        sports = EXCLUDED.sports,
        languages = EXCLUDED.languages;`,
      [
        userId, u.looking_for, u.personality_type,
        u.alcohol_habit, u.smoking_habit, u.education_level, u.communication_style,
        u.pets, u.zodiac_sign, u.lifestyle_tags, u.favorite_activities, u.sports, u.languages
      ]
    );

    // 3. Insert user_photos
    await pool.query(`DELETE FROM user_photos WHERE user_id = $1`, [userId]);
    for (let pIdx = 0; pIdx < u.photos.length; pIdx++) {
      await pool.query(
        `INSERT INTO user_photos (user_id, url, order_index) VALUES ($1, $2, $3)`,
        [userId, u.photos[pIdx], pIdx]
      );
    }
  }

  console.log(`✅ Seeded ${MOCK_USERS.length} mock users with multiple photos & languages.`);

  // 4. Find all active dev / human users in the database
  const activeUsersRes = await pool.query(
    `SELECT id, name FROM users WHERE google_id NOT LIKE 'seed_user_%' ORDER BY created_at ASC`
  );

  const testUsers = activeUsersRes.rows;
  console.log(`Found ${testUsers.length} test/human accounts to link with Chat Matches.`);

  // Mock conversation scenarios for the 4 matches
  const CHAT_SCENARIOS = [
    {
      partnerName: "Selin Yılmaz",
      messages: [
        { sender: "partner", text: "Selam! Profilini gördüm, harika görünüyor :)", minutesAgo: 120 },
        { sender: "me", text: "Selam Selin! Çok teşekkürler, senin mimarlık fotoğrafların da inanılmaz.", minutesAgo: 90 },
        { sender: "partner", text: "Analog makineyle çekiyorum genelde! Kadıköy taraflarındayım hep 📸", minutesAgo: 45 },
        { sender: "me", text: "Harika! Bir gün Moda sahilinde bir kahve eşliğinde fotoğraf turu yapalım mı?", minutesAgo: 20 },
        { sender: "partner", text: "Çok isterim, bu hafta sonu sana uyar mı? ☕", minutesAgo: 5 },
      ]
    },
    {
      partnerName: "Ece Demir",
      messages: [
        { sender: "me", text: "Selam Ece, Indie rock festivaline gidiyor musun?", minutesAgo: 240 },
        { sender: "partner", text: "Eveet! Biletleri aylar öncesinden aldım sabırsızlıkla bekliyorum 🎸", minutesAgo: 180 },
        { sender: "me", text: "Hangi gün oradasın? Ben Cumartesi günkü grupları merak ediyorum.", minutesAgo: 120 },
        { sender: "partner", text: "Ben iki gün de oradayım! Karşılaşırsak beraber dinleriz :)", minutesAgo: 60 },
      ]
    },
    {
      partnerName: "Merve Çelik",
      messages: [
        { sender: "partner", text: "Psikolojik gerilim kitapları okumayı seviyormuşsun, son okuduğun neydi?", minutesAgo: 360 },
        { sender: "me", text: "Jean-Christophe Grangé okuyordum en son, atmosferi çok iyiydi.", minutesAgo: 300 },
        { sender: "partner", text: "Ben de Siyah Kan'a bayılmıştım! Kesinlikle üzerine konuşmalıyız.", minutesAgo: 150 },
      ]
    },
    {
      partnerName: "Deniz Kara",
      messages: [
        { sender: "partner", text: "Sarıyer sahilinde mükemmel bir sokak lezzeti keşfettim!", minutesAgo: 500 },
        { sender: "me", text: "Neresiymiş o? İyi bir yemeğe asla hayır diyemem 😋", minutesAgo: 420 },
        { sender: "partner", text: "Konum atıyorum hemen, beraber denemeliyiz! 🍷", minutesAgo: 380 },
      ]
    }
  ];

  for (const testUser of testUsers) {
    console.log(`Creating matches & messages for user: ${testUser.name} (${testUser.id})`);

    for (const scenario of CHAT_SCENARIOS) {
      const partner = createdMockIds.find(m => m.name === scenario.partnerName);
      if (!partner) continue;

      // Create mutual likes
      await pool.query(
        `INSERT INTO likes (from_user, to_user, type) VALUES ($1, $2, 'like') ON CONFLICT (from_user, to_user) DO NOTHING`,
        [testUser.id, partner.id]
      );
      await pool.query(
        `INSERT INTO likes (from_user, to_user, type) VALUES ($1, $2, 'like') ON CONFLICT (from_user, to_user) DO NOTHING`,
        [partner.id, testUser.id]
      );

      // Create chat thread
      const [uA, uB] = sortPair(testUser.id, partner.id);
      const threadRes = await pool.query(
        `INSERT INTO chat_threads (user_a, user_b) VALUES ($1, $2)
         ON CONFLICT (user_a, user_b) DO UPDATE SET created_at = NOW()
         RETURNING id`,
        [uA, uB]
      );
      const threadId = threadRes.rows[0].id;

      // Clean existing messages in thread and re-insert realistic thread
      await pool.query(`DELETE FROM messages WHERE thread_id = $1`, [threadId]);

      for (const msg of scenario.messages) {
        const senderId = msg.sender === "me" ? testUser.id : partner.id;
        const msgTime = new Date(Date.now() - msg.minutesAgo * 60 * 1000);
        await pool.query(
          `INSERT INTO messages (thread_id, sender_id, body, created_at) VALUES ($1, $2, $3, $4)`,
          [threadId, senderId, msg.text, msgTime]
        );
      }
    }
  }

  console.log("🎉 Successfully created chat matches and message histories!");
  const threadCount = await pool.query(`SELECT COUNT(*) FROM chat_threads`);
  const msgCount = await pool.query(`SELECT COUNT(*) FROM messages`);
  console.log(`Total Chat Threads: ${threadCount.rows[0].count}, Total Messages: ${msgCount.rows[0].count}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
