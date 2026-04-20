# Setup Guide: Digital Services Payment History Feature

## Overview
Fitur ini memungkinkan user untuk melihat riwayat semua pembayaran top up dan tagihan digital services mereka. Data tersimpan di Supabase sehingga tetap tersimpan meskipun user logout.

## Files Created/Modified

### 1. Database Schema
**File:** `lib/db/digitalTransactions.schema.sql`
- Membuat tabel `digital_transactions` untuk menyimpan riwayat pembayaran
- Fields: id, user_id, service_id, category, service_label, price, nominal_label, payment_method, field_values, status, transaction_notes, created_at, updated_at
- Mengaktifkan Row Level Security (RLS) agar user hanya bisa melihat data mereka sendiri
- Membuat index untuk performa query

### 2. Database Functions
**File:** `lib/db/digitalTransactions.ts`
- `createDigitalTransaction()` - Membuat transaksi baru
- `getUserDigitalTransactions()` - Mengambil daftar transaksi user dengan filter
- `getDigitalTransactionById()` - Mengambil detail transaksi tertentu
- `updateDigitalTransaction()` - Update status transaksi
- `deleteDigitalTransaction()` - Hapus transaksi
- `getDigitalTransactionStats()` - Dapatkan statistik pembayaran user

### 3. API Route
**File:** `app/api/digital-transactions/route.ts`
- GET endpoint untuk mengambil riwayat transaksi user
- POST endpoint untuk membuat transaksi baru
- Validasi user authentication

### 4. History Page
**File:** `app/(main)/user/history/page.tsx`
- Halaman untuk menampilkan riwayat pembayaran digital services
- Filter berdasarkan kategori (semua, top up, tagihan)
- Tampilkan statistik: total pengeluaran, jumlah top up, jumlah pembayaran tagihan
- Tampilkan detail transaksi lengkap

### 5. Modified Files
**File:** `app/(main)/payment/digital/page.tsx`
- Menambahkan import `useAuthStore`
- Modifikasi `confirmPayment()` untuk menyimpan transaksi ke Supabase saat pembayaran selesai
- Tetap memberikan pengalaman yang baik bahkan jika penyimpanan database gagal

**File:** `components/ui/modals/UserAccountModal.tsx`
- Menambahkan menu item "History Top Up & Tagihan"
- Link ke halaman `/user/history`

## Setup Instructions

### Step 1: Setup Supabase Schema
1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Copy konten dari `lib/db/digitalTransactions.schema.sql`
4. Jalankan SQL query tersebut
5. Verify bahwa tabel `digital_transactions` dan policies sudah terbuat

### Step 2: Verify Configuration
- Pastikan client Supabase sudah dikonfigurasi dengan benar di `utils/supabase/client.ts`
- Pastikan server Supabase client tersedia di `utils/supabase/server.ts`

### Step 3: Test Feature
1. Login ke aplikasi
2. Pilih layanan top up atau tagihan di halaman utama
3. Isi form dan lanjut ke pembayaran
4. Confirm pembayaran
5. Cek apakah transaksi berhasil tersimpan dengan pergi ke `/user/history`
6. Logout dan login kembali untuk verify bahwa data tetap ada

## Features

### For Users
- ✅ Lihat semua riwayat pembayaran top up dan tagihan
- ✅ Filter berdasarkan kategori (top up/tagihan)
- ✅ Lihat statistik pembayaran (total, jumlah transaksi)
- ✅ Detail transaksi lengkap (nomor, nominal, metode pembayaran, tanggal)
- ✅ Data tetap tersimpan setelah logout

### For Developers
- ✅ Database functions yang mudah digunakan
- ✅ API endpoints terpisah untuk digital transactions
- ✅ Type-safe dengan TypeScript interfaces
- ✅ Query optimization dengan indexes
- ✅ Row Level Security untuk privacy user

## Future Enhancements

### Possible Improvements
1. **Export to PDF/CSV** - Fitur untuk export riwayat pembayaran
2. **Advanced Filters** - Filter berdasarkan tanggal range, nominal, metode pembayaran
3. **Transaction Details Modal** - Modal untuk melihat detail transaksi
4. **Refund/Return** - Fitur untuk request refund
5. **Statistics Dashboard** - Dashboard dengan grafik pengeluaran
6. **Search** - Cari transaksi berdasarkan nomor atau nominal
7. **Notifications** - Notifikasi untuk setiap transaksi
8. **Receipt** - Generate dan kirim receipt via email

## Database Structure

