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
