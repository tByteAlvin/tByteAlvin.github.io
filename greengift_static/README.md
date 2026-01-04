# GreenGift (Static GitHub Version)

Bu paket **GitHub Pages** için hazırlanmış **statik** (HTML/CSS/JS) demo sürümüdür.
PHP/MySQL çalıştırmaz. Formlar demo amaçlı `localStorage` kullanır.

## Çalıştırma (lokal)
- Klasörü aç
- `index.html` dosyasını tarayıcıda aç (veya VSCode Live Server kullan)

## GitHub Pages
1. Yeni repo oluştur (örn: `greengift-site`)
2. Bu klasördeki her şeyi repo içine yükle
3. Repo Settings → Pages → Deploy from branch → `main` / `/root`
4. Domain bağlayacaksan: `greengift.pro` için GitHub Pages custom domain + DNS A kayıtlarını gir.

## Veri güncelleme
- `assets/data/site.json` dosyasından:
  - paketler, markalar, stats, iletişim bilgileri değişir.

## Marka mikrositeleri
- `brand_sites/<slug>/index.html` şeklinde.
