/**
 * Payload gabungan untuk kirim ke API Laravel (satu request).
 * Endpoint: POST /package/checkout
 *
 * Alur backend Laravel:
 * 1. Jika user_id dikirim (user sudah login): pakai user tersebut, update profil.
 * 2. Jika tidak: buat user baru (name, email, phone, office, address, password digenerate backend).
 * 3. Buat package_registration (package_id, user_id, status, billing_period).
 * 4. Buat package_payment (package_registration_id, amount, payment_method, proof_file, notes, paid_at).
 * 5. Response kembalikan email + password (untuk user baru) + token agar frontend bisa auto login.
 */
export interface PackageCheckoutPayload {
  /** Data formulir daftar */
  name: string;
  email: string;
  phone: string;
  office: string;
  address: string;

  /** Jika user sudah login, kirim user_id (backend pakai user ini, tidak buat user baru) */
  user_id?: number | null;

  /** Paket yang dipilih */
  package_id: number;
  /** monthly | yearly */
  billing_period: "monthly" | "yearly";
  /** Jumlah bayar (bisa dari price_month/price_year + diskon) */
  amount: number;

  /** Data pembayaran */
  payment_method: string | null;
  /** URL bukti (setelah upload) atau File untuk upload langsung di request */
  proof_file: string | null;
  notes: string | null;
  paid_at: string | null;
}

/**
 * Payload checkout yang bisa dikirim dengan file (FormData).
 * Jika proof_file berupa File, request dikirim sebagai multipart/form-data.
 */
export type PackageCheckoutPayloadWithFile = Omit<
  PackageCheckoutPayload,
  "proof_file"
> & { proof_file?: File | string | null };

/**
 * Response API checkout.
 * Jika user baru: backend mengembalikan email + password + token agar frontend bisa simpan token lalu redirect /my-account.
 * Jika user sudah login: token + message/success, frontend redirect /my-account.
 */
export interface PackageCheckoutResponse {
  code?: number;
  message?: string;
  data?: {
    email?: string;
    password?: string;
    token?: string;
    registration_id?: number;
    payment_id?: number;
  };
}
