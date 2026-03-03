import type { ProgramLearning } from "./learning";

export interface ProgramLearningQuiz {
  id: number;
  program_learning_id: number;
  program_learning?: ProgramLearning | null;
  nomor: number;
  question: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  option_e: string | null;
  question_image: string | null;
  option_a_image: string | null;
  option_b_image: string | null;
  option_c_image: string | null;
  option_d_image: string | null;
  option_e_image: string | null;
  correct_option: "A" | "B" | "C" | "D" | "E";
  status: boolean | number;
  created_at?: string;
  updated_at?: string;
}

/** Response list quiz (dari index) – bisa menyertakan pengaturan quiz dari program_learning */
export interface ProgramLearningQuizListResponse {
  data: ProgramLearningQuiz[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
  /** Waktu pengerjaan (menit). Ada jika request dengan program_learning_id. */
  quiz_time_limit_minutes?: number | null;
  /** Minimum nilai lulus (%). Default 60. Ada jika request dengan program_learning_id. */
  quiz_minimum_score_percent?: number;
}

/** Satu soal quiz (dari show) – menyertakan pengaturan quiz */
export interface ProgramLearningQuizWithSettings extends ProgramLearningQuiz {
  quiz_time_limit_minutes?: number | null;
  quiz_minimum_score_percent?: number;
}
