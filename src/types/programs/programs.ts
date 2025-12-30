export interface Programs {
  id: number;
  program_category_id: number;
  program_category_name?: string;
  owner_id: number;
  owner_name?: string;
  title: string;
  sub_title: string | null;
  slug: string;
  description: string | null;
  parameter: string | null;
  image: File | string | null;
  status: boolean | number;
  original?: string; // URL original image
  avif?: string; // URL avif image
}