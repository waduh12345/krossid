export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export type ContactListFilters = {
  page?: number;
  paginate?: number;
  s?: string;
  searchBy?: string;
  orderBy?: string;
  order?: "asc" | "desc";
};

export type CreateContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

export type UpdateContactPayload = Partial<CreateContactPayload>;
