# **CITEZY** 

Panduan Git Branch + Workflow Harian + Prompt Codex 

Untuk Developer 1 (AI/Backend) dan Developer 2 (Frontend). Edisi 24 Oktober 2026. 

Konteks: Phase 0-2 frontend sudah di-push. Panduan ini tidak menganggap PR sudah di-merge; cek status Git terlebih dahulu. 

## **1. Peta branch: fungsi dan kapan digunakan** 

main  (versi stabil untuk juri) 

| +-- dev  (integrasi dan staging) | +-- feat/frontend  (Dev 2) 

+-- feat/backend   (Dev 1) 

|Branch|Kegunaan|Boleh coding langsung?|
|---|---|---|
|main|Versi stabil; untuk demo/submission.|Tidak. Masuk lewat PR<br>dari dev.|
|dev|Menggabungkan FE dan BE; tes integrasi.|Hindari. Masuk lewat PR<br>fitur.|
|feat/frontend|Area kerja Dev 2: UI, mock, integrasi FE.|Ya.|
|feat/backend|Area kerja Dev 1: FastAPI, Nemotron, Tavily.|Ya.|



Catatan: branch bukan folder atau server. Branch dev baru menjadi lingkungan staging jika aplikasinya dijalankan atau di-deploy dari branch tersebut. 

## **2. Sebelum mulai ngoding setiap hari** 

### **Dev 2 (frontend)** 

git status -sb git fetch origin git switch feat/frontend git merge origin/dev git status -sb 

Arti: status memeriksa perubahan lokal; fetch mengambil informasi terbaru; switch memilih branch kerja; merge membawa update yang sudah masuk ke dev. Pastikan working tree bersih sebelum switch/merge. Jika muncul konflik, selesaikan dulu; jangan reset --hard. 

### **Dev 1 (backend)** 

git status -sb git fetch origin git switch feat/backend git merge origin/dev git status -sb 

Jika feat/backend belum dibuat, ikuti bagian 3. Jangan menjalankan perintah di atas pada branch yang belum ada. 

Citezy | Panduan kolaborasi Dev 1 & Dev 2 

1 

## **3. Setup awal branch (sekali saja)** 

### **Dev 2: jika dev belum ada** 

git fetch origin git branch -a git switch main git pull --ff-only origin main git switch -c dev git push -u origin dev 

Lakukan hanya jika origin/dev memang belum ada dan working tree bersih. Jika sudah ada, jangan buat ulang: git switch --track origin/dev (jika belum ada lokal). Pastikan kode Phase 0-2 tetap di branch tempat ia di-push; jangan memindahkannya dengan reset. 

### **Dev 1: buat feat/backend dari dev terbaru** 

git fetch origin git switch --track origin/dev   # jika dev belum ada lokal git pull --ff-only origin dev git switch -c feat/backend git push -u origin feat/backend 

Jika dev sudah ada lokal, gunakan git switch dev, lalu git pull --ff-only origin dev. Jika feat/backend sudah ada, switch ke branch tersebut dan jangan buat ulang. 

## **4. Setelah selesai ngoding: simpan, uji, push, PR** 

### **Langkah yang dilakukan masing-masing developer** 

git status # Jalankan test sesuai bagian proyek git add <file-atau-folder-yang-memang-diubah> git diff --cached git commit -m "feat(frontend): implement phase 3" git push -u origin feat/frontend 

Dev 1 mengganti nama branch dan pesan commit, misalnya feat(backend): add research endpoints. Jangan git add . secara membabi buta: cek agar .env, API key, node_modules, dan file rahasia tidak ikut. 

Buat Pull Request (PR) di GitHub: base = dev, compare = branch fitur. PR adalah permintaan agar perubahan ditinjau dan digabung. Rekan memeriksa perubahan dan hasil tes. Setelah lulus, merge PR ke dev. Jangan merge ke main langsung. 

### **Sesudah PR di-merge** 

git fetch origin git switch feat/frontend git merge origin/dev # lanjut pekerjaan berikutnya pada branch fitur 

Dev 1 menggunakan feat/backend. Jika branch fitur jangka panjang ini sudah punya commit berikutnya, cek perbedaan PR berikutnya dengan teliti agar tidak mengulang perubahan. 

## **5. Alur khusus posisi kalian sekarang (Phase 0-2 sudah push)** 

1) Dev 2 memeriksa origin/feat/frontend dan origin/dev; jalankan lint, typecheck, tests, build jika script tersedia. 2) Dev 2 buat PR feat/frontend -> dev. 3) Dev 1 review docs/API_HANDOFF.md dan kontrak JSON. 4) Merge jika aman. 5) Dev 1 membuat feat/backend dari dev terbaru. 6) Dev 2 lanjut Phase 3 di feat/frontend. 7) Setiap milestone dibuat PR ke dev. 8) Setelah FE+BE lolos uji integrasi, PR dev -> main 

