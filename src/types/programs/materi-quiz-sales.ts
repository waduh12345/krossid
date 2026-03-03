/* ── Materi Quiz Sales Types ── */

export interface MateriQuizSalesQuizItem {
  id: number;
  program_materi_id: number;
  level: number;
  nomor: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface MateriQuizSalesAttempt {
  id: number;
  program_materi_id: number;
  sales_id: number;
  level: number;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  duration_formatted: string | null;
  score: number;
  total_questions: number;
  score_percentage: number | null;
  passed: boolean;
}

/* ── START ── */

export interface MateriQuizStartPayload {
  program_materi_id: number;
  level: number;
  sales_id?: number;
}

export interface MateriQuizStartResponse {
  attempt: MateriQuizSalesAttempt;
  total_questions: number;
  answered_count: number;
  answered_quiz_ids: number[];
  quizzes: MateriQuizSalesQuizItem[];
}

/* ── ANSWER (per-question POST) ── */

export interface MateriQuizAnswerPayload {
  program_materi_id: number;
  level: number;
  quiz_id: number;
  selected_option: string;
  sales_id?: number;
}

export interface MateriQuizAnswerResponse {
  quiz_id: number;
  nomor: number;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
  explanation: string;
  all_explanations: Record<string, string>;
  progress: {
    answered: number;
    total: number;
    remaining: number;
  };
}

/* ── FINISH ── */

export interface MateriQuizFinishPayload {
  program_materi_id: number;
  level: number;
  sales_id?: number;
}

export interface MateriQuizFinishAnswerResult {
  quiz_id: number;
  nomor: number;
  question: string;
  selected_option: string;
  correct_option: string;
  is_correct: boolean;
  explanation: string;
}

export interface MateriQuizFinishResponse {
  id: number;
  program_materi_id: number;
  sales_id: number;
  level: number;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  duration_formatted: string;
  score: number;
  total_questions: number;
  score_percentage: number;
  passed: boolean;
  answers: MateriQuizFinishAnswerResult[];
  rank: number;
  total_participants: number;
  rank_label: string;
  materi: { id: number; program: { id: number; title: string } };
  sales: { id: number; name: string; email: string };
}

/* ── RESULT ── */

export interface MateriQuizResultResponse extends MateriQuizFinishResponse {}

export interface MateriQuizResultParams {
  program_materi_id: number;
  level: number;
  sales_id?: number;
}

/* ── RANKING ── */

export interface MateriQuizRankingEntry {
  sales_id: number;
  total_score: number;
  total_questions: number;
  score_percentage: number;
  total_duration_seconds: number;
  total_duration_formatted: string;
  quizzes_completed: number;
  quizzes_passed: number;
  rank: number;
  total_participants: number;
  rank_label: string;
  sales: { id: number; name: string; email: string };
}

export interface MateriQuizRankingParams {
  program_id: number;
  program_materi_id?: number;
  level?: number;
}

/* ── EXPLAIN (per-question feedback) ── */

export interface MateriQuizExplainResponse {
  nomor: number;
  level: number;
  question: string;
  options: Record<string, string>;
  sales_answer: {
    selected_option: string;
    selected_text: string;
    is_correct: boolean;
    explanation: string;
  };
  correct_answer: {
    correct_option: string;
    correct_text: string;
    explanation: string;
  };
  all_explanations: Record<string, string>;
}

export interface MateriQuizExplainParams {
  program_materi_id: number;
  nomor: number;
  sales_id?: number;
}
