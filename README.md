# PORTOID - Personal Profile Website

Sebuah website profil pribadi modern berbasis **React Framework** yang terintegrasi dengan **Backend**, **Database**, dan **Service Worker untuk Push Notification**.

Proyek ini dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, dan **Portoid Design System** untuk memberikan pengalaman antarmuka pengguna yang premium, cepat, dan responsif.

---

## 🚀 Fitur Utama

- **Premium UI/UX**: Tampilan gelap (dark mode) dengan transisi yang halus, efek mask pada kursor, dan tata letak responsif.
- **Backend & Database Integration**: Fitur Buku Tamu (Guestbook) dinamis yang terhubung ke database cloud **Supabase (PostgreSQL)** dengan sistem auto-fallback ke basis data lokal JSON (`db.json`) untuk kemudahan pengujian.
- **Push Notifications & Service Worker**:
  - Mengintegrasikan service worker di background browser untuk menangani event push.
  - Panel pengaturan notifikasi yang memungkinkan pengunjung meminta izin (request permission), melakukan registrasi subscription, dan memicu notifikasi uji coba langsung ke desktop atau perangkat mobile mereka.

---

## 🛠️ Instalasi dan Menjalankan Lokal

1. **Clone repositori**
   ```bash
   git clone https://github.com/Mrmarc-bit/portoid.git
   cd portoid
   ```

2. **Instal dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin berkas `.env.example` menjadi `.env` dan lengkapi nilai-nilainya (jika menggunakan Supabase):
   ```bash
   cp .env.example .env
   ```

4. **Jalankan server pengembangan**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

5. **Uji Coba Fitur**:
   - Navigasi ke menu **Buku Tamu** di navbar.
   - Kirim komentar baru untuk menguji integrasi database.
   - Klik **Aktifkan Notifikasi**, izinkan notifikasi pada browser, lalu klik **Kirim Notifikasi Uji Coba** untuk menguji push notification.

---

## ☁️ Deployment

Untuk deploy ke production (misalnya Vercel):
1. Buat project baru di **Vercel** dan hubungkan dengan repositori GitHub Anda.
2. Tambahkan environment variables berikut di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
3. Deploy! Backend API dan Service Worker akan otomatis berjalan secara dinamis di serverless environment Vercel.