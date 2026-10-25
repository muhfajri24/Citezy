# Phase 4.6 - Living Interface 2.0

Tanggal: 25 Oktober 2026 (Asia/Jakarta). Status: implementasi refinement selesai untuk frontend mock; siap direview pada feat/frontend. Ini melanjutkan Phase 4.5, bukan penggantian arsitektur.

## A. Keselamatan Git awal

Root `D:/Hackathon/Citezy`, branch aktif `feat/frontend`, HEAD/origin/feat/frontend `702b929`. Referensi dev/origin/dev tetap `1bcbc05`, main/origin/main tetap `8db0fb9`. Tidak ada staged changes. Perubahan lokal awal hanya frontend/next-env.d.ts dan frontend/package-lock.json; diff diperiksa dan kedua file tidak diedit atau dikembalikan. Tidak ada file environment yang diubah atau nilai secret yang dibaca/dicetak. Tidak ada operasi Git destruktif, commit, push, merge, pergantian branch, atau perubahan backend/API.

Hash SHA256 kedua file tetap identik sebelum/sesudah:
- next-env.d.ts: B8B3A344484B959AF5E4E3FC1A1609DAC3CB9ECE0CDEB6C145BE29BC4C491000
- package-lock.json: F4B0DF7D465686A6346EA7AD98A8CE2501BA1179BCA26F13DF8FD01B1947DF05

## B. Audit visual dan prioritas

1. Hero memakai pemetaan pointer langsung dengan transisi CSS yang saling menumpuk, sehingga pergerakannya kurang menyatu. Prioritas: interpolasi framerate-independent dengan beberapa layer dan berhenti saat tidak diperlukan.
2. Storytelling sudah berubah per tahap, tetapi belum memiliki jejak scroll kontinu. Prioritas: satu CSS variable berbasis posisi section, tanpa scroll hijacking atau rerender React setiap scroll.
3. Graph memiliki relasi yang benar, tetapi perpindahan detail mendadak dan panel dapat mempertahankan posisi scroll lama. Prioritas: reveal edge, breadcrumb dari ID sebenarnya, transisi isi, reset scroll panel internal.
4. Sidebar berubah lebar seketika dan indikator tab diulang sebagai garis per tombol. Prioritas: FLIP transform untuk layout dan satu indikator yang bergerak.
5. Tutup panel evidence menghapus konten dan mengubah tinggi panel. Prioritas: tinggi tetap, transisi opacity/transform, konten tertutup menjadi inert dan aria-hidden.
6. Feedback contoh pertanyaan, hasil filter sumber dan tahap adapter belum cukup eksplisit. Prioritas: state terpilih, live-region yang relevan, dan progress berdasarkan jumlah tahap done.
7. Ukuran/timing sebelumnya tersebar. Prioritas: token motion bersama; tanpa dependency baru atau efek WebGL.

Baseline landing dan workspace diperiksa di browser dan disimpan sebagai phase-46-before-*.png. Tab browser baseline sempat masih menampilkan bundle lama setelah HMR; navigasi penuh ke homepage memuat source terbaru, kemudian seluruh uji interaksi diulang. Ini tidak dianggap bukti server production/public telah diperbarui.

## C. Motion dan interaksi yang diimplementasikan

