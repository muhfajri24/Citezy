# Phase 6 — Kesiapan demo, reliabilitas dan persiapan integrasi

25 Oktober 2026. Implementasi frontend mock tersedia lokal untuk review. Tidak ada commit, push atau merge. Integrasi backend nyata dan audit accessibility/performa penuh belum diklaim selesai.

## Keselamatan Git dan temuan awal

Root D:/Hackathon/Citezy; branch feat/frontend; HEAD b58531b; staged diff awal kosong. Pekerjaan Phase 5 yang belum di-commit diperiksa dan dipertahankan. next-env.d.ts serta package-lock.json tidak diedit/dikembalikan; SHA256 tetap B8B3A344484B959AF5E4E3FC1A1609DAC3CB9ECE0CDEB6C145BE29BC4C491000 dan F4B0DF7D465686A6346EA7AD98A8CE2501BA1179BCA26F13DF8FD01B1947DF05.

MASTER_SPEC/Parts A–F, FE.md, API_HANDOFF.md, laporan Phase 4.6/5, frontend/AGENTS.md serta panduan Next.js client/notFound diperiksa. Backend, environment, tipe domain dan kontrak wire tidak berubah. Tidak ada dependency baru.

Sebelumnya mock hanya menyimpan Map dan memakai counter demo-1 per instance, sehingga reload menghilangkan run. Unknown ID menghasilkan NOT_FOUND. Adapter real sudah menangani HTTP/network/timeout/schema error dengan pesan aman; poller memiliki retry terbatas, cancellation, visibility handling dan terminal stopping. UI masih sengaja mock-only. Report kosong dan referensi evidence tidak valid sudah memiliki fallback yang jujur.

## Persistensi dan recovery

DemoSessionApi membungkus mock pada factory browser. sessionStorage dibaca secara lazy di client, memakai schema version 1 dan key citezy.demo.sessions.v1; maksimal lima snapshot per tab. parseRun memvalidasi sebelum pemulihan. Data rusak, terlalu besar, beda versi, atau duplicate ID diabaikan dengan aman. Penolakan storage/quota tidak menggagalkan simulasi di memori dan ditampilkan sebagai peringatan.

Hanya output fiktif yang dihasilkan mock disimpan. Pertanyaan asli diganti kalimat DEMO ONLY sebelum penulisan. API key/configuration tidak disimpan. UI restored menjelaskan bahwa pertanyaan asli tidak disimpan. ID mock browser memakai UUID untuk menghindari tabrakan setelah reload; default counter deterministik tetap ada untuk tes adapter lama.

Snapshot terminal mempertahankan status/data yang benar-benar tersimpan. Snapshot aktif dibekukan pada status/steps terakhir, dilabeli interrupted, tidak berlanjut otomatis dan menyediakan New demo. Poller mempunyai continuation predicate lokal tanpa enum backend baru. Refresh manual membaca snapshot, bukan mengarang completion. Tidak ada storage hydration saat server render.

Real mode tidak membuat wrapper penyimpanan dan tidak fallback ke mock. Unknown ID menampilkan error, Refresh dan New research yang dapat digunakan. Pengumuman status tidak lagi terus mengatakan Opening setelah error.

## QA beberapa evidence

Route development /dev/evidence menggunakan fixture terpisah serta ClaimInspector/SourceDetails yang sama. Fixture utama tidak berubah. Excerpt fiktif Maple dan Cedar yang sudah ada digunakan pada claim unsupported; tidak membuat kutipan baru. Referensi ketiga sengaja hilang. Attribution berpindah s3 ke s1 dengan benar. Route memakai notFound di luar development; HTTP production mengembalikan 404.

Browser menguji pemilihan setiap excerpt, Previous/Next, boundary disabled, Enter pada Next, unavailable reference, pilihan setelah inspector unmount/remount, source detail dan mobile. Ini menggantikan keterbatasan QA multi-excerpt pada laporan Phase 5. Skenario tersebut menguji interaksi, bukan menunjukkan corroboration atau hasil penelitian nyata.

## Hasil pengujian

- Lint: lulus.
- Typecheck: lulus.
- Tests: 192 lulus / 12 file (178 sebelumnya + 14 tes sesi baru).
- Production build Next.js Turbopack: lulus pada salinan source identik dengan dependency lokal, tanpa file environment; next-env.d.ts asli tetap utuh.
- git diff --check: lulus.

