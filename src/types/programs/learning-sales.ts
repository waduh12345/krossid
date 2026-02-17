import type { ProgramLearning } from "./learning";

export interface ProgramLearningSale {
  id: number;
  program_learning_id: number;
  sales_id: number;
  program_learning?: ProgramLearning | null;
  sales?: { id: number; name: string; email: string } | null;
  started_at: string | null;
  completed_at: string | null;
  status: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramLearningSaleListResponse {
  data: ProgramLearningSale[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}
