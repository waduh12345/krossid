export interface PackageFeature {
    id: number;
    package_id: number;
    label: string;
    value: string | null;
    nomor: number;
    package?: { id: number; name: string } | null;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface PackageFeatureListResponse {
    data: PackageFeature[];
    last_page: number;
    current_page: number;
    total: number;
    per_page: number;
  }
  