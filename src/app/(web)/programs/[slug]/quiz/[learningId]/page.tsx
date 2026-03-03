"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Loader2,
  ArrowLeft,
  Trophy,
  XCircle,
  Lock,
} from "lucide-react";
import Swal from "sweetalert2";
import { useI18n } from "@/contexts/i18n-context";
import {
  useStartMateriQuizMutation,
  useAnswerMateriQuizMutation,
  useFinishMateriQuizMutation,
  useGetMateriQuizRankingQuery,
  useLazyGetMateriQuizExplainQuery,
} from "@/services/programs/materi-quiz-sales.service";
import { useGetMeQuery } from "@/services/auth.service";
import type {
  MateriQuizSalesQuizItem,
  MateriQuizFinishResponse,
} from "@/types/programs/materi-quiz-sales";

const OPTIONS = ["a", "b", "c", "d"] as const;
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

const LEVEL_LABELS: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "Expert",
};

/** Normalized per-question feedback (from ANSWER or EXPLAIN API) */
interface QuestionFeedback {
  is_correct: boolean;
  selected_option: string;
  correct_option: string;
  explanation: string;
  all_explanations: Record<string, string>;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { t } = useI18n();

  const slug = params.slug as string;
  const materiId = Number(params.learningId);
  const level = Number(searchParams.get("level") || "1");
  const programId = Number(searchParams.get("program_id") || "0");

  const { data: userData } = useGetMeQuery(undefined, { skip: !session });
  const userId = userData?.id ?? null;

  // Mutations
  const [startQuiz, { isLoading: starting }] = useStartMateriQuizMutation();
  const [answerQuiz] = useAnswerMateriQuizMutation();
  const [finishQuiz, { isLoading: finishing }] = useFinishMateriQuizMutation();
  const [triggerExplain] = useLazyGetMateriQuizExplainQuery();

