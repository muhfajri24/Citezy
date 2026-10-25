# Phase 6.5 — Frontend hardening dan kesiapan integrasi

25 Oktober 2026. Implementasi terarah pada frontend mock, tanpa redesign atau aktivasi real backend. Pengguna secara eksplisit mengizinkan commit/push ke feat/frontend jika pemeriksaan aman, menggantikan larangan publishing default pada lampiran. Tidak ada merge ke dev/main.

## 1. Keselamatan Git

Root D:/Hackathon/Citezy; branch feat/frontend; HEAD awal 508c713. Phase 5/6 sudah committed. Staged diff awal kosong. next-env.d.ts dan package-lock.json tetap tidak dimodifikasi/stage/restore. backend/backend.env tetap lokal dan tidak dibaca. Tidak ada perubahan backend, environment, tipe domain atau kontrak API.

Pada pemeriksaan akhir branch workspace utama berubah menjadi main, dengan HEAD yang masih identik dengan feat/frontend. Publishing dilakukan melalui worktree terpisah pada feat/frontend; tidak melakukan commit di main, merge atau pergantian branch workspace utama. Seluruh perubahan lokal utama dipertahankan.

Dokumentasi MASTER_SPEC/FE/API_HANDOFF, laporan Phase 5/6 dan INTEGRATION_READINESS serta frontend/AGENTS.md menjadi acuan. Panduan Next.js terpasang telah dibaca pada fase sebelumnya; tidak mengubah routing dalam fase ini.

## 2. Accessibility

- Helper focus boundary bersama untuk inspector dan drawer: Tab/Shift+Tab mengabaikan kontrol tersembunyi/inert, menjaga fokus dalam dialog dan menangani kondisi tanpa kontrol. Focus restoration hanya menuju opener yang masih connected dan terlihat.
- Graph sebelumnya memiliki aria-live atomic pada seluruh inspector yang berisi banyak teks/kontrol. Kini pengumuman terpisah hanya menyebut node terpilih dan jumlah koneksi; detail tetap dapat dibaca dan dioperasikan secara normal.
- Skeleton memakai motion-reduce:animate-none. Guard motion Phase 4.6 dipertahankan.
- Tidak mengubah assessment/status atau label DEMO ONLY. Source links tetap aman dan memiliki nama sumber.

Browser menguji Enter pada citation, Shift+Tab dari Close ke link terakhir, Tab kembali ke Close, Escape dan fokus kembali ke citation. Drawer mobile juga menguji wrap Close/Activity dan Escape kembali ke Workspace navigation. Enam tab, filter/navigasi evidence dan graph keyboard End tetap berfungsi.

Belum melakukan audit screen reader, OS reduced-motion toggle, zoom browser 200%, audit contrast menyeluruh atau pengujian lintas browser. Reflow viewport bukan pengganti zoom 200%. Tidak mengklaim sertifikasi accessibility lengkap.

## 3. Performa

buildEvidenceGraph dimemoisasi berdasarkan run, sehingga pemilihan node lokal tidak membangun ulang model graph yang sama. Penulisan sessionStorage dilewati jika payload snapshot identik dengan penulisan terakhir yang berhasil. Kegagalan storage tetap dapat dicoba ulang dan tidak dianggap penulisan berhasil.

Tes membuktikan pembacaan ulang terminal snapshot tidak menambah storage writes. Tidak menambah dependency, polling, animation loop atau listener baru. Pointer/scroll cleanup dan visibility guards lama dipertahankan. Tidak mengklaim besaran peningkatan latency atau memori tanpa benchmark.

Lighthouse/Core Web Vitals tidak diukur dalam fase ini. Pengukuran produksi kuantitatif dan long-duration leak testing masih diperlukan; production build bukan benchmark performa.

## 4. Kontrak API

POST /api/runs memakai JSON question dan parseStartResponse; GET /api/runs/{id} memakai opaque encoded ID, no-store, parseRun dan pemeriksaan ID. Poller sequential dua detik, visibility cancellation dan retry terbatas tetap sama. GET mempunyai caller AbortSignal dan timeout internal; POST belum memiliki caller cancellation dalam interface.

GET /api/health tercantum dalam dokumentasi tetapi belum menjadi method ResearchApi/HttpResearchApi. Tidak menambah method atau mengarang response contract dalam fase ini. Source URL malformed masih ditolak pada validasi payload; SourceLink menangani URL unavailable ketika view menerima data langsung. Nullability URL, Retry-After, retention dan schema sign-off tetap membutuhkan Dev 1.

