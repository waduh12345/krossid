/** Minimal package shape from API relation */
export interface PackageRegistrationPackage {
    id: number;
    name: string;
    max_users?: number | null;
    max_campaigns?: number | null;
  }
  
  /** Minimal user shape from API relation */
  export interface PackageRegistrationUser {
    id: number;
    name?: string;
    email?: string;
    phone?: string | null;
    office?: string | null;
    address?: string | null;
  }
  
  export interface PackageRegistration {
    id: number;
    package_id: number;
    user_id: number | null;
    status: boolean | number;
    billing_period?: string | null;
    active_from?: string | null;
    active_until?: string | null;
    used_users: number;
    used_campaigns: number;
    package?: PackageRegistrationPackage | null;
    user?: PackageRegistrationUser | null;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PackageRegistrationListResponse {
    data: PackageRegistration[];
    last_page: number;
    current_page: number;
    total: number;
    per_page: number;
  }
  
  export type PackageRegistrationStorePayload = Pick<
    PackageRegistration,
    "package_id" | "user_id" | "status"
  >;
  