- Token: fast 140ms, panel 220ms, reveal 360ms, easing interface cubic-bezier(.22,1,.36,1), easing press dengan sedikit overshoot hanya untuk feedback kecil. FLIP memakai durasi/easing yang sama dari TypeScript.
- Hero: exponential damping tanpa overshoot, target maksimum dari helper pointer yang sudah ada, layer teks/ilustrasi/source slip dengan kedalaman berbeda, headline choreography per baris, dan garis visual penghubung hero ke form. Tidak ada loop permanen: RAF berhenti saat target tercapai, offscreen, hidden, reduced-motion atau unmount. Pointer coarse/touch tidak diberi parallax.
- Input: contoh memiliki aria-pressed dan feedback pilihan, pesan status setelah contoh dimuat, focus outline yang jelas, error state yang terarah, dan indikator indeterminate hanya saat submit benar-benar pending. Tidak ada persentase riset atau animasi completion buatan.
- Storytelling: IntersectionObserver tahap lama dipertahankan; passive scroll listener menjadwalkan maksimal satu update CSS per frame saat section terlihat. Jejak kontinu mengikuti scroll; tombol tahap dan keyboard tetap berfungsi. Scroll progress adalah narasi demo, bukan progress AI.
- Constellation: graph/validasi lama tetap dipakai. Pemilihan mengungkap edge yang benar secara berurutan, menunjukkan satu connected path dari ID yang tersedia, dan memperbarui detail dalam ruang dengan tinggi tetap. Pemilihan baru mengembalikan scroll panel internal ke awal tanpa memindahkan fokus dari node. Roving keyboard/mobile grid tetap ada. Dimming diringankan untuk menjaga keterbacaan metadata.
- Sidebar: FLIP mengambil geometri sebelum/sesudah satu layout update dan menganimasikan transform lewat Web Animations API. Tidak ada pembacaan layout per frame. Animasi lama dibatalkan saat toggle berikutnya/unmount; reduced-motion melewati animasi dan membatalkan animasi aktif saat preferensi berubah.
- Tabs: satu indicator berpindah mengikuti posisi/lebar tombol aktif, ResizeObserver menjaga penyesuaian ukuran. Konten, aria-selected, keyboard dan filter/selection state lama tetap dipertahankan.
- Inspector/drawer: transisi native dialog memakai opacity/transform serta discrete display/overlay bila didukung. Browser tanpa dukungan menampilkan/menutup langsung. Tidak ada timeout yang menahan input atau penutupan. Escape dan fokus kembali tetap memakai perilaku native serta pengelolaan fokus yang sudah ada.
- Evidence inline: konten selalu berada dalam layout agar tinggi tidak berubah, tetapi saat ditutup menjadi inert dan aria-hidden, dengan pesan panel closed. Transisi tidak membuat kontrol tersembunyi tetap bisa difokuskan.
- Report: hover/focus klaim dan citation lebih jelas, selected claim dibedakan. Source Explorer: animasi detail dan jumlah hasil filter yang diumumkan. Comparison: expanded row ditonjolkan dan affordance expand/collapse jelas; null tetap Not reported.
- Activity: native progress memakai jumlah step berstatus done dan max jumlah step dari run. Label menyatakan stage completion, bukan confidence. Failed/partial/cancelled tidak diubah menjadi success. CSS perubahan status berdasarkan run sebenarnya.
- Route: loading.tsx menggunakan fallback Next.js/Suspense asli untuk membuka interface; tidak mengarang tahap run, tidak mengganti router, dan tidak menunda navigasi. Main workspace mendapat entrance ringan.

## D. File baru

- frontend/src/lib/motion/system.ts
- frontend/src/lib/motion/system.test.ts
- frontend/src/hooks/use-interface-motion.ts
- frontend/src/app/motion.css
- frontend/src/app/research/[id]/loading.tsx
- docs/IMPLEMENTATION_PHASE_4_6.md
- Screenshot docs/screenshots/phase-46-*.png

## E. File yang diubah

- frontend/src/app/globals.css: impor stylesheet motion.
- frontend/src/components/landing/hero.tsx: memakai hook depth baru.
- frontend/src/components/landing/how-it-works.tsx: ref/progres narasi.
- frontend/src/components/landing/research-input.tsx: feedback input/contoh/pending.
- frontend/src/components/evidence/constellation.tsx: edge reveal, breadcrumb dan transisi detail.
- frontend/src/components/research/workspace.tsx: FLIP, indikator, filter feedback, panel inert/stabil.
- frontend/src/components/research/views.tsx: progress berdasarkan step adapter.
- frontend/src/components/research/views.test.tsx: pengujian progress dan fallback route.
- frontend/README.md: cara mencoba refinement dan tautan laporan.

Tidak ada library ditambahkan. Model domain, mock/real transport, validation dan relationship resolver tidak diubah.

## F. Pengujian otomatis

| Perintah | Hasil |
|---|---|
| npm.cmd --prefix frontend run lint | Lulus |
| npm.cmd --prefix frontend run typecheck | Lulus |
| npm.cmd --prefix frontend run test | Lulus: 156 tes / 9 file |
| npm run build (Turbopack) pada salinan source terisolasi | Lulus |
| git diff --check | Lulus |

18 tes baru mencakup damping tanpa overshoot, konsistensi antar framerate, coalescing target, berhenti saat rest, reset/cancel saat hidden, stale callback setelah disposal, progress scroll yang di-clamp, geometri FLIP, progress failed 4/5 sesuai data, empty stages, dan fallback route tanpa progress palsu. Semua tes Phase 0-4.5 dipertahankan.

Build dijalankan pada direktori temporary dengan dependency lokal yang sudah tersedia, tanpa file environment. Seluruh file src disamakan dan diperiksa hash-nya terhadap workspace. next-env.d.ts production hanya milik salinan; file asli tidak diubah, bahkan sementara. Hasil route: homepage statis dan research/[id] dinamis.

## G. Browser verification dan screenshot