  // Quiz state
  const [quizzes, setQuizzes] = useState<MateriQuizSalesQuizItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<Record<number, string>>({});
  const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());
  const [feedbackMap, setFeedbackMap] = useState<Record<number, QuestionFeedback>>({});
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<"loading" | "quiz" | "review" | "result">("loading");
  const [quizResult, setQuizResult] = useState<MateriQuizFinishResponse | null>(null);
  const [progress, setProgress] = useState({ answered: 0, total: 0, remaining: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  // Ranking
  const { data: rankingData } = useGetMateriQuizRankingQuery(
    { program_id: programId, program_materi_id: materiId, level },
    { skip: !programId || phase !== "result" }
  );

  // Helper: convert explain response → QuestionFeedback
  const explainToFeedback = useCallback(
    (explain: {
      sales_answer: { is_correct: boolean; selected_option: string; explanation: string };
      correct_answer: { correct_option: string; explanation: string };
      all_explanations: Record<string, string>;
    }): QuestionFeedback => ({
      is_correct: explain.sales_answer.is_correct,
      selected_option: explain.sales_answer.selected_option,
      correct_option: explain.correct_answer.correct_option,
      explanation: explain.correct_answer.explanation,
      all_explanations: explain.all_explanations,
    }),
    []
  );

  // Auto-start quiz on mount
  useEffect(() => {
    if (!materiId || !level || !userId || startedRef.current) return;
    startedRef.current = true;

    const doStart = async () => {
      try {
        const result = await startQuiz({
          program_materi_id: materiId,
          level,
          sales_id: userId,
        }).unwrap();

        setQuizzes(result.quizzes);

        // Resume support
        const resumedIds = new Set(result.answered_quiz_ids ?? []);
        setAnsweredIds(resumedIds);
        setProgress({
          answered: result.answered_count ?? 0,
          total: result.total_questions,
          remaining: result.total_questions - (result.answered_count ?? 0),
        });

        // Set active to first unanswered question
        if (resumedIds.size > 0) {
          const firstUnanswered = result.quizzes.findIndex(
            (q) => !resumedIds.has(q.id)
          );
          if (firstUnanswered >= 0) setActiveIdx(firstUnanswered);
        }

        setPhase("quiz");

        // Load explain for resumed questions in background
        for (const quiz of result.quizzes) {
          if (resumedIds.has(quiz.id)) {
            triggerExplain({
              program_materi_id: materiId,
              nomor: quiz.nomor,
              sales_id: userId,
            })
              .unwrap()
              .then((explain) => {
                setFeedbackMap((prev) => ({
                  ...prev,
                  [quiz.id]: explainToFeedback(explain),
                }));
              })
              .catch(() => {});
          }
        }
      } catch (err: unknown) {
        let msg = "Gagal memulai quiz";
        if (err && typeof err === "object" && "data" in err) {
          const errData = err.data as { message?: string };
          msg = errData?.message || msg;
        }
        setErrorMsg(msg);
      }
    };

    doStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materiId, level, userId]);

  // Start timer when quiz starts
  useEffect(() => {
    if (phase !== "quiz") return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const answeredCount = answeredIds.size;
  const progressPercent =
    quizzes.length > 0 ? Math.round((answeredCount / quizzes.length) * 100) : 0;

  // Submit answer for current question → POST /answer
  const submitAnswer = useCallback(async () => {
    const quiz = quizzes[activeIdx];
    if (!quiz || !selectedOption[quiz.id] || !userId) return;

    setAnsweringId(quiz.id);

    try {
      const result = await answerQuiz({
        program_materi_id: materiId,
        level,
        quiz_id: quiz.id,
        selected_option: selectedOption[quiz.id],
        sales_id: userId,
      }).unwrap();

      // Store feedback (handle both flat and nested API response shapes)
      const res = result as unknown as Record<string, unknown>;
      const salesAnswer = res.sales_answer as Record<string, unknown> | undefined;
      const correctAnswer = res.correct_answer as Record<string, unknown> | undefined;

      setFeedbackMap((prev) => ({
        ...prev,
        [quiz.id]: {
          is_correct: (salesAnswer?.is_correct ?? result.is_correct) as boolean,
          selected_option: (salesAnswer?.selected_option ?? result.selected_option ?? selectedOption[quiz.id]) as string,
          correct_option: (correctAnswer?.correct_option ?? result.correct_option) as string,
          explanation: (correctAnswer?.explanation ?? result.explanation) as string,
          all_explanations: (result.all_explanations ?? {}) as Record<string, string>,
        },
      }));

      // Mark as answered
      setAnsweredIds((prev) => {
        const next = new Set(prev);
        next.add(quiz.id);
        return next;
      });

      // Update progress
      if (result.progress) {
        setProgress(result.progress);
      }
    } catch (err: unknown) {
      let msg = "Gagal mengirim jawaban";
      if (err && typeof err === "object" && "data" in err) {
        const errData = err.data as { message?: string };
        msg = errData?.message || msg;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        background: "#1e293b",
        color: "#fff",
      });
    } finally {
      setAnsweringId(null);
    }
  }, [quizzes, activeIdx, selectedOption, userId, materiId, level, answerQuiz]);

  // Finish quiz → POST /finish
  const handleFinish = useCallback(async () => {
    if (!userId) return;
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const result = await finishQuiz({
        program_materi_id: materiId,
        level,
        sales_id: userId,
      }).unwrap();

      setQuizResult(result);
      setPhase("result");
    } catch (err: unknown) {
      let msg = "Gagal menyelesaikan quiz";
      if (err && typeof err === "object" && "data" in err) {
        const errData = err.data as { message?: string };
        msg = errData?.message || msg;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        background: "#1e293b",
        color: "#fff",
      });
      // Restart timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  }, [userId, materiId, level, finishQuiz]);

  // Navigate to next unanswered question
  const goToNextUnanswered = useCallback(() => {
    for (let i = activeIdx + 1; i < quizzes.length; i++) {
      if (!answeredIds.has(quizzes[i].id)) {
        setActiveIdx(i);
        return;
      }
    }
    for (let i = 0; i < activeIdx; i++) {
      if (!answeredIds.has(quizzes[i].id)) {
        setActiveIdx(i);
        return;
      }
    }
  }, [quizzes, activeIdx, answeredIds]);

  const goBack = () => router.push(`/programs/${slug}`);

  const handleRetake = async () => {
    setSelectedOption({});
    setAnsweredIds(new Set());
    setFeedbackMap({});
    setAnsweringId(null);
    setActiveIdx(0);
    setQuizResult(null);
    setElapsedSeconds(0);
    setProgress({ answered: 0, total: 0, remaining: 0 });
    setPhase("loading");
    setErrorMsg(null);
    startedRef.current = false;

    try {
      const result = await startQuiz({
        program_materi_id: materiId,
        level,
        sales_id: userId!,
      }).unwrap();

      setQuizzes(result.quizzes);

      const resumedIds = new Set(result.answered_quiz_ids ?? []);
      setAnsweredIds(resumedIds);
      setProgress({
        answered: result.answered_count ?? 0,
        total: result.total_questions,
        remaining: result.total_questions - (result.answered_count ?? 0),
      });

      if (resumedIds.size > 0) {
        const firstUnanswered = result.quizzes.findIndex(
          (q) => !resumedIds.has(q.id)
        );
        if (firstUnanswered >= 0) setActiveIdx(firstUnanswered);
      }

      setPhase("quiz");
      startedRef.current = true;

      // Load explain for resumed questions
      for (const quiz of result.quizzes) {
        if (resumedIds.has(quiz.id)) {
          triggerExplain({
            program_materi_id: materiId,
            nomor: quiz.nomor,
            sales_id: userId!,
          })
            .unwrap()
            .then((explain) => {
              setFeedbackMap((prev) => ({
                ...prev,
                [quiz.id]: explainToFeedback(explain),
              }));
            })
            .catch(() => {});
        }
      }
    } catch (err: unknown) {
      let msg = "Gagal memulai quiz";
      if (err && typeof err === "object" && "data" in err) {
        const errData = err.data as { message?: string };
        msg = errData?.message || msg;
      }
      setErrorMsg(msg);
    }
  };

  const currentQuiz = quizzes[activeIdx];
  const levelLabel = LEVEL_LABELS[level] || `Level ${level}`;
  const currentFeedback = currentQuiz ? feedbackMap[currentQuiz.id] : undefined;
  const isCurrentAnswered = currentQuiz ? answeredIds.has(currentQuiz.id) : false;
  const isCurrentAnswering = currentQuiz ? answeringId === currentQuiz.id : false;
  const isReview = phase === "review";
  const allAnswered = answeredIds.size === quizzes.length && quizzes.length > 0;

  // ----------- Loading / Error state -----------
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          {errorMsg ? (
            <>
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-white/70 text-sm mb-6">{errorMsg}</p>
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition-all"
              >
                <ArrowLeft size={16} />
                {t.myAccount.learning.back}
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-[#367CC0] mx-auto" />
              <p className="mt-4 text-white/50 text-sm font-medium">
                Memulai quiz...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ----------- Result screen -----------
  if (phase === "result" && quizResult) {
    const percent = quizResult.score_percentage ?? 0;
    const ranking = rankingData ?? [];

    return (
      <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center h-14">
            <button
              type="button"
              onClick={goBack}
              className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="ml-3 text-sm font-bold text-white">
              Hasil Quiz — {levelLabel}
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto px-4 py-10 space-y-8">
            {/* Score circle */}
            <div className="text-center">
              <div className="relative mx-auto w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"
                  />
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke={quizResult.passed ? "#22c55e" : "#ef4444"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(percent / 100) * 339.29} 339.29`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">
                    {quizResult.score}/{quizResult.total_questions}
                  </span>
                  <span className="text-xs text-white/40 mt-1">{percent}%</span>
                </div>
              </div>

              {/* Pass/Fail badge */}
              <div
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-bold mt-6 ${
                  quizResult.passed
                    ? "bg-green-500/15 text-green-400 border border-green-500/25"
                    : "bg-red-500/15 text-red-400 border border-red-500/25"
                }`}
              >
                {quizResult.passed ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
                {quizResult.passed
                  ? t.myAccount.learning.passed
                  : t.myAccount.learning.failed}
              </div>

              {/* Rank */}
              {quizResult.rank_label && (
                <p className="text-white/50 text-sm mt-3 flex items-center justify-center gap-1.5">
                  <Trophy size={14} className="text-amber-400" />
                  {quizResult.rank_label}
                </p>
              )}

              {/* Duration */}
              {quizResult.duration_formatted && (
                <p className="text-white/40 text-sm mt-2 flex items-center justify-center gap-1.5">
                  <Clock size={14} />
                  {quizResult.duration_formatted}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => { setActiveIdx(0); setPhase("review"); }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <BookOpen size={16} />
                Review Jawaban
              </button>
              <button
                type="button"
                onClick={handleRetake}
                disabled={starting}
                className="px-6 py-3 rounded-xl bg-[#367CC0] hover:bg-[#367CC0]/90 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {starting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Award size={16} />
                )}
                {t.myAccount.learning.retakeQuiz}
              </button>
            </div>

            {/* Ranking Leaderboard */}
            {ranking.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={18} className="text-amber-400" />
                  <h3 className="text-white font-bold">Leaderboard</h3>
                </div>
                <div className="space-y-2">
                  {ranking.slice(0, 10).map((entry, idx) => {
                    const isMe = entry.sales_id === userId;
                    return (
                      <div
                        key={entry.sales_id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isMe
                            ? "bg-[#367CC0]/15 border-[#367CC0]/30"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            idx === 0
                              ? "bg-amber-500/20 text-amber-400"
                              : idx === 1
                                ? "bg-gray-400/20 text-gray-300"
                                : idx === 2
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-white/10 text-white/50"
                          }`}
                        >
                          {entry.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isMe ? "text-[#367CC0]" : "text-white"}`}>
                            {entry.sales?.name ?? "—"}
                            {isMe && " (Kamu)"}
                          </p>
                          <p className="text-[10px] text-white/40">
                            {entry.total_duration_formatted}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">
                            {entry.score_percentage}%
                          </p>
                          <p className="text-[10px] text-white/40">
                            {entry.total_score}/{entry.total_questions}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Back button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={goBack}
                className="text-white/40 hover:text-white text-sm transition-all"
              >
                {t.myAccount.learning.back}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------- Empty state -----------
  if (quizzes.length === 0 && phase === "quiz") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <BookOpen size={56} className="text-white/15 mx-auto" />
          <p className="text-white/50 text-lg font-medium">
            Belum ada soal quiz untuk level ini.
          </p>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition-all"
          >
            <ArrowLeft size={16} />
            {t.myAccount.learning.back}
          </button>
        </div>
      </div>
    );
  }

  // ----------- Main quiz UI + Review UI -----------
  return (
    <div className="min-h-screen flex flex-col">
      {/* Finishing overlay */}
      {finishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#7ED321] mx-auto" />
            <p className="mt-4 text-white/70 text-sm font-medium">Menghitung hasil...</p>
          </div>
        </div>
      )}

      {/* ===== TOP BAR ===== */}
      <div className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={isReview ? () => setPhase("result") : goBack}
                className="p-2 -ml-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-white truncate">
                  {isReview ? `Review Jawaban — ${levelLabel}` : `Quiz — ${levelLabel}`}
                </h1>
                <p className="text-[10px] sm:text-xs text-white/40">
                  {isReview
                    ? `${quizResult?.score}/${quizResult?.total_questions} Benar · ${quizResult?.score_percentage}%`
                    : `${answeredCount} dijawab / ${quizzes.length} soal`}
                </p>
              </div>
            </div>

            {!isReview && (
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold bg-white/10 text-white/80 border border-white/10">
                  <Clock size={14} />
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
            )}
          </div>

          <div className="pb-3">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isReview
                    ? "bg-gradient-to-r from-[#7ED321] to-[#22c55e]"
                    : "bg-gradient-to-r from-[#367CC0] to-[#7ED321]"
                }`}
                style={{ width: isReview ? "100%" : `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-5xl w-full mx-auto">
        {/* --- Question Navigator --- */}
        <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.02]">
          <div className="p-3 sm:p-4">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 hidden lg:block">
              {isReview ? "Review" : t.myAccount.learning.quizOverview}
            </p>
            <div className="flex lg:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
              {quizzes.map((q, idx) => {
                const isActive = idx === activeIdx;
                const feedback = feedbackMap[q.id];
                const isAnsw = answeredIds.has(q.id);

                let btnClass = "";
                if (isAnsw && feedback) {
                  // Has feedback — show correct/incorrect color
                  btnClass = isActive
                    ? feedback.is_correct
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110"
                      : "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110"
                    : feedback.is_correct
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30";
                } else if (isActive) {
                  btnClass = "bg-[#367CC0] text-white shadow-lg shadow-[#367CC0]/30 scale-110";
                } else if (isAnsw) {
                  // Answered but feedback still loading
                  btnClass = "bg-[#7ED321]/20 text-[#7ED321] border border-[#7ED321]/30";
                } else if (selectedOption[q.id] != null) {
                  // Option selected but not yet submitted
                  btnClass = "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30";
                } else {
                  btnClass = "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all relative shrink-0 ${btnClass}`}
                  >
                    {idx + 1}
                    {isAnsw && !feedback && !isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#7ED321] rounded-full border border-[#0f172a] flex items-center justify-center">
                        <Lock size={6} className="text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Question Content --- */}
        {currentQuiz && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-2xl mx-auto">
                {/* Question header */}
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm ${
                      currentFeedback
                        ? currentFeedback.is_correct
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                        : "bg-[#367CC0]/20 text-[#367CC0]"
                    }`}
                  >
                    {currentQuiz.nomor}
                  </span>
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                      {t.myAccount.learning.question} {activeIdx + 1}{" "}
                      {t.myAccount.learning.of} {quizzes.length}
                    </p>
                    {currentFeedback && (
                      <p className={`text-xs font-bold mt-0.5 ${currentFeedback.is_correct ? "text-green-400" : "text-red-400"}`}>
                        {currentFeedback.is_correct ? "Jawaban Benar" : "Jawaban Salah"}
                      </p>
                    )}
                    {isCurrentAnswering && (
                      <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Memeriksa jawaban...
                      </p>
                    )}
                  </div>
                </div>

                {/* Question content */}
                <div
                  className={`border rounded-2xl p-5 sm:p-6 mb-4 ${
                    currentFeedback
                      ? currentFeedback.is_correct
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-red-500/5 border-red-500/20"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                    {currentQuiz.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {OPTIONS.map((opt, i) => {
                    const textKey = `option_${opt}` as keyof MateriQuizSalesQuizItem;
                    const label = currentQuiz[textKey] as string;
                    if (!label) return null;

                    const isSelected = selectedOption[currentQuiz.id] === opt;

                    // === FEEDBACK MODE (answered with feedback data) ===
                    if ((isCurrentAnswered || isReview) && currentFeedback) {
                      const isCorrectOpt = currentFeedback.correct_option === opt;
                      const isSelectedOpt = currentFeedback.selected_option === opt;
                      const explanation = currentFeedback.all_explanations?.[opt];

                      let optClass = "bg-white/[0.02] border-white/5";
                      let badgeClass = "bg-white/10 text-white/40";
                      let textClass = "text-white/40";

                      if (isCorrectOpt) {
                        optClass = "bg-green-500/10 border-green-500/40";
                        badgeClass = "bg-green-500 text-white";
                        textClass = "text-white font-medium";
                      }
                      if (isSelectedOpt && !currentFeedback.is_correct) {
                        optClass = "bg-red-500/10 border-red-500/40";
                        badgeClass = "bg-red-500 text-white";
                        textClass = "text-white font-medium";
                      }

                      return (
                        <div key={opt} className={`w-full rounded-xl border p-4 ${optClass}`}>
                          <div className="flex items-start gap-4">
                            <span className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 mt-0.5 ${badgeClass}`}>
                              {OPTION_LABELS[i]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-relaxed ${textClass}`}>{label}</p>
                            </div>
                            {isCorrectOpt && <CheckCircle2 size={20} className="text-green-400 shrink-0 mt-0.5" />}
                            {isSelectedOpt && !currentFeedback.is_correct && <XCircle size={20} className="text-red-400 shrink-0 mt-0.5" />}
                          </div>
                          {explanation && (
                            <p className={`mt-2 text-xs leading-relaxed pl-[52px] ${
                              isCorrectOpt ? "text-green-400/70" : isSelectedOpt ? "text-red-400/70" : "text-white/30"
                            }`}>
                              {explanation}
                            </p>
                          )}
                        </div>
                      );
                    }

                    // === ANSWERED but no feedback yet (loading) ===
                    if (isCurrentAnswered) {
                      return (
                        <div
                          key={opt}
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border cursor-not-allowed ${
                            isSelected
                              ? "bg-[#367CC0]/10 border-[#367CC0]/30"
                              : "bg-white/[0.02] border-white/5 opacity-40"
                          }`}
                        >
                          <span className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 mt-0.5 ${
                            isSelected ? "bg-[#367CC0] text-white" : "bg-white/10 text-white/30"
                          }`}>
                            {OPTION_LABELS[i]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${isSelected ? "text-white font-medium" : "text-white/40"}`}>
                              {label}
                            </p>
                          </div>
                          {isSelected && <Lock size={18} className="text-[#367CC0]/60 shrink-0 mt-0.5" />}
                        </div>
                      );
                    }

                    // === NORMAL INTERACTIVE MODE ===
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isCurrentAnswering}
                        onClick={() =>
                          setSelectedOption((prev) => ({
                            ...prev,
                            [currentQuiz.id]: opt,
                          }))
                        }
                        className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all group ${
                          isSelected
                            ? "bg-[#367CC0]/15 border-[#367CC0]/50 shadow-lg shadow-[#367CC0]/10"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <span
                          className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 transition-all mt-0.5 ${
                            isSelected
                              ? "bg-[#367CC0] text-white"
                              : "bg-white/10 text-white/50 group-hover:bg-white/15 group-hover:text-white/70"
                          }`}
                        >
                          {OPTION_LABELS[i]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${isSelected ? "text-white font-medium" : "text-white/70"}`}>
                            {label}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={20} className="text-[#367CC0] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Wrong answer summary */}
                {currentFeedback && !currentFeedback.is_correct && currentFeedback.selected_option && currentFeedback.correct_option && (
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-white/50">
                      Jawaban kamu: <span className="text-red-400 font-bold">{currentFeedback.selected_option.toUpperCase()}</span>
                      {" · "}
                      Jawaban benar: <span className="text-green-400 font-bold">{currentFeedback.correct_option.toUpperCase()}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ===== BOTTOM NAV ===== */}
            <div className="sticky bottom-0 border-t border-white/10 bg-[#0f172a]/80 backdrop-blur-xl px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} /> {t.myAccount.learning.prev}
                </button>

                <div className="flex items-center gap-2">
                  {isReview ? (
                    /* Review mode → back to result */
                    <button
                      type="button"
                      onClick={() => setPhase("result")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7ED321] to-[#5BB318] hover:brightness-110 text-white text-sm font-bold transition-all shadow-lg shadow-[#7ED321]/20"
                    >
                      <Award size={16} /> Lihat Hasil
                    </button>
                  ) : isCurrentAnswering ? (
                    /* Currently submitting answer */
                    <span className="flex items-center gap-1.5 px-4 py-2.5 text-white/50 text-sm font-bold">
                      <Loader2 size={14} className="animate-spin" /> Memeriksa...
                    </span>
                  ) : isCurrentAnswered && currentFeedback && allAnswered ? (
                    /* All questions answered → finish */
                    <button
                      type="button"
                      onClick={handleFinish}
                      disabled={finishing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7ED321] to-[#5BB318] hover:brightness-110 text-white text-sm font-bold transition-all shadow-lg shadow-[#7ED321]/20 disabled:opacity-50"
                    >
                      {finishing ? <Loader2 size={14} className="animate-spin" /> : <Award size={16} />}
                      Selesai & Lihat Hasil
                    </button>
                  ) : isCurrentAnswered && currentFeedback ? (
                    /* Answered with feedback → go to next */
                    <button
                      type="button"
                      onClick={goToNextUnanswered}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#367CC0] hover:bg-[#367CC0]/90 text-white text-sm font-bold transition-all"
                    >
                      Soal Berikutnya <ChevronRight size={16} />
                    </button>
                  ) : isCurrentAnswered ? (
                    /* Answered but feedback loading */
                    <span className="flex items-center gap-1.5 px-4 py-2.5 text-[#7ED321] text-sm font-bold">
                      <Lock size={14} /> Terjawab
                    </span>
                  ) : selectedOption[currentQuiz?.id] != null ? (
                    /* Option selected → submit answer */
                    <button
                      type="button"
                      onClick={submitAnswer}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7ED321] to-[#5BB318] hover:brightness-110 text-white text-sm font-bold transition-all shadow-lg shadow-[#7ED321]/20"
                    >
                      <CheckCircle2 size={16} /> Jawab
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveIdx((i) => Math.min(quizzes.length - 1, i + 1))}
                  disabled={activeIdx === quizzes.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {t.myAccount.learning.next} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
