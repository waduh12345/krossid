export interface Sales {
  id: number;
  program_id: number;
  program_name?: string;
  program_sub_title?: string;
  email: string;
  is_corporate: boolean | number;
  status: boolean | number;
  avif?: string | null;
  original?: string | null;
  parameter_value?: string | null;
  total_views?: number;
  total_shares?: number;
  total_registrations?: number;
  status_populer?: "yes" | "no";
  created_at?: string;
  updated_at?: string;
}