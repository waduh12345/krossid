import type { Users } from "../user";

export interface TopSale {
  id: number;
  user_id: number;
  order: number;
  status: number | boolean;
  created_at: string;
  updated_at: string;
  user?: Users;
}

export interface TopSaleResponse {
  data: TopSale[];
  last_page: number;
  current_page: number;
  total: number;
  per_page: number;
}

export interface CreateTopSalePayload {
  user_id: number;
  order: number;
  status: number | boolean;
}

export interface UpdateTopSalePayload {
  user_id: number;
  order: number;
  status: number | boolean;
}
