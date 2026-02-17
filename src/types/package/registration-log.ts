import type { PackageRegistration } from "./registration";

export interface PackageRegistrationLog {
  id: number;
  package_registration_id: number;
  limit_users: number;
  limit_campaigns: number;
  used_users: number;
  used_campaigns: number;
  action: string | null;
  notes: string | null;
  package_registration?: PackageRegistration & {
    package?: { id: number; name: string; max_users?: number; max_campaigns?: number } | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface PackageRegistrationLogListResponse {
  data: PackageRegistrationLog[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}

export interface PackageRegistrationLogStorePayload {
  package_registration_id: number;
  action?: string | null;
  delta_users?: number;
  delta_campaigns?: number;
  notes?: string | null;
}

export interface PackageRegistrationLogUpdatePayload {
  action?: string | null;
  notes?: string | null;
}

export interface PackageRegistrationUsageSummary {
  package_registration_id: number;
  limit_users: number | null;
  limit_campaigns: number | null;
  used_users: number;
  used_campaigns: number;
  logs: PackageRegistrationLog[];
}
