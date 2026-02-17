import type { PackageFeature } from "./feature";

export interface Package {
  id: number;
  name: string;
  image: string | null;
  image_avif: string | null;
  image_url: string | null;
  image_avif_url: string | null;
  description: string | null;
  number: number;
  price_month: number;
  price_year: number;
  price_discount_month: number | null;
  price_discount_year: number | null;
  status: boolean | number;
  status_populer: "yes" | "no";
  max_users: number | null;
  max_campaigns: number | null;
  features?: PackageFeature[];
  created_at?: string;
  updated_at?: string;
}

export interface PackageListResponse {
  data: Package[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}

/** Payload for create/update package with optional nested features */
export interface PackageFeatureItem {
  label: string;
  value?: string | null;
  nomor?: number;
}

export type PackageStorePayload = Omit<
  Package,
  "id" | "image" | "image_avif" | "image_url" | "image_avif_url" | "features" | "created_at" | "updated_at"
> & { image?: File | null; features?: PackageFeatureItem[] };
