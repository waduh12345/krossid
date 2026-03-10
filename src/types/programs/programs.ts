export interface ProgramMateri {
  id?: number;
  program_id?: number;
  file_pdf?: string; // URL from API
  level: number[];
  soal_quiz?: number;
}

export interface Programs {
  id: number;
  program_category_id: number;
  program_category_name?: string;
  owner_id: number;
  owner_name?: string;
  owner_email?: string;
  total_user_register?: number;
  title: string;
  sub_title: string | null;
  slug: string;
  description: string | null;
  parameter: string | null;
  image: File | string | null;
  status: boolean | number;
  original?: string; // URL original image
  avif?: string; // URL avif image
  commission?: number; // Commission percentage
  nominal?: number; // Fixed commission amount
  value_description?: string;
  guide_description?: string;
  benefit_description?: string;
  visits_count?: number;
  shares_count?: number;
  likes_count?: number;
  owner_active_from?: string | null;
  owner_active_until?: string | null;
  owner_type_package?: "Learning Only" | "Learning + Affiliate" | null;
  materis?: ProgramMateri[];
}

export interface TopPrograms {
  id: number;
  order: number;
  status: number;
  programs: Programs;
}

/* ── Materi Detail API Types ── */

export interface MateriListItem {
  id: number;
  program_id: number;
  file_pdf: string;
  file_pdf_url: string;
  soal_quiz: number;
  level: number[];
  status: boolean;
  quizzes_count: number;
}

export interface QuizSummary {
  level: number;
  total_soal: number;
}

export interface MateriDetail extends MateriListItem {
  quiz_summary: QuizSummary[];
}

export interface MateriQuizItem {
  id: number;
  program_materi_id: number;
  level: number;
  nomor: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation_a: string;
  explanation_b: string;
  explanation_c: string;
  explanation_d: string;
  status: boolean;
}

export interface MateriQuizListResponse {
  data: MateriQuizItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}