import type { ProgramLearning } from "./learning";

export interface ProgramLearningQuizSaleAnswer {
  quiz_id: number;
  selected_option: string;
  is_correct: boolean;
}

export interface ProgramLearningQuizSale {
  id: number;
  program_learning_id: number;
  sales_id: number;
  /** Waktu mulai mengerjakan quiz (ISO string). */
  started_at: string | null;
  program_learning?: ProgramLearning | null;
  sales?: { id: number; name: string; email: string } | null;
  score: number;
  total_questions: number;
  passed: boolean;
  completed_at: string | null;
  answers: ProgramLearningQuizSaleAnswer[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramLearningQuizSaleListResponse {
  data: ProgramLearningQuizSale[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}

export interface SubmitQuizAnswer {
  quiz_id: number;
  selected_option: "A" | "B" | "C" | "D";
}

export interface SubmitQuizPayload {
  program_learning_id: number;
  /** Opsional: pakai user login jika tidak dikirim */
  sales_id?: number;
  /** Opsional: waktu mulai (ISO string) untuk cek batas waktu; wajib jika ada quiz_time_limit_minutes */
  started_at?: string;
  answers: SubmitQuizAnswer[];
}
