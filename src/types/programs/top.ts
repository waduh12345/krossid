import type { Programs } from "./programs";

export interface TopProgram {
  id: number;
  program_id: number;
  order: number;
  status: number | boolean;
  created_at: string;
  updated_at: string;
  program?: Programs;
}

export interface TopProgramResponse {
  data: TopProgram[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}

export interface CreateTopProgramPayload {
  program_id: number;
  order: number;
  status: number | boolean;
}

export interface UpdateTopProgramPayload {
  program_id: number;
  order: number;
  status: number | boolean;
}
