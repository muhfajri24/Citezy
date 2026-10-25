# Phase 4.5 — Audit aman dan visual overhaul

Tanggal: 25 Oktober 2026, Asia/Jakarta. Status: selesai untuk cakupan frontend mock. Pengguna kemudian mengizinkan commit dan push; PR dan merge tidak diizinkan.

## A. Kondisi awal dan keselamatan

Root: `D:/Hackathon/Citezy`. Branch aktif `feat/frontend`; HEAD, dev, origin/dev dan origin/feat/frontend pada `1bcbc05`. main tetap `8db0fb9`. Tidak ada perubahan staged. Perubahan lokal awal hanya `frontend/next-env.d.ts` dan `frontend/package-lock.json`; diff keduanya diperiksa, lalu dibiarkan utuh. Tidak ada pembacaan nilai secret atau perubahan environment. File environment yang ditemukan hanya `.env.example`; fallback mock yang sudah tersedia digunakan. Script package.json diperiksa sebelum dijalankan.

Hash SHA256 sebelum dan setelah pekerjaan:
- next-env.d.ts: `B8B3A344484B959AF5E4E3FC1A1609DAC3CB9ECE0CDEB6C145BE29BC4C491000`
- package-lock.json: `F4B0DF7D465686A6346EA7AD98A8CE2501BA1179BCA26F13DF8FD01B1947DF05`

Tidak ada dependency ditambah/dihapus; backend, domain types, kontrak API, adapter HTTP dan factory tidak diubah. Tidak ada reset, clean, force push, pergantian branch, commit, push atau merge.

## B. Hasil audit sebelum implementasi

- Route `/research/[id]` sudah merender ResearchWorkspace; form membuat run lewat shared mock adapter dan menavigasi ke ID tersebut. Keenam tab berfungsi.
- Phase 4 sebelumnya terutama mengubah workspace, bukan komposisi hero landing. CTA header/hero hanya men-scroll ke form, bukan langsung membuat run. Inilah alasan utama perubahan visual sebelumnya kurang terlihat.
- Workspace didominasi kartu dan tab horizontal. Belum ada sidebar collapsible, drawer navigasi, evidence constellation, atau kontrol tutup panel evidence.
- Klik klaim pada laporan hanya memilih/highlight; citation membuka inspector. Sekarang keduanya dapat membuka evidence yang sesuai ketika ID evidence tersedia.
- SubmissionReceipt lama tidak lagi diimpor route; dipertahankan, tidak dihapus. Sources/Comparison sudah dirender inline di workspace, bukan komponen yang terlupakan.
- Data mock sengaja fiktif dan sama untuk semua pertanyaan; run disimpan di memori dan hilang setelah reload. Kedua batasan tetap ditampilkan secara jujur, bukan ditutupi.
- Guard mock-only sudah ada sebelum pekerjaan ini; real adapter tetap utuh dan belum diintegrasikan ke UI. Tidak ada klaim live research.
- Tidak ditemukan error runtime/hydration pada alur yang diuji. Pemeriksaan ini bukan bukti bahwa semua kombinasi browser/response backend telah diuji.

## C. Implementasi dan file

File baru:
- `frontend/src/app/overhaul.css`: sistem visual Phase 4.5 yang di-scope, menggunakan token Midnight Editorial, tanpa aset pihak lain.
- `frontend/src/components/evidence/constellation.tsx`: graph SVG + tombol HTML, panel detail, keyboard roving focus dan alternatif grid mobile.
- `frontend/src/lib/research/constellation.ts`: pembentukan node/edge dari relasi ID yang valid dan tidak ambigu; tracing jalur terpilih.
- `frontend/src/lib/research/constellation.test.ts`: tes relasi, duplikat, referensi hilang, pemilihan, batas tampilan klaim, dan immutability.
- `frontend/src/components/evidence/constellation.test.tsx`: tes markup aksesibel dan empty state.
- Dokumen ini dan screenshot `docs/screenshots/phase-45-*.png`.

