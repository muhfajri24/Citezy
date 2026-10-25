# Phase 5 — Evidence Verification Experience

25 Oktober 2026. Implementasi frontend mock tersedia untuk review lokal; tanpa commit, push atau merge pada fase ini.

## Git dan batas perubahan

Root D:/Hackathon/Citezy; branch feat/frontend; HEAD b58531b. Awal pekerjaan tidak ada staged changes. Dua perubahan lama frontend/next-env.d.ts dan frontend/package-lock.json dipertahankan, tidak diedit/dikembalikan. Backend, domain types, adapter, fixture, environment dan kontrak API tidak berubah. Tidak ada dependency ditambahkan.

Dokumentasi MASTER_SPEC (Parts A–F dokumen rujukan), FE.md, API_HANDOFF.md, laporan Phase 4.6, frontend/AGENTS.md dan panduan use-client Next.js terpasang dibaca. Tidak mengklaim integrasi backend atau persetujuan kontrak Dev 1.

## Audit awal

- Resolver resolveEvidence sudah menolak hubungan hilang/ambigu, claim mismatch dan source restricted/unavailable. Dipertahankan.
- Report mempunyai claim/citation buttons, tetapi claim tanpa evidence tidak membuka inspector.
- Evidence tab sudah punya filter dan panel; belum mempunyai pilihan excerpt individual yang tersambung ke selection workspace.
- Source traversal memilih claim tanpa memastikan excerpt yang dipilih berasal dari source yang sedang dilihat.
- Constellation mempunyai detail terpisah dari inspector workspace; penjelasan assessment belum konsisten.
- Native dialog, Escape, focus return, roving graph keyboard, drawer dan motion Phase 4.6 sudah ada. Dipertahankan.

## Implementasi

ClaimInspector menjadi tampilan bersama untuk report dialog, Evidence tab dan constellation. EvidenceDetail tetap menjadi alias kompatibel agar tidak membuat inspector kedua. SourceDetails/SourceLink dipakai ulang di semua tempat tersebut.

Inspector menampilkan teks claim tepat, status dengan teks, penjelasan status sesuai instruksi, limitations, jumlah referensi evidence, excerpt terpilih, attribution, explanation dan metadata source yang tersedia. Unsupported menjelaskan bahwa ketiadaan dukungan bukan bukti kepalsuan; excerpt-nya tidak diberi mark dukungan.

Tidak ada exact supporting span (start/end) pada kontrak. match_offset sendiri tidak cukup untuk menentukan rentang dukungan. Seluruh excerpt yang disuplai di-highlight untuk supported/partial, dengan penjelasan eksplisit. Tidak memakai string matching, synthetic quote atau metadata tambahan.

Beberapa evidence memakai tombol excerpt dan Previous/Next dengan disabled boundary dan status posisi. State lokal dipisahkan per run/claim; perubahan evidence tidak me-remount seluruh inspector sehingga fokus kontrol tidak hilang. Explicit invalid IDs tidak diam-diam dialihkan ke excerpt lain. Missing/duplicate claim, evidence atau source ditampilkan unavailable melalui resolver.

Source traversal membawa pasangan claim ID dan evidence ID yang tervalidasi, bukan mengambil evidence pertama dari claim. Evidence detail dapat membuka source tab dengan source ID tepat. Report claim tanpa evidence tetap membuka inspector. Filter tidak membuang selection; ketika selection berada di luar filter ada pemberitahuan, dan empty filter memiliki reset. Stale selected claim/source ditampilkan unavailable. Route workspace sudah di-key dengan run ID.

Constellation mempertahankan graph, edge animation, relationship validation, mobile grid dan roving keyboard. Detail claim/evidence memakai ClaimInspector; source node memakai SourceDetails. Workspace map dapat membuka dialog yang sama. Landing map memakai inspector yang sama secara inline tanpa mengubah routing.

## File

Baru:
- frontend/src/lib/research/inspection.ts
- frontend/src/lib/research/inspection.test.ts
- frontend/src/components/evidence/claim-inspector.tsx
- frontend/src/components/evidence/claim-inspector.test.tsx
- frontend/src/app/inspection.css
- docs/IMPLEMENTATION_PHASE_5.md
- docs/screenshots/phase-5-inspector-desktop.png
- docs/screenshots/phase-5-inspector-mobile.png

