export interface ApiErrorResponse {
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
  message?: string;
  status?: number | string;
}