# Mapdate Database & UI Constants Architecture

## 1. Veritabanı Şeması Analizi ve Korunması
- Mevcut `neon_auth` şemasındaki `account`, `user`, `session`, `verification` tabloları Google OAuth için kritik olduğundan kesinlikle silinmeyecek ve değiştirilmeyecektir.

## 2. Yeni Profil Tablosunun Oluşturulması (SQL)
Kullanıcıların Mapdate profil detaylarını tutmak için `public` şemasında yeni bir tablo oluşturulacak ve `neon_auth.user` tablosuna Foreign Key ile bağlanacaktır. Backend agent'ı veritabanında şu SQL komutunu çalıştırmalıdır:

```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES neon_auth.user(id) ON DELETE CASCADE,
    preferred_gender VARCHAR(20),
    languages TEXT[],
    looking_for VARCHAR(50),
    personality_type VARCHAR(100),
    alcohol_habit VARCHAR(50),
    smoking_habit VARCHAR(50),
    education_level VARCHAR(100),
    family_plans VARCHAR(100),
    communication_style VARCHAR(100),
    pets VARCHAR(50),
    zodiac_sign VARCHAR(20),
    lifestyle_tags TEXT[], 
    favorite_activities TEXT[],
    sports TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);