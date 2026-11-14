# PINESAB | Big Paket Referans Siteleri

Bu klasörde 12 bağımsız kurgusal marka için tasarlanmış Big paket web sitesi vardır.

## Mimari
- Her site: 24 ayrı statik HTML içerik sayfası + 1 adet `admin.html` demo yönetim paneli.
- Her markanın kendine ait `brand.css`, `data.js`, `assets/scene.svg` ve `assets/mark.svg` dosyaları vardır.
- Paylaşılan, tekrar kullanılabilir altyapı `_shared/` klasöründe: `style.css`, `runtime.js`, `admin.css`, `admin.js`.
- Site ve admin bağlantıları GitHub Pages ile uyumlu göreli yollardır.
- Kaynak görseller uygun olduğunda Unsplash üzerinden yüklenir. Fotoğraf yüklenemediğinde yerel SVG görsel ekranda kalır.

## Yönetim paneli
Sitenin sağ üst kısmındaki **Admin Giriş** bağlantısını aç. Panel tek sayfada bütün kontrol alanlarını içerir:
- 24 sayfayı ayrı ayrı önizleme
- Düzenlenebilir metne tıklama; metni sürükleyerek taşıma veya X/Y koordinatlarını girme
- Yazı boyutu, hizalama, metin rengi ve seçilen öğenin arka plan rengi
- Buton ve bağlantı hedefi değiştirme
- Genel renk paleti ve font seçme
- Görsel alanına fotoğraf yükleme, logo ve favicon yükleme
- Geri al, yinele, seçili sayfayı sıfırla, siteyi sıfırla
- Kaydet, JSON dışa aktar / içe aktar

**Kritik yayın sınırlaması:** GitHub Pages statik yayın altyapısıdır. Admin panelindeki Kaydet eylemi, yalnızca aynı tarayıcının `localStorage` alanına kayıt yapar. Başka cihazlardaki ziyaretçilere yeni içerik dağıtılmaz. JSON dosyası değişikliklerin aktarımı ve sonraki geliştirme sürecinde kullanılabilecek bir yedektir. Bir müşteriye gerçek yönetim paneli olarak teslim edilmeden önce **kimlik doğrulamalı bir sunucu, veritabanı, dosya saklama, erişim kontrolü ve güncelleme API'si** entegre edilmelidir. Hiçbir GitHub API anahtarı veya şifre istemci koduna eklenmemelidir.

Örnek marka adları, referans senaryoları, yazılar ve görseller gerçek ticari iddialar değildir. Gerçek projede kullanılmadan önce içerik, görsel kullanım hakları, KVKK metinleri, SEO ve kurumsal bilgiler kontrol edilmeli, demo `noindex` meta etiketleri kaldırılmalıdır.
