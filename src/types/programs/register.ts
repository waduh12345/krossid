export interface Register {
  id: number;
  program_id: number;
  program_name?: string;
  program_sub_title?: string;
  name: string;
  email: string;
  phone: string;
  parameter_value: boolean | number;
  status: boolean | number;
}