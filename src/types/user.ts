// types/user.ts

import { Student } from "./student";

export interface UserRolePivot {
  model_type: string;
  model_id: number;
  role_id: number;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: UserRolePivot;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  referral?: string | null;
  program_id?: string | null;
  sales?: boolean;
}

export interface ValidateOtpPayload {
  otp: string;
}

export interface AuthTokenResponse {
  token: string;
  token_type: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  referral?: string;
  is_corporate?: boolean;
  status?: boolean | number;
  student: Student;
}

export type Users = User;

export interface ApiPaginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: ApiPaginated<T>;
}

export interface ItemResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type UserListFilters = {
  page?: number;
  paginate?: number;
  search?: string;
  role_id?: number;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  password_confirmation: string;
  role_id: number;
  status?: boolean | number;
};

export type UpdateUserPayload = Partial<{
  name: string;
  email: string;
  phone: string | null;
  role_id: number;
  status: boolean | number;
}>;

export type UpdatePasswordPayload = {
  password: string;
  password_confirmation: string;
};

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}