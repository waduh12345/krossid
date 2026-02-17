import type { ProgramLearningCategory } from "./learning-category";

export interface ProgramLearning {
  id: number;
  program_id: number | null;
  program_learning_category_id: number;
  program?: { id: number; title: string } | null;
  program_learning_category?: ProgramLearningCategory | null;
  nomor: number;
  title: string;
  description: string | null;
  file_pdf: string | null;
  link_youtube: string | null;
  file_video: string | null;
  status: boolean | number;
  /** Waktu pengerjaan quiz (menit). Null = tidak dibatasi. */
  quiz_time_limit_minutes?: number | null;
  /** Minimum nilai lulus (0–100). Null = default 60. */
  quiz_minimum_score_percent?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramLearningListResponse {
  data: ProgramLearning[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}
