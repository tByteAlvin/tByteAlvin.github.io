# PINESAB · BigerPlus Paket Referans Koleksiyonu

## Kapsam

Bu klasör, birbiriyle bağımsız **8 ayrı sektör sitesi** içerir:

1. Velora Motors: velocity / sol dikey otomotiv navigasyonu, kinetik açılış
2. Aurevia Hotel: sanctuary / açılır tam ekran menü, sinematik otel görseli
3. Mira Saç Stüdyosu: muse / yüzen navigasyon, editoryal kolaj
4. Bordo Barber: heritage / genişleyen sol yan menü, tipografik ve siyah-bakır tasarım
5. Mora Mutfak: table / altta yüzen menü, tabak etrafında kurulan deneyim
6. Arelia Jewels: gem / tam ekran mücevher geometrisi, lüks atelier açılışı
7. Nove Fitness: pulse / neon, yüksek kontrast, hareketli spor kompozisyonu
8. Katman Mimarlık: structure / kalıcı mimari yan menü, grid tabanlı sayfa düzeni

**Her site:** 29 içerik sayfası + 1 `admin.html` yönetim paneli, 6 ana menü öğesi. Blog, referanslar, haberler ve SSS footer bağlantıları içindedir.

**Diller:** Her sitede `locales/tr.json`, `locales/en.json`, `locales/de.json` bağımsız hazırlanmış Türkçe, İngilizce ve Almanca metinleri içerir. İlk tercih tarayıcının dilinden yapılır; manuel dil seçimi tarayıcıda kalır. Bu seçim kesin IP konum tespiti değildir, hiçbir hassas konum bilgisi toplanmaz.

**Hareket:** Farklı giriş sahneleri, sayfa geçiş perdesi, scroll reveal, parallax, tilt, akıcı galeri, hover mikroetkileşimler, isteğe bağlı Web Audio efektleri. `prefers-reduced-motion` desteklenir.

**Görseller:** Uygun olduğunda Unsplash kaynaklı örnek fotoğraflar indirilir. Fotoğraf yüklenmezse her marka için hazırlanan `media.svg` konulu çizim gösterilir. Gerçek müşteri işinde kullanılmadan görsel kullanım hakları ve fotoğraf seçimi doğrulanmalıdır.

## Randevu ve site içi mesajlaşma

GitHub Pages **statik dosyaları** yayınlar. GitHub Pages üzerinde çalışan örneklerde iletişim ve randevu formları **demo modundadır**: kayıtlar sadece o tarayıcının `localStorage` alanına eklenir ve aynı tarayıcıdaki demo admin panelinden görülür. Başka cihazlar ve müşteriler arasında kayıt aktarılmaz, gerçek işletmeye bir mesaj iletilmez.

Gerçek çok kullanıcılı sistem için `server/server.mjs` içindeki bağımsız Node.js API modülü eklendi. Sunucu çalıştırıldığında aşağıdaki özellikler vardır:
- Randevu talepleri tarih, saat, seçki, iletişim bilgileri ve notla saklanır; `new / contacted / confirmed / cancelled / completed` durumları
- Site içi mesajlaşma konuları, ziyaretçi için güvenli rastgele görüşme anahtarı ve cevap zinciri
- Yöneticiye özel randevu ve mesaj kutusu; görüşmeye yanıt gönderme
- CORS köken denetimi, gizli admin erişim anahtarı, IP bazlı temel istek limiti, JSON boyut limiti
- Dosya tabanlı kalıcı kayıt (sunucuda kalıcı disk sağlanmalıdır)

**Sunucu kurulumu (Node.js 20+):**
```bash
cd pinesab/ornekler/bigerplus/server
export ADMIN_SECRET="uzun-rastgele-ve-ozel-bir-admin-sifresi"
export ALLOWED_ORIGINS="https://tbytealvin.github.io"
export DATA_DIR="/var/data/pinesab"
node server.mjs
```

Gerçek bir dağıtım için TLS/HTTPS kullanan bir Node barındırıcısı (ör. Render Web Service), veriler için **kalıcı disk** veya veritabanı, alan adı, yedekleme politikası ve erişim kontrolü gerekir. `.env.example` yalnızca rehberdir. Kullanıcı verileri veya gerçek parolalar hiçbir zaman GitHub'a işlenmemelidir. Canlı randevu istemcisi bağlamak için her sitenin `config.js` dosyasındaki `apiBase` özelliğine HTTPS sunucu adresi girilmelidir.

**Önemli:** Sunucu kodu GitHub'a yüklendi ama henüz hiçbir harici barındırıcıya dağıtılmadı; `apiBase` değerleri boştur. Dolayısıyla canlı randevular ve müşteriler arası mesajlaşma şu an etkin değildir. Ayrıca bu referans sunucu profesyonel güvenlik ve KVKK incelemesinden geçmeden gerçek müşteri verileriyle kullanıma sunulmamalıdır.

Yönetim panelindeki *İçerik Stüdyosu* (metin/renk/logo/fotoğraf) bölümü de şimdilik tarayıcıya kaydeden demo aracıdır; gerçek canlı CMS için sunucu tarafı yayınlama ve rol yetkileri ayrıca gerekir.

## Yapı

```
bigerplus/
  _core/
    base.css        # paylaşılan responsive temel
    app.js          # hareket / diller / formlar / mesajlar
    admin.css
    admin.js
    brands.json     # 8 markanın içerik tasarım verisi
    themes.js       # 8 farklı navigasyon ve konsept
    generator.js    # statik HTML üretim kaynağı
  server/
    server.mjs      # Node.js API
    package.json
    .env.example
  velora-motors/
    index.html ...  # 29 sayfa + admin.html
    theme.css
    config.js
    media.svg
    logo.svg
    favicon.svg
    locales/tr.json, en.json, de.json
  ... diğer 7 marka
```

Kurgusal marka adları ile örnek referanslar gerçek müşteri beyanı değildir.