```sql
-- digital_transactions table
- id (UUID, PK)
- user_id (UUID, FK to profiles)
- service_id (VARCHAR) - ID layanan (e.g., 'pulsa', 'paket-data')
- category (VARCHAR) - 'topup' atau 'tagihan'
- service_label (VARCHAR) - Label layanan (e.g., 'Pulsa', 'Token Listrik')
- price (INTEGER) - Harga dalam rupiah
- nominal_label (VARCHAR) - Label nominal (e.g., 'Rp 50.000')
- payment_method (VARCHAR) - Metode pembayaran
- field_values (JSONB) - Data form yang diisi user
- status (VARCHAR) - 'pending', 'completed', 'failed', 'cancelled'
- transaction_notes (TEXT) - Catatan tambahan
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

-- Indexes
- idx_digital_transactions_user_id
- idx_digital_transactions_category
- idx_digital_transactions_created_at
- idx_digital_transactions_user_created

-- Row Level Security Policies
- Users hanya bisa melihat transaksi mereka sendiri
```

## Notes

- Transaksi disimpan otomatis saat user confirm pembayaran di halaman `/payment/digital`
- Jika penyimpanan ke database gagal, user tetap diarahkan ke halaman utama (tidak mengganggu UX)
- Error saat penyimpanan database hanya di-log di console, tidak ditampilkan ke user
- Halaman history bisa diakses tanpa login tapi akan menampilkan pesan untuk login
- Data disimpan dengan user_id sehingga setiap user hanya bisa melihat transaksi mereka sendiri

## API Endpoints

### GET /api/digital-transactions
Mengambil riwayat transaksi user

**Query Parameters:**
- `category` (optional) - Filter kategori: 'topup' atau 'tagihan'
- `status` (optional) - Filter status: 'pending', 'completed', 'failed', 'cancelled'
- `limit` (optional, default: 10) - Jumlah data per halaman
- `offset` (optional, default: 0) - Offset pagination

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "service_id": "pulsa",
      "category": "topup",
      "service_label": "Pulsa",
      "price": 50000,
      "nominal_label": "Rp 50.000",
      "payment_method": "qris",
      "field_values": {
        "phoneNumber": "081234567890"
      },
      "status": "completed",
      "created_at": "2024-04-20T10:30:00Z",
      "updated_at": "2024-04-20T10:30:00Z"
    }
  ],
  "count": 5,
  "message": "Digital transactions fetched successfully"
}
```

### POST /api/digital-transactions
Membuat transaksi baru

**Request Body:**
```json
{
  "serviceId": "pulsa",
  "category": "topup",
  "serviceLabel": "Pulsa",
  "price": 50000,
  "nominalLabel": "Rp 50.000",
  "paymentMethod": "qris",
  "fieldValues": {
    "phoneNumber": "081234567890"
  },
  "status": "completed"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "service_id": "pulsa",
    "category": "topup",
    "service_label": "Pulsa",
    "price": 50000,
    "nominal_label": "Rp 50.000",
    "payment_method": "qris",
    "field_values": {
      "phoneNumber": "081234567890"
    },
    "status": "completed",
    "created_at": "2024-04-20T10:30:00Z",
    "updated_at": "2024-04-20T10:30:00Z"
  },
  "message": "Digital transaction created successfully"
}
```

## Troubleshooting

### Error: "new row violates row-level security policy"
**Penyebab:** RLS policy belum terupdate dengan benar atau tidak cocok dengan auth context.

**Solusi:**
1. Buka Supabase SQL Editor
2. Copy script dari `lib/db/digitalTransactions.fix-rls.sql`
3. Jalankan di SQL Editor
4. Tunggu sebentar dan coba lagi

Atau run ulang seluruh schema:
1. Copy konten `lib/db/digitalTransactions.schema.sql`
2. Buka Supabase SQL Editor
3. Jalankan query

**Verifikasi RLS Policy:**
```
-- Di Supabase SQL Editor, run:
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'digital_transactions';
```

### Transaksi tidak tersimpan
- Check console browser untuk error messages
- Verify user sudah authenticated (check useAuthStore)
- Verify Supabase URL dan publishable key di .env
- Check network tab untuk API response

### History page blank tapi tidak ada error
- Verify user sudah login
- Check Supabase dashboard apakah ada data di tabel `digital_transactions`
- Verify user_id di database cocok dengan auth.uid()
- Check browser localStorage untuk auth token

### API returns 401 Unauthorized
- Verify user sudah login (cek useAuthStore)
- Check session cookies di browser
- Logout dan login kembali