Tes baru mencakup redaksi pertanyaan, recovery completed/partial/failed/cancelled, interrupted polling, storage rusak/versi berbeda/ditolak/quota, duplicate snapshot, batas lima entry, mock/real isolation dan aborted read. Tes timeout/network/malformed response/integrity/polling serta Phase 5 tetap dipertahankan.

## Verifikasi browser

Development localhost:3000: contoh pertanyaan membuat UUID run; reload completed mempertahankan ID, status dan report dengan label restored dan pertanyaan generik. Run aktif yang direload pada searching/1 of 5 tetap pada kondisi tersebut setelah durasi normal simulasi berlalu; tidak mengarang report/completion. Restart tersedia.

Enam tab bekerja setelah pemulihan. Citation Enter membuka e2/s2; Escape mengembalikan fokus. Unknown ID selesai menjadi unavailable, bukan skeleton tanpa akhir. Skenario multi-evidence dan unknown-ID diperiksa pada lebar aktual 320/375/768/1280; clientWidth sama dengan scrollWidth (305/360/753/1265). Console warn/error kosong selama alur yang diperiksa.

Production localhost:3001 pada salinan build: create run, completed, reload dan pemulihan snapshot berhasil. Workspace restored diperiksa pada empat lebar aktual yang sama tanpa horizontal overflow. Sidebar collapse/expand, graph keyboard End/source detail, dan drawer mobile ke Evidence bekerja. Console warn/error kosong pada smoke test. Route /dev/evidence mengembalikan HTTP 404.

Screenshot di docs/screenshots/: phase-6-restored.png, phase-6-interrupted.png, phase-6-multi-mobile.png, phase-6-production-restored.png. Screenshot diperiksa sebagai bukti UI, bukan benchmark timing.

## Accessibility dan performa

Tombol native mempertahankan keyboard semantics, status memiliki teks, panel tertutup tetap inert, dan dialog Escape/focus return teruji. Screen reader serta toggle OS reduced-motion tidak tersedia dalam workflow ini. Browser zoom 200% belum diuji; narrow viewport tidak diklaim setara. Focus trap Phase 5 tetap tercatat, tetapi audit lintas browser masih diperlukan.

Motion diperiksa: pointer berhenti saat rest/offscreen/hidden/reduced motion; scroll menjadwalkan satu update CSS; cleanup effects dipertahankan. Tidak menambah animation loop/listener library. Storage dibatasi dan ditulis pada pembacaan mock aktual, normalnya dua detik saat aktif; bukan setiap frame. Polling otomatis berhenti pada terminal/interrupted snapshot.

Lighthouse tidak terpasang; Navigation Performance API tidak tersedia pada scope evaluasi read-only browser. Tidak ada skor Lighthouse/Core Web Vitals/timing interaksi yang dikarang. Heap profiling, long-duration leak test dan benchmark regresi kuantitatif belum dilakukan.

## File Phase 6

Baru di frontend/: src/lib/mock/session.ts, session.test.ts, qa-fixture.ts; src/components/evidence/qa-scenario.tsx; src/app/dev/evidence/page.tsx. Dokumentasi baru: docs/INTEGRATION_READINESS.md, laporan ini dan empat screenshot phase-6.

Diubah: frontend/src/lib/api/mock-client.ts, factory.ts; frontend/src/lib/research/poller.ts; frontend/src/hooks/use-research-run.ts; frontend/src/components/research/workspace.tsx; frontend/README.md. Perubahan Phase 5 masih lokal dan dipertahankan bersama perubahan ini.

## Integrasi backend dan langkah berikutnya

Lihat INTEGRATION_READINESS.md: interface/route yang tersedia, health adapter yang belum ada, strict source-URL validation, keterbatasan caller cancellation POST, Retry-After, serta keputusan CORS/retention/deployment dan fixture Dev 1. Tidak ditemukan implementasi backend di backend/; tidak menjalankan script backend atau mengklaim live integration.

Berikutnya: review Phase 5/6 lokal, dapatkan OpenAPI/fixture serta persetujuan Dev 1, selesaikan screen reader/reduced-motion/zoom 200% dan pengukuran production performance, lalu aktifkan real mode bersama. Tab/history tidak dipersist. Browser session/storage eviction dapat menghapus snapshot; ini bukan history pengguna yang durable.
