/** Ganti dengan: import type { Programs } from "@/types/programs/programs"; */
export interface ProgramLearningCategory {
    id: number;
    program_id: number | null;
    program?: { id: number; title: string } | null;
    title: string;
    description: string | null;
    nomor: number;
    status: boolean | number;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface ProgramLearningCategoryListResponse {
    data: ProgramLearningCategory[];
    last_page: number;
    current_page: number;
    total: number;
    per_page: number;
  }
  