File diubah:
- `frontend/src/app/globals.css`: mengimpor stylesheet baru; token dan aturan lama dipertahankan.
- `frontend/src/app/page.tsx`: memasang constellation pada landing.
- `frontend/src/components/landing/hero.tsx`: coordinate strip dan akses langsung ke evidence map; ilustrasi asli dipertahankan dan ditata ulang.
- `frontend/src/components/landing/how-it-works.tsx`: visual jejak Ask → Search → Read → Check → Report, sesuai tahap observer yang sama.
- `frontend/src/components/research/workspace.tsx`: sidebar desktop collapse/expand, drawer mobile, constellation pada Overview, buka/tutup evidence panel, serta klik klaim membuka inspector.
- `frontend/README.md`: petunjuk fitur dan tautan laporan.

Visual: headline lebih besar dengan outline yang bereaksi terhadap hover, kertas editorial pada ruang gelap, latar grid/pointer-reactive yang ringan, form dua kolom pada desktop, sidebar gelap dengan workspace terang, statistik tanpa kartu berlebihan, garis aktif violet/lime dan transisi terarah. Tidak memakai Three.js, Motion atau library baru. Animasi utama memakai transform/opacity; SVG edge hanya berubah stroke/opacity. Panel detail graph memakai tinggi tetap dan scroll internal untuk menahan pergeseran layout saat pemilihan.

Graph menampilkan maksimal 12 klaim yang tidak ambigu, dengan informasi jika ada klaim lain. Edge hanya dibuat ketika claim.evidence_ids, evidence.claim_id dan evidence.source_id konsisten serta ID tidak duplikat. Pemilihan cabang Birch menghasilkan 4 node terkait dan 3 edge; cabang lain meredup. Kutipan dibuka melalui resolveEvidence; akses dibatasi/missing tidak menampilkan kutipan yang tidak tersedia. Pada mobile tersedia grid tombol berlabel, bukan graph kecil yang sulit disentuh. Semua materi diberi label DEMO ONLY.

Navigasi tab menggunakan React state yang sudah ada; tidak diganti menjadi URL routing. Browser Back/Forward tetap mengatur route, bukan riwayat pemilihan tab. Filter dan pilihan ID tetap disimpan saat berganti tab dalam workspace yang sama.

## D. Pengujian yang benar-benar dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `npm.cmd --prefix frontend run lint` | Lulus |
| `npm.cmd --prefix frontend run typecheck` | Lulus |
| `npm.cmd --prefix frontend run test` | Lulus, **138 tes / 8 file**, termasuk 17 tes baru |
| Production `npm run build` (Turbopack) pada salinan terisolasi | Lulus; `/` statis, `/research/[id]` dinamis |
| `git diff --check` | Lulus |

Build dilakukan pada salinan proyek dan dependency di direktori temporary, tanpa file environment. Hanya next-env.d.ts pada SALINAN yang memakai referensi production types. File asli tidak diubah, bahkan sementara. Percobaan isolasi pertama menggunakan junction node_modules gagal karena pembatasan root Turbopack; pengulangan dengan dependency yang benar-benar disalin ke dalam root salinan berhasil. Kegagalan awal bukan disembunyikan atau dianggap sukses. Tidak ada install/uninstall dependency pada repository.

Tes lama tetap mencakup input/duplicate prevention/reset, mock lifecycle completed/partial/failed/cancelled, backoff/abort/visibility/terminal stop, error state, selected evidence, source filtering, missing reference dan keyboard tab. Tes baru memeriksa graph sebenarnya, bukan gambar dummy. Unit test menggunakan Node/SSR; klik browser berikut dilaporkan terpisah.

Browser development:
- Contoh pertanyaan → submit → workspace berhasil.
- Semua enam tab diklik; judul dan aria-selected sesuai.
- Overview → Sources → Birch → Evidence e2 berhasil.
- Panel evidence dapat ditutup/dibuka dan tetap menunjukkan evidence yang sesuai.
- Klik klaim laporan membuka dialog inspector yang benar; Escape menutup.
- Sidebar collapse/expand berfungsi.
- Drawer mobile membuka semua enam tujuan; pemilihan Activity mengganti konten; Escape mengembalikan fokus ke tombol navigation.
- Graph: pilih klaim/excerpt/source, edge/node highlight, detail benar, End memilih node terakhir.
- Scroll storytelling: tombol Search/Read/Verify mengganti visual dan jejak; scroll sesungguhnya mengubah active step dari Search menjadi Verify setelah observer berjalan.
- Evidence preview lama tetap memperbarui sumber dan excerpt Birch.
- Landing dan workspace pada 320/375/768/1280 px: page scrollWidth sama dengan clientWidth (305/360/753/1265). Tabel tetap memiliki area scroll sendiri; keenam tab tersedia.
- Tidak ada warning/error pada console dalam alur tersebut.

