# Panduan Fix RLS Policy Error untuk Digital Transactions

## Error yang Anda Alami
```
Error: new row violates row-level security policy for table "digital_transactions"
```

## Penyebab
RLS (Row Level Security) policy di Supabase tidak cocok dengan cara aplikasi mengakses database. Database function menggunakan client-side Supabase yang tidak punya auth context yang tepat.

## Solusi Permanen (Sudah Diimplementasikan)

### 1. Update Database Functions
File `lib/db/digitalTransactions.ts` sudah diupdate untuk:
- Accept `SupabaseClient` sebagai parameter pertama
- Menggunakan server-side authenticated client yang proper
- Pastikan `auth.uid()` dapat diakses dengan benar di RLS policy

### 2. Update API Route
File `app/api/digital-transactions/route.ts` sudah diupdate untuk:
- Menggunakan `await createClient()` dari server-side
- Mendapatkan authenticated user dengan `supabase.auth.getUser()`
- Melewatkan supabase client ke semua database functions

### 3. Update RLS Policy
File `lib/db/digitalTransactions.schema.sql` sudah diupdate dengan:
- Policy yang lebih sederhana dan robust
- Drop existing policies untuk menghindari conflict

## Langkah-Langkah untuk Fix

### Step 1: Update RLS Policy di Supabase
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka **SQL Editor**
4. Klik **New Query**
5. Copy-paste script berikut:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can insert their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can update their own digital transactions" ON digital_transactions;
DROP POLICY IF EXISTS "Users can delete their own digital transactions" ON digital_transactions;

-- Create new policies
CREATE POLICY "Users can view their own digital transactions"
  ON digital_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own digital transactions"
  ON digital_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own digital transactions"
  ON digital_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own digital transactions"
  ON digital_transactions FOR DELETE
  USING (auth.uid() = user_id);
```

6. Click **Run** (tombol panah di kanan atas)
7. Tunggu sebentar sampai selesai

### Step 2: Verify RLS Policies
Jalankan query ini untuk verify policies sudah terupdate:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename = 'digital_transactions'
ORDER BY policyname;
```

Harusnya muncul 4 policies:
- Users can view their own digital transactions
- Users can insert their own digital transactions
- Users can update their own digital transactions
- Users can delete their own digital transactions

### Step 3: Restart Next.js Development Server
```bash
# Stop server (Ctrl+C)
# Kemudian start ulang:
npm run dev
```

### Step 4: Test Feature
1. Login ke aplikasi
2. Pilih layanan Top Up atau Tagihan
3. Isi form dan lanjut ke pembayaran
4. Klik **Konfirmasi Pembayaran**
5. Tunggu loading selesai

### Step 5: Verify Data Tersimpan
Cek apakah data sudah tersimpan dengan:

1. **Di aplikasi:**
   - Buka menu akun (klik nama di navbar)
   - Pilih "History Top Up & Tagihan"
   - Seharusnya bisa lihat transaksi yang baru dibuat

2. **Di Supabase Dashboard:**
   - Buka **Table Editor**
   - Pilih table `digital_transactions`
   - Seharusnya ada baris data baru dengan user_id Anda

## Verifikasi di Console
Buka browser console (F12 → Console) saat test, seharusnya:
- ✅ Tidak ada error saat confirm pembayaran
- ✅ Response 201 Created dari `/api/digital-transactions`
- ✅ Data transaksi terlihat di history page

## Troubleshooting Lanjutan

### Masih error setelah ikuti langkah di atas?
1. **Verify auth token:**
   ```javascript
   // Buka console, jalankan:
   const auth = useAuthStore.getState();
   console.log('User ID:', auth.user?.id);
   console.log('Session:', auth.session);
   ```

2. **Check Supabase configuration:**
   - Verify `.env.local` punya `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Verify profile sudah ada di `profiles` table untuk user Anda

3. **Check RLS table status:**
   ```sql
   -- Verify RLS enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'digital_transactions';
   
   -- Harusnya rowsecurity = true
   ```

### Data masih tidak muncul di history?
- Refresh page (Ctrl+F5)
- Logout dan login ulang
- Check network tab untuk API response dari `/api/digital-transactions`

## Timeline Proses

1. User confirm pembayaran → API call ke `/api/digital-transactions` (POST)
2. API route verify auth → dapatkan user.id dari server-side auth
3. Call `createDigitalTransaction(supabase, user.id, payload)`
4. Database insert dengan RLS check: `user_id = auth.uid()`
5. Return success → redirect ke homepage
6. User buka history → API call `/api/digital-transactions` (GET)
7. Database query dengan RLS check: return hanya transaksi milik user

## Files yang Sudah Diupdate

1. ✅ `lib/db/digitalTransactions.ts` - Add supabase client parameter
2. ✅ `lib/db/digitalTransactions.schema.sql` - Update RLS policy
3. ✅ `app/api/digital-transactions/route.ts` - Pass supabase client ke functions
4. ✅ `lib/db/digitalTransactions.fix-rls.sql` - RLS policy fix script

## Next Steps

Setelah semuanya berfungsi:
1. Test transaksi multiple user untuk verify isolation bekerja
2. Test logout/login untuk verify data persistence
3. Commit changes ke git
4. Deploy ke production

## Questions?

Jika masih ada masalah:
1. Check error message di console
2. Verify user sudah authenticated
3. Verify RLS policies sudah update
4. Verify `.env` configuration benar
5. Restart server
