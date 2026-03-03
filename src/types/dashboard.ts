export interface DashboardAdmin {
  total_students: number; // total Siswa
  total_tests: number; // total ujian
  total_lms: number; // total lms
  total_subject: number; // total Sub Mata Pelajaran
}

// Monthly User Growth
export interface MonthlyUserGrowth {
  month: number;
  total_owners: number;
  total_sales: number;
  total_users: number;
}

// Top Program Performance
export interface ProgramPerformance {
  month: number;
  registrations: number;
  shares: number;
  views: number | string;
}

export interface TopProgram {
  id: number;
  program_category_id: number;
  owner_id: number;
  title: string;
  sub_title: string | null;
  slug: string;
  description: string;
  parameter: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  commission: number;
  nominal: number;
  value: string | null;
  promotion: string | null;
  benefit: string | null;
  visits_count: string | number;
  likes_count: string | number;
  performance: ProgramPerformance[];
}

export interface TopProgramsResponse {
  [key: string]: TopProgram;
}

// Top Sales
export interface TopSale {
  id: number;
  name: string;
  email: string;
  phone: string;
  email_verified_at: string | null;
  two_factor_confirmed_at: string | null;
  referral: string;
  is_corporate: boolean;
  status: number;
  created_at: string | null;
  updated_at: string | null;
  tipe_owner_id: number | null;
  program_registrations_count: number;
  program_shares_count: number;
}

// List Program Views
export interface ProgramViewItem {
  id: number;
  program_id: number;
  program_title: string;
  program_slug: string;
  views: number;
  ip: string;
  user_agent: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  created_at: string;
}

export interface ProgramViewsListParams {
  program_id?: number;
  from?: string;
  to?: string;
  search?: string;
  paginate?: number;
  page?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface ProgramViewsListResponse {
  data: ProgramViewItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// List Program Shares
export interface ProgramShareItem {
  id: number;
  program_id: number;
  program_title: string;
  program_slug: string;
  shared_by: number;
  shared_by_name: string;
  shared_by_email: string;
  shared_to: string;
  share_count: number;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface ProgramSharesListParams {
  program_id?: number;
  from?: string;
  to?: string;
  search?: string;
  paginate?: number;
  page?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface ProgramSharesListResponse {
  data: ProgramShareItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// List Program Registrations
export interface ProgramRegistrationItem {
  id: number;
  program_id: number;
  program_title: string;
  program_slug: string;
  sales_id: number | null;
  sales_name: string | null;
  sales_email: string | null;
  name: string;
  email: string;
  phone: string;
  parameter_value: string | null;
  status: number;
  created_at: string;
}

export interface ProgramRegistrationsListParams {
  program_id?: number;
  sales_id?: number;
  from?: string;
  to?: string;
  search?: string;
  paginate?: number;
  page?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}

export interface ProgramRegistrationsListResponse {
  data: ProgramRegistrationItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
