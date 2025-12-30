export interface Sales {
  id: number;
  program_id: number;
  program_name?: string;
  program_sub_title?: string;
  email: string;
  is_corporate: boolean | number;
  status: boolean | number;
}