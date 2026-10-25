# Phase 6.6 — Product-first UX restructure

25 Oktober 2026. Implementasi lokal pada feat/frontend, baseline 16bcd81 (checkpoint perbaikan setelah Phase 6.5 f1b2ce0). Tidak melakukan commit, push, merge atau pergantian branch.

## Perjalanan pengguna

Sebelumnya / menampilkan hero besar, kemudian input dan rangkaian penjelasan panjang. Sekarang / langsung menampilkan headline ringkas, input, Start Research, contoh pertanyaan dan penjelasan singkat. /about menyimpan pengalaman editorial dan demonstrasi interaktif. Logo dan Research menuju /; About tersedia di homepage maupun workspace. Link Start researching pada hero About menuju /#research-question.

## Route dan komponen

- /: ResearchInput yang sama; controller submission, validasi, payload question, encoded run URL dan proteksi duplikasi dipertahankan.
- /about: Hero, EvidenceConstellation, HowItWorks, EvidencePreview, Features dan Footer dipakai ulang. Penjelasan produk, tiga support labels, metodologi dan limitations ditambahkan. Seluruh contoh tetap DEMO ONLY.
- /research/[id]: route dan enam tab dipertahankan, termasuk ClaimInspector, source attribution, dialog/drawer, polling dan session recovery.
- /dev/evidence: tidak diubah.

## Adapter dan integrasi

ResearchInput dan useResearchRun memakai factory getResearchApi yang sudah ada. Mock tetap memakai sessionStorage dan UUID/LAN fallback. Real memakai HttpResearchApi tanpa fallback ke mock atau demo persistence. Label workspace mengikuti data mode. DemoDataContext membedakan contoh About/QA dari workspace backend; tidak mengubah field domain, status atau kontrak wire. Teks evidence dari adapter tidak diubah/dihapus untuk mengganti label.

Real-mode wiring diuji dengan kegagalan fetch terkontrol; tidak menjalankan backend, membaca environment/secret, atau mengklaim integrasi live. Batas input 10–500 dan kontrak masih memerlukan persetujuan Dev 1. Lihat INTEGRATION_READINESS.md.

## File

Baru: frontend/src/app/about/page.tsx, frontend/src/app/product.css, frontend/src/components/landing/product-home.test.tsx, frontend/src/components/research/data-context.tsx, frontend/src/lib/api/data-mode.ts, laporan ini.

Diubah: app/page.tsx dan globals.css; landing/navigation.tsx, hero.tsx dan research-input.tsx; research/workspace.tsx dan views.tsx; evidence/claim-inspector.tsx dan constellation.tsx; hooks/use-research-run.ts; lib/landing/research-submission.ts; docs/INTEGRATION_READINESS.md.

Tidak menambah library. Backend dan environment tidak diubah/dibaca. frontend/next-env.d.ts dan package-lock.json tidak diubah, di-stage, di-restore atau dihapus. Hash tetap B8B3A344484B959AF5E4E3FC1A1609DAC3CB9ECE0CDEB6C145BE29BC4C491000 dan 667F0B4BF75620B4EEC168899246DFAD8D445BCE1014E09DBE1651777CABAE0C. Perubahan next-env lama serta backend/ lokal tetap ada.

## Pengujian

Lint dan typecheck lulus. Full suite: 224 tests / 17 files lulus. Lima tes baru memeriksa homepage research-first, navigasi dua arah, pemisahan label UI demo/real, kegagalan submit HTTP tanpa fallback dan copy homepage real. Tes lama mencakup validasi kosong/batas, payload, URL encoding, duplikasi, error recovery, persistensi dan keyboard helpers.

Production build Next.js Turbopack dilakukan pada salinan terisolasi tanpa environment dengan dependency lokal; / dan /about menjadi static routes, /research/[id] tetap dynamic. git diff --check lulus. Build asli tidak dijalankan agar next-env.d.ts terlindungi.

## Browser QA

Di http://192.168.56.1:3000:

- Submit kosong menampilkan Start with a research question. Contoh Efficient language models lalu Start Research membuka /research/demo-mvnx2a11-1-d14q70ip.
- Keenam tab dibuka dan heading cocok. Enter pada citation e2/c2 membuka inspector dengan excerpt/source s2; Escape menutup dialog.
- About dari workspace dan Research dari About berhasil. Flow 02 menampilkan pasangan c2/e2/s2; tab Read menjadi aktif setelah diklik.
- Homepage dan About pada 320/375/768/1280: clientWidth sama dengan scrollWidth, yaitu 305/360/753/1265. Input homepage terlihat, posisi bawah CTA pada tinggi viewport 740 sekitar 580/547/581/605 px. Pengukuran dilakukan pada posisi halaman atas.
- Guard prefers-reduced-motion, native button semantics, focus indicators dan dialog helpers lama dipertahankan.

Screenshot browser gagal dengan pesan Unable to capture screenshot; verifikasi ini memakai interaksi dan pengukuran DOM, bukan klaim screenshot visual selesai. Belum menguji back/forward browser secara manual, reload deep link baru pada deployment publik, screen reader, zoom 200%, toggle OS reduced motion atau lintas browser. Scroll storytelling memakai implementasi perbaikan sebelumnya; pada fase ini diuji tombol Read, bukan seluruh traversal scroll ulang.

## Risiko tersisa dan cara mencoba

Jalankan npm.cmd --prefix frontend run dev. Buka /, pilih contoh, Start Research, periksa report dan evidence. Buka /about untuk flow constellation dan storytelling. Real mode memerlukan konfigurasi backend yang disepakati; belum ada bukti live end-to-end. Tidak mengaktifkan auth/history atau fitur Phase 7. Perubahan siap direview lokal dengan batas QA di atas.
