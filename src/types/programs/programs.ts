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
}

export interface TopPrograms {
  id: number;
  order: number;
  status: number;
  programs: Programs;
}