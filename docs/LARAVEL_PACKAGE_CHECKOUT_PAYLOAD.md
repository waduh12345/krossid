# Payload Checkout Package (Laravel API)

Frontend mengirim **satu request** ke backend Laravel untuk alur: daftar → pembayaran → response berisi kredensial (untuk auto login).

## Endpoint

```
POST /package/checkout
Accept: application/json
Authorization: Bearer {token}   // opsional; dikirim jika user sudah login
```

**Dua format request:**

1. **JSON** (tanpa file): `Content-Type: application/json`, body JSON.
2. **Multipart/form-data** (dengan upload bukti pembayaran): `Content-Type: multipart/form-data`, field `proof_file` = file (image/PDF). Semua field lain sebagai form field string.

## Request Body (payload gabungan)

| Field | Type | Required | Keterangan |
|-------|------|----------|------------|
| `name` | string | ya | Nama lengkap |
| `email` | string | ya | Email |
| `phone` | string | ya | No telepon |
| `office` | string | tidak | Nama kantor/perusahaan |
| `address` | string | tidak | Alamat lengkap |
| `user_id` | number \| null | tidak | Jika user sudah login, kirim `user_id`; backend tidak buat user baru |
| `package_id` | number | ya | ID paket yang dipilih |
| `billing_period` | string | ya | `"monthly"` atau `"yearly"` |
| `amount` | number | ya | Jumlah bayar (dari price_month / price_year + diskon) |
| `payment_method` | string | ya | `qris` atau `bank_transfer` (atau nilai lain) |
| `proof_file` | **file** (multipart) atau string | ya (saat upload) | **Upload file** bukti pembayaran (gambar/PDF) atau URL string jika tanpa file |
| `notes` | string \| null | tidak | Catatan |
| `paid_at` | string \| null | tidak | ISO datetime pembayaran |

**Upload file:** Frontend mengirim `proof_file` sebagai file (input type file). Backend Laravel terima via `$request->file('proof_file')`, simpan (storage/disk), lalu simpan path/URL ke kolom `proof_file` di tabel payment.

### Contoh payload (user belum login)

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08123456789",
  "office": "PT Contoh",
  "address": "Jl. Contoh No. 1",
  "package_id": 2,
  "billing_period": "yearly",
  "amount": 999,
  "payment_method": "bank_transfer",
  "proof_file": "https://...",
  "notes": null,
  "paid_at": "2025-02-03T10:00:00.000Z"
}
```

### Contoh payload (user sudah login)

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08123456789",
  "office": "PT Contoh",
  "address": "Jl. Contoh No. 1",
  "user_id": 5,
  "package_id": 2,
  "billing_period": "yearly",
  "amount": 999,
  "payment_method": "bank_transfer",
  "proof_file": null,
  "notes": null,
  "paid_at": "2025-02-03T10:00:00.000Z"
}
```

## Alur backend yang diharapkan

1. **Jika `user_id` dikirim (user sudah login)**  
   - Gunakan user tersebut.  
   - Buat `package_registration` (package_id, user_id, status).  
   - Buat `package_payment` (package_registration_id, amount, payment_method, proof_file, notes, paid_at).  
   - Response **tidak perlu** mengembalikan email/password; frontend akan redirect ke `/my-account`.

2. **Jika `user_id` tidak dikirim (user baru)**  
   - Buat user baru: name, email, phone, office, address; password digenerate oleh backend (atau dari request jika nanti ditambah).  
   - Buat `package_registration`.  
   - Buat `package_payment`.  
   - Response **harus** mengembalikan `email` dan `password` (atau token) agar frontend bisa auto login.

## Response yang diharapkan

### User baru (belum login)

```json
{
  "code": 200,
  "message": "Registrasi dan pembayaran berhasil.",
  "data": {
    "email": "john@example.com",
    "password": "generated_password_dari_backend",
    "registration_id": 1,
    "payment_id": 1
  }
}
```

Frontend akan memanggil `signIn("credentials", { email, password })` lalu redirect ke `/my-account`.

### User sudah login

```json
{
  "code": 200,
  "message": "Pembayaran berhasil.",
  "data": {
    "registration_id": 1,
    "payment_id": 1
  }
}
```

Frontend langsung redirect ke `/my-account`.

### Error

```json
{
  "code": 422,
  "message": "Validation error atau pesan lain.",
  "errors": { ... }
}
```

## Referensi type frontend

- Payload: `@/types/package/checkout` → `PackageCheckoutPayload`
- Response: `@/types/package/checkout` → `PackageCheckoutResponse`
- Service: `@/services/package/checkout.service.ts` → `useSubmitCheckoutMutation`
