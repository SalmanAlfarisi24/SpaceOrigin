# 🚀 Space Origin: Galactic Strike

![Game Status](https://img.shields.io/badge/Project-Game%20Jam%20Submission-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Made%20with-HTML5%20%7C%20CSS3%20%7C%20JavaScript-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-green?style=for-the-badge)

[cite_start]**Space Origin: Galactic Strike** adalah game *2D horizontal-scrolling shoot 'em up* (shmup) bertema *sci-fi* yang dikembangkan khusus untuk kompetisi **Game Jam GDGOC UNSRI 2026**[cite: 1, 3, 5]. [cite_start]Pemain berperan sebagai pilot pesawat tempur luar aka-asa elit yang dikirim ke wilayah terpencil untuk menahan invasi armada UFO misterius yang mengancam jalur galaksi[cite: 5, 19].

---

## 🌌 Fitur & Mekanik Utama (Kriteria Penilaian)

Game ini dirancang dengan fokus pada fleksibilitas kontrol, visual yang dinamis, dan tantangan yang terus berkembang:

* [cite_start]**Mekanisme Difficulty Scaling:** Tantangan permainan meningkat secara dinamis seiring bertambahnya skor pemain melalui pembagian sistem gelombang (*Wave*)[cite: 6]:
    * **Wave 1 (Skor 0-200):** UFO standar bergerak konstan dengan kecepatan lambat.
    * **Wave 2 (Skor 201-500):** Muncul tipe UFO baru dengan pola gerakan zigzag (sinusoidal) dan menembakkan proyektil.
    * **Wave 3 (Skor > 500):** "Elite UFO" dengan ketahanan tinggi (3x hit) yang melacak posisi pesawat pemain (*homing*).
* **Epic Mini-Boss Event & Telegraphing:** Muncul setiap kelipatan skor 500. Memiliki HP tebal dan serangan *Spread Shot* yang dilengkapi indikator garis pandu merah tipis (*telegraph line*) selama 1.5 detik sebelum laser dilepaskan agar memberikan aspek taktis yang adil bagi pemain.
* **Energy Shield & EMP Shockwave:** Selain bar HP utama, pesawat dibekali *Energy Shield* (bar biru) yang dapat meregenerasi diri jika tidak terkena hit selama 5 detik. Pemain juga memiliki kemampuan *EMP Shockwave* (Cooldown 30 detik) untuk membekukan pergerakan seluruh musuh dan proyektil di layar saat terdesak.
* **Drop Power-Ups:** Menghancurkan UFO memberikan peluang 15% untuk menjatuhkan kapsul fungsional berdurasi 7 detik: *Shield* (kebal 1x hit), *Double Shot* (tembakan paralel), atau *Rapid Fire* (kecepatan tembak ganda).
* **Web Mobile Optimization (Fullscreen API):** Responsif untuk PC maupun perangkat mobile. Dioptimalkan dengan *HTML5 Fullscreen API* yang menyembunyikan URL bar browser dan status bar HP secara otomatis saat tombol Start ditekan untuk memberikan pengalaman layaknya aplikasi *native*.
* **Dynamic Audio Experience:** Menggunakan *Web Audio API* untuk kontrol suara real-time. Musik latar (BGM) otomatis melambat saat kondisi kritis (<20% HP) dan berubah menjadi efek teredam (*Low-Pass Filter*) di halaman *Game Over* sebelum akhirnya memudar (*fade-out*).

---

## 🎮 Kontrol Permainan

### Kontrol PC:
* [cite_start]**Manuver Pesawat:** Tombol `W, A, S, D` atau `Tombol Panah`[cite: 12].
* [cite_start]**Menembak Laser:** `Spasi` (Spacebar)[cite: 13].
* **EMP Shockwave:** Tombol `E`.
* [cite_start]**Sistem Fitur:** Tombol `P` untuk Jeda (Pause) dan `R` untuk Memulai Ulang (Restart)[cite: 16].

### Kontrol Mobile:
* **Manuver & Tembak:** *Drag & slide* pada layar (Menembak otomatis / *Auto-fire*).
* **EMP Shockwave:** Menekan tombol virtual khusus pada UI layar.

---

## 🛠️ Spesifikasi Teknis & Aset

* [cite_start]**Engine & Logic:** HTML5 Canvas API, Vanilla JavaScript (ES6+), dan Tailwind CSS (untuk struktur UI/Layouting)[cite: 10, 31].
* [cite_start]**Aset Visual:** Grafis bersumber dari *Space Origin Assets* (opengameart.org)[cite: 32].
* [cite_start]**Aset Audio:** *Custom Sci-fi Blaster* & *Synth-wave BGM* (opengameart.org - Royalty Free)[cite: 33].

---

## 🚀 Cara Menjalankan Project

1. **Clone Repositori:**
   ```bash
   git clone https://github.com/SalmanAlfarisi24/SpaceOrigin.git
    ```
2.  **Masuk ke Direktori Project:**
    ```bash
    cd space-origin
    ```
3.  **Jalankan Game:**
    * Cukup buka file `index.html` langsung di browser Anda, atau
    * Gunakan ekstensi seperti *Live Server* di VS Code untuk pengalaman pengembangan yang lebih baik.

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

Developed with 🎮 by **Salman Al Farisi**