Backend remote feat/backend telah diketahui pada pemeriksaan sebelumnya; keberadaan schema backend tidak dianggap persetujuan kontrak atau integrasi berhasil. Batas input frontend 10–500 dan backend yang sebelumnya diperiksa 3–1000 perlu disejajarkan bersama. Tidak menjalankan backend atau membaca credentials. UI tetap sengaja mock-only; real failure tidak fallback menjadi mock success.

## 5. Contract tests

contract.test.ts memakai fixture TEST ONLY yang diturunkan dari draft FE, bukan rekaman respons Dev 1. Tambahan mencakup queued/planning/searching/reading/verifying/synthesizing/completed/partial/failed/cancelled, omitted report, partial data dengan missing source/mismatched claim, create → HTTP polling → terminal stop, dan unknown ID tanpa endless retry.

Tes lama malformed JSON/schema, network, timeout, abort, source URL, input, storage recovery/interruption dan mock/real isolation dipertahankan. Focus boundary tests memakai kontrol simulasi minimal, dilengkapi pengujian browser native; bukan pengganti screen reader.

## 6. Hasil otomatis

- Lint: lulus.
- Typecheck: lulus.
- Unit/render tests: 212 lulus / 14 file (192 sebelumnya + 20 tambahan).
- Production build Turbopack: lulus pada salinan source terisolasi dengan dependency lokal, tanpa environment files.
- git diff --check dan staged diff check: diperiksa sebelum commit.

## 7. Browser QA dan regresi demo

Development localhost:3000: input kosong menampilkan error; contoh pertanyaan membuat mock run; keenam tab menampilkan heading yang benar. Report c2 → e2 → source s2 → linked evidence kembali ke c2/e2. Dialog/drawer keyboard dan focus return lulus sebagaimana di atas. Graph End memilih s3, status ringkas berbunyi Source 03 s3 selected, 4 connected nodes; detail tidak lagi aria-live.

Inspector terbuka diperiksa pada 320/375/768/1280. Page clientWidth sama dengan scrollWidth (305/360/753/1265); dialog clientWidth sama dengan scrollWidth (250/305/663/663). Tidak ada horizontal overflow pada alur tersebut.

Server development lama tidak dapat diakses saat mencoba reload; ini membatasi pemeriksaan recovery development pada sesi tersebut. Pengujian dilanjutkan pada production build terisolasi localhost:3001: run mencapai completed, reload memulihkan completed/report dengan label restored dan pertanyaan generik, lalu citation e2 membuka inspector. Console warn/error kosong pada smoke test production. Interrupted storage/polling tetap diuji otomatis, tidak diklaim sebagai uji browser baru. Screenshot disimpan di docs/screenshots/phase-65-inspector.png.

## 8. File

- frontend/src/lib/utils/dialog-focus.ts dan dialog-focus.test.ts (baru).
- frontend/src/lib/api/contract.test.ts (baru).
- frontend/src/components/research/workspace.tsx.
- frontend/src/components/evidence/constellation.tsx.
- frontend/src/components/ui/index.tsx.
- frontend/src/lib/mock/session.ts dan session.test.ts.
- docs/FRONTEND_PHASE_6_5_REPORT.md (laporan ini).
- docs/screenshots/phase-65-inspector.png.

## 9. Risiko tersisa

Storage tetap synchronous dan hanya untuk output fiktif, bukan durable history. Mock session tidak dapat digunakan sebagai hasil riset nyata. Pemilihan tab tidak disimpan di URL. Full accessibility, quantitative performance, public deployment dan live backend integration belum diverifikasi.

## 10. Checklist integrasi FE–BE berikutnya

1. Review OpenAPI/Pydantic serta fixture nyata Dev 1 untuk setiap status/error.
2. Setujui input limits, URL nullability, UTC timestamp, evidence spans, ID/referensi dan partial report semantics.
3. Setujui polling/Retry-After/timeouts, CORS, HTTPS dan retention; keys tetap server-side.
4. Aktifkan real mode dan sesuaikan semua demo/live labels hanya dalam fase integrasi yang diotorisasi.
5. Jalankan start → polling → report → claim → evidence → original source dengan respons nyata, termasuk error/abort.
6. Uji screen reader/reduced motion/zoom 200% dan ukur Lighthouse/Web Vitals pada produksi sebelum rilis.