Browser production (`npm start` salinan pada port 3001): graph memilih excerpt Cedar; submit membuat run queued; setelah selesai sumber dapat dicari, dipilih, dan dibuka evidence-nya; kontrol tutup/buka panel berfungsi; reload menampilkan missing-session recovery. Tidak ada warning/error dalam smoke test.

Batas pemeriksaan: belum menjalankan Lighthouse/Web Vitals, screen reader audit, OS reduced-motion toggle, atau integration test dengan API asli. Reduced-motion CSS dan guard pointer tetap ada dan diperiksa. Perbedaan fokus native dialog pada otomasi IAB dari Phase 4 belum dianggap tuntas untuk seluruh browser; perlu audit keyboard/screen reader lintas browser lanjutan. Tidak ada klaim lolos audit accessibility penuh.

## E. Status fitur

| Fitur | Status |
|---|---|
| Landing visual overhaul, pointer/kinetic typography, input dan CTA | Selesai untuk mock |
| Scroll storytelling dan interactive evidence preview | Selesai |
| Evidence constellation desktop/mobile + keyboard | Selesai |
| Enam tab, sidebar, drawer, panel evidence dan relasi data | Selesai untuk mock |
| Responsive dan pemeriksaan accessibility dasar | Selesai; audit menyeluruh belum dilakukan |
| Live backend/Nemotron, persistence/history, export/SSE | Belum selesai; di luar scope Phase 4.5 |

## F. Cara mencoba

1. Jalankan `npm.cmd --prefix frontend run dev`, buka `http://localhost:3000` dalam mode mock.
2. Perhatikan hero baru; CTA menuju form. Pilih contoh, submit, dan buka Activity. Mock mencapai terminal sekitar 12 detik.
3. Di landing pilih Explore the evidence constellation. Klik Claim 02, Excerpt 02 lalu Source 02; perhatikan jalur, kutipan, dan tautan yang berubah. Coba arrow/Home/End, kemudian Tab ke detail.
4. Scroll How it works; visual dan garis jejak mengikuti tahap aktif. Klik tombol tahap untuk langsung menuju tahap tersebut.
5. Di workspace coba sidebar Collapse/Expand. Klik Sources, cari Birch, pilih sumber, lalu Inspect linked evidence. Tutup/buka panel evidence.
6. Di Research Report klik teks klaim atau citation. Gunakan Escape dan periksa fokus kembali. Comparison tetap dapat di-sort dan detail di-expand.
7. Pada mobile buka Workspace navigation, pilih tab, lalu tutup drawer. Graph berubah menjadi grid tombol sentuh.
8. Reload halaman run untuk melihat recovery missing-session. Hasil mock bukan penelitian nyata; tautan example.org bukan paper sungguhan.

## G. Git safety dan rekomendasi

Audit implementasi awal tidak melakukan commit, staging, push atau merge. Publikasi berikutnya hanya dilakukan atas instruksi pengguna pada feat/frontend; main/dev tidak diubah. main/dev tidak berubah. Kedua perubahan lokal awal memiliki hash identik. Adapter backend/API tidak berubah; environment tidak dibaca nilainya atau ditulis.

Prioritas berikutnya: audit keyboard/screen reader lintas browser, pengukuran performance nyata, lalu integrasi Dev 1 setelah kontrak disetujui. Persistensi demo/session adalah pekerjaan terpisah; jangan memperkenalkan cache yang diam-diam menyamarkan kegagalan real API. Jangan menganggap Phase 4.5 ini sebagai bukti live AI atau deployment publik.
