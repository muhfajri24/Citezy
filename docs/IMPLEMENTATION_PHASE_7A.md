# Phase 7A — Real frontend/backend contract integration

27 Oktober 2026. Implementasi lokal; tidak ada commit, push, merge, pergantian branch atau perubahan backend/environment pada fase ini.

## Git baseline dan batas perubahan

Root D:/Hackathon/Citezy, branch feat/frontend, HEAD 1925187 (merge backend #24), mencakup Phase 6.6 eccd408. Awal: next-env.d.ts berubah lama; backend/backend.env untracked; tiga file About/Hero/Footer berubah dari sesi sebelumnya untuk menyembunyikan fixture dalam real mode. Semuanya dipertahankan. Staged diff kosong.

Protected SHA256 sebelum/sesudah: next-env.d.ts B8B3A344484B959AF5E4E3FC1A1609DAC3CB9ECE0CDEB6C145BE29BC4C491000; package-lock.json 667F0B4BF75620B4EEC168899246DFAD8D445BCE1014E09DBE1651777CABAE0C. Tidak membaca/menampilkan API keys atau mengubah env. Konfigurasi lokal dari sesi sebelumnya tetap ada, bukan diubah oleh Phase 7A.

## Kontrak aktual

Pydantic backend/app/schemas/research.py dan OpenAPI server aktual diperiksa read-only.

| Area | Hasil |
|---|---|
| Health | GET /api/health, 200, status ok; liveness saja |
| Start | POST /api/runs, body question, 202, id dan queued/planning |
| Question | OpenAPI/Pydantic minLength 3, maxLength 1000; route memeriksa minimum lagi setelah trim |
| Read | GET /api/runs/{run_id}, ResearchRun, field nullable/default sesuai model FE |
| Enums | Status, stage dan tiga assessment cocok; tidak ditambah enum verified |
| Timestamp | Backend menghasilkan UTC Z; FE memvalidasi timestamp UTC |
| Links | source/evidence/claim/comparison IDs memakai resolver dan diagnosis integrity lama |
| URLs | Backend menerima string bebas; FE tetap menolak protokol berbahaya/credentials. Ini batas validasi FE yang sengaja tidak dilonggarkan |
| Errors | Backend mengubah request validation menjadi 400; FE juga mendukung FastAPI 422 untuk variasi deployment |

HealthResponse backend mendeklarasikan status string; endpoint aktual selalu ok. Adapter FE menerima ok sebagai keberhasilan dan menolak nilai lain secara eksplisit. Tidak menafsirkan health sebagai kesiapan Nebius.

## Perubahan frontend

- Factory real memerlukan base URL eksplisit; menghapus fallback diam-diam ke localhost. Konfigurasi salah gagal, tidak mengganti transport dengan mock.
- getDemoResearchApi kembali khusus demo. Product form/hook tetap memakai getResearchApi; singleton mock/persistensi tidak diganti.
- HttpResearchApi.getHealth memakai timeout/cancellation/error mapping yang sama; tidak menambah health sebagai dependency wajib tiap submit/poll atau mengubah ResearchApi domain interface.
- HTTP 422 dipetakan ke VALIDATION_ERROR aman, tanpa menampilkan detail/body error backend.
- Log raw URL/error di HTTP adapter dan submission dihapus. Tidak mencetak exception internal/network atau body respons server.
- Batas input dan penghitung diperbarui ke 3–1000 Unicode code points agar sesuai Python/Pydantic, tetap trim dan mengunci submit ganda.
- Workspace real memberi caveat bahwa keluaran backend/nama model bukan bukti inference berhasil. Tidak menampilkan error_message backend mentah.
- Tipe domain, payload, route, polling sequential dua detik, timeout GET, retry terbatas, cancellation, terminal stopping, enam tab, inspector, graph dan mock recovery dipertahankan.

## Contract tests (terisolasi, bukan live AI)

Fixture test-only frontend/src/lib/api/test-fixtures/fastapi-runs.json diserialisasi dari model Pydantic aktual pada baseline 1925187: queued, reading, completed, partial dan failed, termasuk nullable/default fields dan relasi valid. Tidak mengimpor konfigurasi backend atau membaca env. Tidak dipakai oleh route aplikasi.

Tes baru: health shape; Pydantic snapshots; POST 202 ke polling queued/reading/completed dan terminal stop; HTTP 400/404/422/429/500 dengan error envelope maupun FastAPI detail tanpa pesan privat; CORS/network rejection tanpa fallback/raw log; missing ID; invalid relation; Unicode boundary. Tes lama meliputi invalid JSON/schema, timeout, abort, visibility/unmount, retry, partial/failed/cancelled, source attribution dan keyboard helpers. Tes batas input lama diperbarui sesuai kontrak aktual; lima kegagalan baseline integrasi teratasi.

Hasil: lint lulus, typecheck lulus, 242 tests / 18 files lulus, production build terisolasi lulus, git diff --check lulus. Build memakai copy source tanpa env files dan dependency lokal, output .next-phase7a agar tidak bertabrakan dengan server development temp yang sudah ada. next-env.d.ts asli tidak disentuh. Tidak mengklaim benchmark performa.

## Live HTTP dan CORS

- 127.0.0.1:8000 health timeout; port yang diharapkan belum dapat dipakai untuk pengujian ini.
- Backend aktual yang sudah berjalan di 127.0.0.1:8001: health 200 dan status ok; OpenAPI berisi tiga endpoint yang diharapkan dan question 3–1000.
- OPTIONS /api/runs dengan Origin http://localhost:3000 mengembalikan Access-Control-Allow-Origin yang cocok.
- POST invalid question a menghasilkan 400 dengan error envelope tanpa membuat run; GET unknown ID menghasilkan 404 dengan envelope.
- GET snapshot lama run-bd8158aee8ec menghasilkan 200 completed dengan dua domain example.org. Tidak membuat paid research run baru. POST 202 dan transisi polling pada fase ini diverifikasi dengan contract tests, bukan diklaim dari eksekusi AI live.
- Browser automation gagal diinisialisasi: failed to write kernel assets / system cannot find the path specified. Karena itu browser CORS enforcement, interaksi enam tab/inspector, back/forward dan responsive tidak diuji ulang pada fase ini. Preflight HTTP bukan pengganti browser CORS test. Implementasi UI lama dipertahankan, tidak didesain ulang.

## Blocker menuju Phase 7B

1. Akses Nebius/Nemotron nyata tetap belum terverifikasi. Jangan menafsirkan completed atau model_id sebagai bukti inference.
2. Backend masih memiliki fallback Tavily fiktif, fallback Nemotron supported_by_excerpt dan comparison angka tetap. Snapshot example.org membuktikan keluaran ini belum layak diklaim hasil riset nyata. Perbaikannya milik Dev 1; backend tidak diubah di sini.
3. Sanitasi server error_message, step failed/partial dan pembatasan execution timeout perlu dituntaskan Dev 1. FE tidak mengekspos pesan mentah.
4. Source URL string bebas, makna match_offset normalized, snippet vs full-text, retention dan provenance runtime perlu keputusan kontrak bersama.
5. Konfigurasi real harus menunjuk URL backend yang benar (lokal saat audit: port 8001); jangan otomatis menyamakan localhost dengan IP perangkat LAN. Tidak mengubah environment pada fase ini.
6. Lakukan browser end-to-end, seluruh error paths di deployment, dan run Nemotron nyata setelah akses/biaya disepakati. OS reduced motion/screen reader/zoom/lintas browser tetap QA terpisah.

Phase 7A menyediakan kompatibilitas kontrak dan transport yang diuji. Phase 7B belum siap dinyatakan live-research ready sampai blocker backend dan runtime terselesaikan.
