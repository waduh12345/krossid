export interface Register {
  id: number;
  program_id: number;
  program_name?: string;
  program_sub_title?: string;
  sales_id?: number;
  name: string;
  email: string;
  phone: string;
  parameter_value: string | boolean | number;
  status: boolean | number;
}