Diubah:
- frontend/src/components/research/workspace.tsx
- frontend/src/components/research/views.tsx
- frontend/src/components/evidence/constellation.tsx
- frontend/src/app/globals.css

## Pengujian

Hasil final: lint lulus; typecheck lulus; 178 tes / 11 file lulus (22 tes tambahan); production build Next.js Turbopack lulus; git diff --check lulus. Tes baru mencakup selection chain, beberapa evidence, boundaries, missing/duplicate IDs, mismatch, stale selection, empty report/filter, partial/unsupported, highlight utuh dan safe source URLs. Tes lama dipertahankan.

Build memakai salinan source terisolasi dengan dependency lokal agar Next.js tidak menulis ulang next-env.d.ts asli. Tidak ada file environment disalin. Pemeriksaan hash source dilakukan sebelum build final.

Browser development localhost:3000, diuji langsung:
- Submit contoh pertanyaan menuju run mock; report c2 membuka inspector e2/s2.
- View source detail memilih s2; linked evidence kembali ke c2/e2, bukan claim/evidence lain.
- Enam tab menampilkan heading yang sesuai.
- Filter unsupported menampilkan satu claim; c3 menunjukkan penjelasan unsupported dan tanpa mark.
- Enter pada citation membuka dialog; Escape menutup dan fokus kembali ke citation asal.
- Shift+Tab dari close berputar ke link terakhir; Tab kembali ke close, tetap dalam dialog.
- Tutup panel inline memberi inert; buka kembali bekerja.
- Constellation claim c2 memakai inspector bersama; tombol Open claim inspector membuka dialog. Keyboard End menuju s3 dan source detail menampilkan c3/e3.
- Drawer mobile membuka Evidence dengan benar.
- Viewport 320/375/768/1280: halaman clientWidth/scrollWidth sama (305/360/753/1265). Dialog clientWidth/scrollWidth sama (250/305/663/663). Tidak ada page/dialog horizontal overflow. Tombol Previous/Next claim minimal 44px pada pengukuran ini.
- Console warn/error kosong selama alur uji.

Screenshot desktop/mobile disimpan dan diperiksa secara visual. Screenshot menunjukkan inspector dengan partial support dan excerpt utuh.

## Batas verifikasi dan risiko

Fixture demo utama tetap satu excerpt per claim. Multi-excerpt diuji lewat model dan render test terisolasi dengan data fiktif; belum diuji interaksi browser multi-excerpt. Tidak menambah quote baru hanya untuk demonstrasi. Kasus data rusak diuji pada unit/render tests, bukan lewat manipulasi data halaman browser.

Belum ada audit screen reader lengkap, OS prefers-reduced-motion toggle, zoom 200%, pengukuran performa atau smoke test deployment publik. CSS Phase 4.6 dan reduced-motion guard dipertahankan. Native dialog diuji pada browser IAB; kompatibilitas lintas browser masih perlu QA. Mock session hilang saat reload dan tab tidak disimpan di URL, sesuai batas sebelumnya.

Seluruh hasil tetap DEMO ONLY. Original source URL yang tersedia tetap URL fiktif example.org; keberadaan link bukan bukti sumber telah divalidasi atau halaman demo tersebut tersedia. Live API/Nemotron/Tavily tidak diuji.

## Cara mencoba

1. npm.cmd --prefix frontend run dev, buka localhost:3000 dengan mock mode.
2. Pilih contoh, submit, buka Research Report dan klik claim/citation.
3. Baca assessment/limitations, pilih View source detail lalu Inspect evidence pada source.
4. Di Evidence, ganti filter dan pilih claim lain; coba Close/Open evidence panel.
5. Di Overview pilih node constellation dan Open claim inspector; coba arrow/Home/End.
6. Pada mobile buka Workspace navigation; gunakan Enter/Tab/Shift+Tab/Escape untuk inspector.

Langkah berikutnya: QA multi-excerpt browser dengan fixture yang disepakati, screen reader/reduced motion lintas browser, lalu integrasi nyata bersama Dev 1 tanpa mengganti kontrak secara sepihak.
