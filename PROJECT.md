# Game Design Document
## "Nama Kerja: Convoy" — Family Survival Idle Game

---

## 1. Ringkasan Konsep

Sebuah keluarga kecil (Ayah, Ibu, Anak) hidup di dalam mobil pickup yang terus bergerak melintasi kota pasca-kiamat. Player **tidak mengendalikan mobil** — mobil berjalan otomatis sebagai representasi waktu dan progres. Fokus permainan adalah **manajemen sumber daya (idle/incremental)** dan **menjaga hubungan keluarga**, dibungkus dalam satu scene visual yang relatif statis.

**Genre:** Idle/Incremental + Simulasi Keluarga (Narrative-light)
**Perspektif:** 2D, side-view/cutaway (mirip diagram potongan melintang mobil)
**Platform:** Web-based (browser)
**Target sesi:** Cocok dimainkan singkat berkali-kali (5–15 menit) maupun dibiarkan idle di tab

---

## 2. Pilar Desain (Design Pillars)

Tiga prinsip yang jadi acuan tiap keputusan desain — kalau sebuah fitur gak mendukung salah satu dari ini, kemungkinan besar itu scope creep:

1. **Satu tempat, bukan eksplorasi** — semua terjadi di/sekitar mobil. Dunia luar hanya "menyentuh" pemain lewat event, radio, dan pemandangan yang scroll.
2. **Keputusan, bukan aksi** — tidak ada looting manual atau kontrol gerak. Pemain memilih (assign tugas, respon dialog, prioritas upgrade), sistem yang mengeksekusi.
3. **Trade-off keluarga vs bertahan hidup** — efisiensi survival dan kehangatan hubungan saling tarik-menarik. Tidak ada solusi yang "menang" di semua aspek.

---

## 3. Platform & Rekomendasi Teknis

### Kenapa Web-based
- Gak butuh distribusi lewat app store, tinggal share link
- Development cycle cepat untuk playtest & iterasi
- Bisa di-wrap ke APK (Capacitor) atau desktop (Electron/Tauri) belakangan tanpa rewrite besar, kalau ternyata mau dipublish lebih luas

### Opsi Tech Stack

| Kebutuhan | Rekomendasi | Alasan |
|---|---|---|
| Rendering scene + animasi ringan | **HTML/CSS + sedikit Canvas**, atau **React + Framer Motion** | Scene statis + beberapa elemen animasi (karakter, background scroll) tidak butuh game engine penuh |
| State management (resource, waktu, relationship) | **React + Zustand/Context**, atau vanilla JS class-based state | Kompleksitas state lumayan (banyak angka & flag), butuh struktur yang jelas dari awal |
| Kalau nanti ingin lebih "game-engine-like" (particle, easing, layer control lebih presisi) | **Phaser 3** atau **PixiJS** | Opsional — hanya kalau visual mulai butuh banyak layer/animasi kompleks. Untuk MVP, kemungkinan besar tidak perlu. |
| Data persistence | **localStorage** (single player, tidak perlu backend) | Idle game biasanya butuh nyimpen progress + timestamp terakhir untuk hitung idle-time saat kembali |

**Rekomendasi MVP:** React + Zustand + CSS animation/Framer Motion. Engine seperti Phaser baru relevan kalau kompleksitas visual meningkat signifikan (misal butuh banyak sprite sheet & physics).

---

## 4. Strategi Aset Visual

Karena scene simple (1 scene utama, sedikit state karakter), ada tiga jalur realistis:

### Opsi A — Asset Pack Siap Pakai (Tercepat)
- Sumber: [Kenney.nl](https://kenney.nl) (free, CC0), itch.io asset packs (banyak yang murah/free untuk 2D post-apocalyptic/topdown)
- Cocok kalau kamu ingin fokus di sistem/gameplay dulu, visual belakangan
- Risiko: gaya visual generik, mungkin gak 100% pas sama vibe yang kamu mau

### Opsi B — AI-generated Art + Edit Manual
- Generate base art (karakter, background, ikon resource) via image generation, lalu rapikan/konsistensikan gaya secara manual (palette, outline)
- Cepat untuk eksplorasi gaya, tapi butuh effort ekstra untuk konsistensi antar aset (terutama ekspresi karakter & tahap upgrade mobil)

### Opsi C — Ilustrasi Custom Sederhana (Vector/Flat)
- Gaya flat vector (mirip ikon/UI ilustrasi) jauh lebih murah untuk dibuat & di-maintain dibanding pixel art detail
- Karakter cukup punya beberapa **state ekspresi** (netral, senang, sedih, sakit) — tidak perlu full animasi rangka
- Cocok kalau kamu (atau kolaborator) punya waktu untuk desain sendiri, hasilnya paling konsisten dengan visi "clean, bukan generic"

**Rekomendasi:** mulai dari **placeholder geometris** (kotak/lingkaran berwarna + label) untuk validasi sistem dulu → baru masuk opsi A/B/C setelah loop gameplay-nya kerasa enak. Ini menghindari kerja ulang aset kalau desain sistem masih berubah-ubah di awal.

---

## 5. Struktur Scene

**Layout utama (single screen, side-view cutaway):**

```
[ Langit & background kota reruntuhan — scroll lambat, parallax ]
[ Kap depan mobil ]  [ Kabin/bak — area interaktif utama ]  [ bagian belakang ]
   Ayah (kursi kemudi, walau tak dikontrol)
   Ibu & Anak (di kabin/bak, posisi berubah sesuai tugas)
[ UI resource bar di atas/bawah: Bahan Bakar, Makanan, Air, Bond Meter ]
[ Panel upgrade (eksterior/interior) — akses via tombol/tab terpisah ]
```

Background jalan **scroll horizontal pelan & looping** — cukup 1–2 layer parallax (jalan + reruntuhan kota di kejauhan), tidak perlu variasi banyak di MVP.

---

## 6. Sistem Inti

### 6.1 Resource (Idle Layer)
| Resource | Fungsi | Berkurang/bertambah |
|---|---|---|
| Bahan Bakar | Mobil tetap jalan; habis = event darurat | Berkurang seiring waktu, terisi via generator/event |
| Makanan & Air | Kondisi fisik karakter | Berkurang per hari, dikelola via generator |
| Spare Parts | Currency utama upgrade mobil | Dihasilkan generator + event |
| Jarak Tempuh | Progress/skor pasif | Bertambah otomatis seiring waktu (representasi "waktu bermain") |

### 6.1a Sistem Generator (ala AdVenture Capitalist)

Referensi langsung: idle incremental klasik seperti *AdVenture Capitalist* — sejumlah "generator" yang masing-masing bisa dibeli berulang kali, harga naik tiap pembelian, dan langsung menghasilkan resource pasif per detik. **Tidak ada timer/cooldown** — begitu dibeli, produksinya langsung nambah dan terus jalan.

**Daftar generator (tema keluarga & mobil, bukan bisnis):**

| Generator | Tema/Narasi | Resource dihasilkan |
|---|---|---|
| Toolkit Ayah | Perbaikan kecil sehari-hari | Spare Parts /detik |
| Kaleng Makanan Cadangan | Stok darurat kelolaan Ibu | Makanan /detik |
| Radio Genggam | Barter info dengan survivor lain | Spare Parts /detik |
| Kebun Kecil di Bak | Tanam sayur darurat di mobil | Makanan /detik |
| Alat Pemurni Air | Filter air darurat | Air /detik |
| Baterai Cadangan | Sumber energi tambahan | Bahan Bakar /detik |
| Genset Mini | Listrik tambahan | Bahan Bakar /detik |
| Jaringan Barter Anak | Anak menjalin relasi via radio | Spare Parts /detik + sedikit Bond |

**Mekanik (per generator):**
- Harga naik eksponensial tiap pembelian: `harga_berikutnya = harga_dasar × growth^jumlah_dimiliki` (growth disarankan 1.07–1.15, standar genre ini)
- Produksi total generator = `jumlah_dimiliki × rate_dasar` per detik, langsung terakumulasi ke resource terkait
- Tombol beli bertingkat: **x1 / x10 / x25 / xMax** (hitung total biaya untuk beli sekaligus banyak, umum di idle game agar tidak perlu klik berulang)
- Tidak perlu sistem manager/auto-collect terpisah seperti game referensi — karena semua generator memang otomatis begitu dibeli, tidak ada siklus yang perlu "dikumpulkan manual"

**Relasi ke sistem lain:**
- Generator = sumber income pasif terus-menerus (micro-progression)
- Upgrade besar mobil (eksterior/interior, lihat 6.4) = milestone besar yang dibeli sesekali pakai hasil akumulasi generator (macro-progression)
- Pola ini: banyak sumber kecil yang terus tumbuh → digunakan untuk lompatan besar sesekali — struktur inti genre idle/incremental

### 6.2 Bond Meter (Relationship Layer)
- Tiap pasang karakter (Ayah-Ibu, Ayah-Anak, Ibu-Anak) punya nilai bond terpisah, atau disederhanakan jadi 1 nilai "family bond" gabungan untuk MVP
- Naik lewat interaksi (ngobrol, hibur, momen malam wajib)
- Turun otomatis pelan-pelan kalau diabaikan, atau turun tajam dari trade-off kerja berlebih
- Bond rendah → efisiensi kerja karakter terkait turun (buff negatif), bukan game over — konsekuensi bersifat gradual

### 6.3 Peran Karakter
| Karakter | Fungsi Idle |
|---|---|
| Ayah | Efisiensi mengemudi/perbaikan → pengaruh konsumsi bahan bakar & kecepatan perbaikan darurat |
| Ibu | Konversi resource mentah → makanan/obat, crafting sederhana |
| Anak | Bond generator utama; juga bisa "membantu" dengan efisiensi rendah tapi risiko capek lebih cepat |

### 6.4 Upgrade Mobil (Dua Jalur)
**Eksterior** (proteksi & kapasitas):
1. Pickup terbuka (start)
2. Terpal/kanvas darurat
3. Container/van tertutup penuh

**Interior** (efisiensi & kenyamanan):
1. Darurat (matras, kompor portable)
2. Semi-layak (kasur, dapur mini)
3. Nyaman (sekat ruang, radio jernih, penyimpanan rapi)

Kedua jalur independen — pemain bisa pilih prioritas mana dulu, menciptakan build/strategi berbeda tiap playthrough.

### 6.5 Event System
- Muncul berkala (interval waktu atau trigger dari kondisi resource/eksterior)
- Berbentuk dialog/pilihan singkat (2–3 opsi), auto-resolve — tidak ada mini-game atau kontrol manual
- Frekuensi & tingkat bahaya event dipengaruhi status eksterior mobil (bak terbuka = lebih sering/berisiko)

### 6.6 Siklus Hari
- **Pagi:** assign tugas tiap karakter
- **Siang–sore:** event acak muncul, resource berjalan (real-time atau dipercepat/skip)
- **Malam:** momen keluarga wajib (pilihan dialog/aktivitas bareng) — sumber utama bond

---

## 7. Progression & Akhir Permainan

Bukan "menang/kalah" biner, tapi kombinasi hasil di akhir sejumlah hari (atau mode endless dengan skor jarak tempuh):

- **Full Survivor:** mobil ter-upgrade penuh, bond tinggi
- **Barely Making It:** bertahan tapi resource/mobil minim
- **Broken but Alive:** fisik selamat, bond keluarga rendah
- **Mode Endless (opsional):** tanpa ending tetap, skor = jarak tempuh + rata-rata bond, cocok untuk elemen incremental/replay

---

## 8. Scope MVP (Rekomendasi Tahap Awal)

Agar tidak overscope, MVP sebaiknya hanya mencakup:
1. Scene statis + background scroll sederhana (belum perlu banyak variasi)
2. 3 resource dasar (Bahan Bakar, Makanan/Air digabung, Spare Parts) + 1 Bond meter gabungan
3. Assign tugas harian (tanpa banyak sub-menu)
4. 5–8 event dialog dasar untuk divalidasi looping-nya
5. 1 jalur upgrade dulu (eksterior saja: 3 tahap pickup → terpal → van) sebelum menambah interior
6. Placeholder visual (bentuk geometris) sebelum masuk aset final

Setelah loop ini terasa "enak", baru ekspansi ke: jalur interior, lebih banyak event, ekspresi karakter, dan aset visual final.

---

## 9. Sistem Waktu, Upgrade, & Offline Progress (Finalized)

### 9.1 Upgrade Instan
Pembelian upgrade (eksterior maupun interior) **langsung resolve** saat dibeli — tidak ada bar progres/waktu tunggu. Yang tetap berbasis waktu hanyalah **generasi resource** dan **siklus hari**, bukan aksi upgrade itu sendiri.

### 9.2 Siklus Waktu
- Resource (Bahan Bakar, Makanan/Air, Spare Parts) **mengalir otomatis secara real-time** selama game terbuka (contoh: +N spare parts/menit), bukan per-klik manual
- 1 hari in-game = interval waktu nyata tetap (contoh awal: 3–5 menit real-time) — maju otomatis, tidak perlu tombol "skip hari"
- **Momen malam (ritual keluarga)** muncul otomatis sebagai popup setiap pergantian hari; pemain merespon pilihan dialog kapan pun siap, tidak memblokir waktu
- Pemain hanya perlu assign tugas karakter sesekali (bisa diubah kapan saja, tidak terikat waktu pagi/sore secara ketat)

### 9.3 Offline Progress
- Simpan `lastSeenTimestamp` di localStorage setiap kali state disimpan/ditutup
- Saat game dibuka kembali: hitung `deltaWaktu = sekarang - lastSeenTimestamp`
- Resource offline dihitung sebagai: `deltaWaktu × rate_passive × offline_multiplier`, dengan:
  - **offline_multiplier**: disarankan 50–70% dari rate aktif (idle saat game terbuka tetap lebih optimal, memberi insentif main aktif)
  - **cap maksimum**: disarankan 8–12 jam offline dihitung, sisanya diabaikan (mencegah exploit "tinggal game seminggu")
- **Bond meter tidak naik saat offline** (butuh interaksi aktif), namun juga tidak turun drastis — cukup stagnan atau menurun sangat lambat
- Saat kembali, tampilkan ringkasan singkat ("Selama kamu pergi: +120 Spare Parts, +40 Bahan Bakar") sebagai payoff standar idle game

### 9.4 Ending & Variasi Akhir
Untuk solo development, hindari branching ending naratif kompleks di tahap awal:
- **MVP:** mode endless dengan **"report card"** yang bisa dicek kapan saja — gabungan skor dari jarak tempuh, level upgrade mobil, dan rata-rata bond meter
- **Pengembangan lanjutan (opsional, bukan prioritas MVP):** 2–3 tier deskriptif berdasarkan kombinasi angka akhir (mis. Full Survivor / Barely Making It / Broken but Alive), ditampilkan sebagai ringkasan teks, bukan cutscene terpisah