Citezy | Panduan kolaborasi Dev 1 & Dev 2 

2 

untuk demo. 

## **6. Jika ada error atau konflik** 

|Masalah|Tindakan aman|
|---|---|
|Perubahan lokal belum disimpan|Commit dulu atau git stash push -u (lalu stash pop dengan hati-hati).|
|Branch tidak ditemukan|git fetch origin; git branch -a; jangan membuat ulang tanpa cek.|
|Push ditolak (non-fast-forward)|git fetch origin; tinjau perubahan; merge branch remote yang relevan;<br>push ulang.|
|Merge conflict|git status; buka file bertanda konflik; selesaikan; git add; git commit jika<br>diperlukan.|
|PR konflik|Update branch fitur dengan origin/dev, selesaikan lokal, jalankan test,<br>push.|
|Tidak sengaja berada di main|Jangan commit; periksa git status dan pindah dengan aman setelah<br>perubahan disimpan.|



## **7. Prompt Codex Dev 2 — audit branch + persiapan PR** 

Salin teks di bawah ke Codex pada repository Citezy: 

Saya Dev 2 Citezy. Phase 0-2 frontend sudah di-push. Periksa git status -sb, git branch -a, git remote -v, dan perbedaan origin/feat/frontend terhadap origin/dev. Jelaskan fungsi main, dev, dan feat/frontend. Jika dev belum ada, usulkan langkah aman untuk membuatnya dari main; jangan lakukan bila ada risiko kehilangan kode. Baca docs/FE.md, docs/MASTER_SPEC.md, docs/API_HANDOFF.md. Jalankan lint, typecheck, test, build jika tersedia. Siapkan judul/deskripsi PR feat/frontend -> dev. JANGAN merge, force-push, reset --hard, atau mengubah main. JANGAN commit/push tanpa izin saya. Laporkan hasil dan langkah berikutnya dalam bahasa Indonesia. 

## **8. Prompt Codex Dev 1 — buat branch backend** 

Saya Dev 1 Citezy, bertanggung jawab atas AI dan backend. Periksa Git repository, working tree, branch lokal/remote. Pastikan origin/dev tersedia dan terbaru. Jika feat/backend belum ada, buat dari dev terbaru dan push dengan upstream. Jika sudah ada, gunakan branch itu. Jangan menyentuh main, feat/frontend, atau menghapus kode. Baca docs/MASTER_SPEC.md dan docs/API_HANDOFF.md. Jelaskan kegunaan tiap branch dan cara kerja PR ke dev. Jangan implementasikan backend dulu. Berikan laporan dalam bahasa Indonesia dan hentikan proses bila ada risiko kehilangan perubahan. 

## **9. Prompt Codex harian (dipakai sebelum coding)** 

Saya akan mulai coding sebagai [Dev 1 / Dev 2]. 

Citezy | Panduan kolaborasi Dev 1 & Dev 2 

3 

Periksa Git status dan branch aktif; pastikan saya berada di feat/backend (Dev 1) atau feat/frontend (Dev 2). Ambil update origin/dev secara aman tanpa membuang kerja. Baca dokumen tugas yang relevan, ringkas target hari ini, lalu tunggu konfirmasi sebelum perubahan besar. Jangan push/merge/force-push otomatis. 

## **10. Prompt Codex setelah coding (dipakai sebelum push)** 

Saya baru selesai coding. Periksa perubahan dan file rahasia. Jalankan lint, typecheck, tests, dan build yang tersedia. Tunjukkan file berubah, hasil tes, dan potensi masalah. Usulkan commit message serta PR menuju dev. Jangan commit/push/merge sampai saya menyetujui. 

## **11. Checklist sebelum PR dan sebelum main** 

Sebelum PR ke dev: branch fitur benar; tidak ada secret; tests yang tersedia lulus; kontrak API tidak berubah diam-diam; PR menjelaskan apa yang diuji dan apa yang belum. 

Sebelum merge dev ke main: FE+BE benar-benar terhubung; mode mock tidak menyamar sebagai AI nyata; Nemotron dan Tavily runtime call diuji; tidak ada error kritis; deployment publik berfungsi; README dan demo siap. 

Aturan tim: setiap PR direview oleh rekan, terutama perubahan kontrak FE-BE. Main dijaga stabil; dev untuk integrasi; branch fitur untuk coding. Hindari force push dan reset --hard saat belajar Git. 

Citezy | Panduan kolaborasi Dev 1 & Dev 2 

4 