Pengujian development:
- Enam tab diklik, judul dan aria-selected benar.
- Progress Activity diamati dari queued 0/5 ke completed 5/5.
- Search Birch mengumumkan 1 hasil, memilih source lalu Evidence e2 menampilkan kutipan/source Birch yang benar.
- Collapse/expand sidebar berhasil; computed transform non-none diamati saat FLIP berjalan, fokus tetap pada toggle.
- Tinggi inspector sama saat closed/open: 640.7px pada viewport uji. Closed body inert dan aria-hidden; reopen tetap menunjukkan klaim yang dipilih.
- Citation membuka modal; Escape menutup dan mengembalikan fokus ke citation asal.
- Drawer mobile membuka Evidence, keyboard Home/Arrow tetap berfungsi.
- Graph keyboard End memilih source terakhir; satu cabang memiliki 4 node terkait/3 edge, node lain meredup; breadcrumb c2/e2/s2 benar. CSS evidence-trace dan detail-handoff aktif. Scroll detail kembali 0 ketika dipilih ulang.
- Pointer hero menghasilkan nilai pecahan terbatas; teks dan ilustrasi memiliki offset berbeda. Penjagaan media-query/visibility diperiksa.
- Scroll cerita mengubah stage dan CSS progress (contoh nilai sekitar .409 saat Search dan .838 saat Report); visual dan tombol tetap sinkron setelah observer berjalan.
- Landing dan workspace diuji pada 320/375/768/1280px; scrollWidth sama dengan clientWidth (305/360/753/1265). Semua enam tab tersedia, overflow tabel terkurung di container. Contoh pada mobile 320/375px memiliki tinggi 44px dan node 56px.
- Blank submit menampilkan error; contoh terpilih mengisi input dan aria-pressed. Tidak ada error/warning pada console dalam alur yang diuji.

Smoke test production (salinan build, port 3001): Ctrl+Enter membuat run, Activity queued 0/5 lalu completed 5/5, filter source dan relasi ke Evidence e2 berhasil. Back mengembalikan form yang enabled; Forward kembali ke route workspace. Tab tetap memakai React state dan dapat kembali ke Overview setelah route dipasang ulang; riwayat tab tidak disimpan di URL. Tidak ada error/warning dalam smoke test.

Screenshot sebelum/sesudah dan detail interaksi disimpan di docs/screenshots/phase-46-*.png. Screenshot statis tidak membuktikan timing animasi; hasil timing/transform di atas berasal dari inspeksi browser dan tes scheduler.

Keterbatasan: belum melakukan Lighthouse/Web Vitals, audit screen reader lengkap, atau emulasi/toggle prefers-reduced-motion pada OS. CSS/media guard, penghentian driver dan cleanup diuji/ditinjau; tidak diklaim sebagai uji OS langsung. Tidak ada live backend, inference atau deployment publik yang diuji. Perbedaan fokus Tab native dialog pada otomasi IAB dari catatan sebelumnya belum dianggap tuntas untuk seluruh browser; Escape/focus return teruji dalam pekerjaan ini.

## H. Cara mencoba dan rekomendasi

1. Jalankan npm.cmd --prefix frontend run dev dan buka http://localhost:3000 dalam mock mode.
2. Gerakkan pointer pelan di hero desktop; amati perbedaan kedalaman teks/kertas. Saat pointer berhenti, animasi harus ikut berhenti.
3. Pilih contoh pertanyaan, edit, lalu submit dengan tombol atau Ctrl/Cmd+Enter. Validasi dan pending tidak boleh menahan navigasi.
4. Scroll storytelling, lalu klik Search/Read/Verify/Report. Perhatikan jejak kontinu serta perubahan visual tahap.
5. Pilih Claim 02 pada constellation, lalu Excerpt 02 dan Source 02. Coba arrow/Home/End dan Tab ke link detail. Pada mobile gunakan grid tombol.
6. Di workspace coba Collapse/Expand, semua tab, Sources -> Birch -> Evidence. Tutup/buka evidence, buka citation dan tekan Escape.
7. Di Activity, perhatikan angka mengikuti adapter dan berhenti setelah terminal. Label support tetap Supported by excerpt / Partially supported / Unsupported.
8. Pada mobile gunakan Workspace navigation; tabel comparison tetap dapat digeser dalam container-nya.

Prioritas berikutnya: audit reduced-motion/screen reader lintas browser dan pengukuran performance aktual, kemudian integrasi dengan Dev 1 setelah kontrak disetujui. Persistence/history dan URL tab state merupakan keputusan terpisah; mock run tetap hilang saat reload. Commit dan push Phase 4.6 diotorisasi pengguna setelah verifikasi; merge tidak diotorisasi.
