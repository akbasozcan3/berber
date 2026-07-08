# New Life Erkek Kuaförü — Yayın Rehberi

Bu rehber siteyi canlıya almak için gereken her şeyi adım adım anlatır.

---

## Hızlı Başlangıç (Yerel)

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Giriş: `ozcanakbas38@gmail.com` / `Ozcan2009ak`

---

## Ortam Değişkenleri — Ne Zorunlu, Ne Opsiyonel?

| Değişken | Zorunlu? | Nerede girilir | Açıklama |
|----------|----------|----------------|----------|
| `ADMIN_EMAIL` | **Evet** | `.env.local` / Vercel | Admin giriş e-postası |
| `ADMIN_PASSWORD` | **Evet** | `.env.local` / Vercel | Admin şifresi |
| `JWT_SECRET` | **Evet** | `.env.local` / Vercel | Güvenlik anahtarı (rastgele uzun string) |
| `DATABASE_URL` | **Evet** | `.env.local` / Vercel | Vercel Postgres bağlantısı |
| `TELEGRAM_BOT_TOKEN` | **Evet** (bildirim için) | `.env.local` / Vercel | BotFather token — **sadece sunucuda** |
| `TELEGRAM_CHAT_ID` | **Evet** (bildirim için) | `.env.local` veya Admin → Ayarlar | Mesajların gideceği chat |
| `ADMIN_URL` | Önerilen | `.env.local` veya Admin → Ayarlar | Telegram'daki admin panel linki |
| `BLOB_READ_WRITE_TOKEN` | Opsiyonel | Vercel Blob / (local için) | Vercel Blob token (Vercel genelde otomatik ekler) |
| İşletme telefonu, adres, saatler | Opsiyonel | Admin → Ayarlar | Panelden düzenlenir |
| Hero slider, makale, galeri | Opsiyonel | Admin paneli | Panelden düzenlenir |

> **Önemli:** `TELEGRAM_BOT_TOKEN` asla admin paneline veya koda yazılmaz. Sadece sunucu ortam değişkeni olarak kalır.

---

## Telegram Kurulumu (Randevu Anında Bildirim)

Randevu alındığı anda Telegram'a mesaj gider. Kurulum 2 dakika sürer.

### Adım 1 — Bot oluştur
1. Telegram'da **@BotFather** aç
2. `/newbot` yaz → bot adı ver → kullanıcı adı ver (ör. `newlife_randevu_bot`)
3. Gelen **token**'ı kopyala (ör. `7123456789:AAH...`)

### Adım 2 — Token'ı sunucuya ekle
`.env.local` dosyasına (veya Vercel Environment Variables):

```
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxx
```

### Adım 3 — Chat ID bul
1. Oluşturduğun bota Telegram'dan `/start` veya herhangi bir mesaj gönder
2. Tarayıcıda aç: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. `"chat":{"id":123456789}` değerini kopyala

### Adım 4 — Chat ID'yi kaydet
**Seçenek A** — `.env.local`:
```
TELEGRAM_CHAT_ID=123456789
```

**Seçenek B** — Admin panel → Ayarlar → Telegram Chat ID (Kaydet)

### Adım 5 — Test et
Admin → Ayarlar → **Test Bağlantısı** butonuna bas. Telegram'a test mesajı gelmeli.

Durum göstergesi **"Hazır"** yeşil olmalı:
- Bot Token ✓
- Chat ID ✓
- Bildirimler aktif ✓

---

## Vercel'e Yayınlama

1. GitHub'a push et
2. [vercel.com](https://vercel.com) → New Project → repoyu seç
3. **Environment Variables** ekle:

```
ADMIN_EMAIL=ozcanakbas38@gmail.com
ADMIN_PASSWORD=Ozcan2009ak
JWT_SECRET=<rastgele-uzun-anahtar>
DATABASE_URL=<vercel-postgres-url>
TELEGRAM_BOT_TOKEN=<botfather-token>
TELEGRAM_CHAT_ID=<chat-id>
ADMIN_URL=https://siteniz.vercel.app/admin/appointments
BLOB_READ_WRITE_TOKEN=<otomatik veya token>
```

4. Deploy
5. İlk deploy sonrası terminalde veya Vercel shell'de: `npm run db:setup` (bir kez)
6. Admin panele gir → Ayarlar → Test Bağlantısı

> Vercel'de DB olarak Postgres kullanıyoruz (`DATABASE_URL`). Görseller de Vercel Blob ile saklanır.

---

## VPS / Docker ile Yayınlama

```bash
# .env dosyasını düzenle
cp .env.example .env

# Başlat
docker compose up -d

# Veritabanını migrate+seed et (ilk kez)
docker compose exec app npm run db:setup
```

`docker-compose.yml` zaten tüm env değişkenlerini okur.

---

## Yayın Sonrası Kontrol Listesi

- [ ] Site açılıyor (ana sayfa, randevu, hizmetler)
- [ ] Admin girişi çalışıyor
- [ ] Test randevusu al → Telegram'a anında mesaj geliyor
- [ ] Admin panelde bildirim zili çalıyor
- [ ] Ayarlar → Telegram durumu **Hazır** (yeşil)
- [ ] `ADMIN_URL` canlı domain'e ayarlı
- [ ] Hero slider ve hakkımızda makalesi admin panelden düzenlenebiliyor

---

## Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| Telegram mesajı gelmiyor | Ayarlar → durum kontrol et. Token ve Chat ID dolu mu? |
| "Bot token yapılandırılmamış" | `TELEGRAM_BOT_TOKEN` env'e ekle, sunucuyu yeniden başlat |
| "Chat ID yapılandırılmamış" | Admin → Ayarlar → Chat ID gir veya `TELEGRAM_CHAT_ID` env |
| "Unauthorized" admin | Sadece `ozcanakbas38@gmail.com` giriş yapabilir |
| Randevu alınamıyor | Admin → Müsaitlik → gün kapalı mı kontrol et |

---

## İşletme Bilgileri (varsayılan)

- **Adres:** Taşdelen Mah. Dekor Sok. No:26B, Çekmeköy/İstanbul
- **Telefon:** +90 532 710 43 55
- **Instagram:** @newlifekuaforr
