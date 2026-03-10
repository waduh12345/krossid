"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  Zap,
  Star,
  PartyPopper,
  Target,
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
import { usePackageAccess } from "@/hooks/use-package-access";
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

const OPTION_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", activeBg: "bg-blue-100", activeBorder: "border-blue-400", badge: "bg-blue-500", hoverBg: "hover:bg-blue-50/80" },
  { bg: "bg-amber-50", border: "border-amber-200", activeBg: "bg-amber-100", activeBorder: "border-amber-400", badge: "bg-amber-500", hoverBg: "hover:bg-amber-50/80" },
  { bg: "bg-emerald-50", border: "border-emerald-200", activeBg: "bg-emerald-100", activeBorder: "border-emerald-400", badge: "bg-emerald-500", hoverBg: "hover:bg-emerald-50/80" },
  { bg: "bg-purple-50", border: "border-purple-200", activeBg: "bg-purple-100", activeBorder: "border-purple-400", badge: "bg-purple-500", hoverBg: "hover:bg-purple-50/80" },
];

// Confetti particle for result screen
function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        size: 4 + Math.random() * 8,
        color: ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#a855f7", "#ec4899", "#06b6d4"][
          Math.floor(Math.random() * 7)
        ],
        rotation: Math.random() * 360,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            rotate: p.rotation,
          }}
          initial={{ top: "-5%", opacity: 1 }}
          animate={{ top: "110%", opacity: 0, rotate: p.rotation + 720 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      ))}
    </div>
  );
}

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
  const packageAccess = usePackageAccess(userData);
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

  // Animation direction for question transitions
  const [slideDirection, setSlideDirection] = useState(1);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  // Ranking
  const { data: rankingData } = useGetMateriQuizRankingQuery(
    { program_id: programId, program_materi_id: materiId, level },
    { skip: !programId || phase !== "result" }
  );

  // Helper: convert explain response -> QuestionFeedback
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

  // Redirect if package expired or no quiz access
  useEffect(() => {
    if (!userData) return; // Still loading
    // Only enforce if user has package data
    if (!userData.active_package_registration && !userData.owner_package) return;
    if (!packageAccess.canDoQuiz) {
      router.push("/pricing/renew");
    }
  }, [userData, packageAccess.canDoQuiz, router]);

  // Auto-start quiz on mount
  useEffect(() => {
    if (!materiId || !level || !userId || startedRef.current) return;
    if (userData && (userData.active_package_registration || userData.owner_package) && !packageAccess.canDoQuiz) return;
    startedRef.current = true;

    const doStart = async () => {
      try {
        const result = await startQuiz({
          program_materi_id: materiId,
          level,
          sales_id: userId,
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

  // Navigate with direction tracking
  const navigateTo = useCallback((idx: number) => {
    setSlideDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  }, [activeIdx]);

  // Submit answer for current question
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

      setAnsweredIds((prev) => {
        const next = new Set(prev);
        next.add(quiz.id);
        return next;
      });

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
        title: "Oops!",
        text: msg,
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setAnsweringId(null);
    }
  }, [quizzes, activeIdx, selectedOption, userId, materiId, level, answerQuiz]);

  // Finish quiz
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
        title: "Oops!",
        text: msg,
        confirmButtonColor: "#6366f1",
      });
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  }, [userId, materiId, level, finishQuiz]);

  // Navigate to next unanswered question
  const goToNextUnanswered = useCallback(() => {
    for (let i = activeIdx + 1; i < quizzes.length; i++) {
      if (!answeredIds.has(quizzes[i].id)) {
        navigateTo(i);
        return;
      }
    }
    for (let i = 0; i < activeIdx; i++) {
      if (!answeredIds.has(quizzes[i].id)) {
        navigateTo(i);
        return;
      }
    }
  }, [quizzes, activeIdx, answeredIds, navigateTo]);

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

  // Slide variants for question transition
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  // ----------- Loading / Error state -----------
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {errorMsg ? (
            <>
              <motion.div
                className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </motion.div>
              <motion.p
                className="text-gray-600 text-sm mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {errorMsg}
              </motion.p>
              <motion.button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-all shadow-md border border-gray-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={16} />
                {t.myAccount.learning.back}
              </motion.button>
            </>
          ) : (
            <>
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Zap className="h-12 w-12 text-indigo-500" />
              </motion.div>
              <motion.p
                className="mt-4 text-indigo-600 text-sm font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Menyiapkan quiz...
              </motion.p>
              <motion.div
                className="flex justify-center gap-1.5 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-indigo-400"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // ----------- Result screen -----------
  if (phase === "result" && quizResult) {
    const percent = quizResult.score_percentage ?? 0;
    const ranking = rankingData ?? [];
    const passed = quizResult.passed;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex flex-col relative overflow-hidden">
        {/* Confetti for passing */}
        {passed && <Confetti />}

        {/* Top bar */}
        <motion.div
          className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center h-14">
            <motion.button
              type="button"
              onClick={goBack}
              className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="ml-3 text-sm font-bold text-gray-800 flex items-center gap-2">
              <Star size={16} className="text-amber-400" />
              Hasil Quiz — {levelLabel}
            </h1>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-md mx-auto px-4 py-10 space-y-8">
            {/* Score circle */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
            >
              <div className="relative mx-auto w-44 h-44">
                <motion.div
                  className="absolute -inset-3 rounded-full bg-gradient-to-br from-indigo-200 via-purple-200 to-amber-200 opacity-40 blur-md"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 120 120">
                  <circle
                    cx="60" cy="60" r="54"
                    fill="white" stroke="#e5e7eb" strokeWidth="8"
                  />
                  <motion.circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke={passed ? "#22c55e" : "#f59e0b"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 339.29" }}
                    animate={{ strokeDasharray: `${(percent / 100) * 339.29} 339.29` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <motion.span
                    className="text-3xl font-black text-gray-800"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.8 }}
                  >
                    {quizResult.score}/{quizResult.total_questions}
                  </motion.span>
                  <span className="text-xs text-gray-400 font-bold mt-1">{percent}%</span>
                </div>
              </div>

              {/* Pass/Fail badge */}
              <motion.div
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-2xl text-base font-black mt-8 shadow-lg ${
                  passed
                    ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-green-200"
                    : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-200"
                }`}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 250, delay: 1.2 }}
              >
                {passed ? <PartyPopper size={20} /> : <Target size={20} />}
                {passed
                  ? t.myAccount.learning.passed
                  : t.myAccount.learning.failed}
              </motion.div>

              {passed && (
                <motion.p
                  className="text-gray-500 text-sm mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  Keren banget! Pertahankan!
                </motion.p>
              )}

              {/* Rank */}
              {quizResult.rank_label && (
                <motion.p
                  className="text-gray-500 text-sm mt-3 flex items-center justify-center gap-1.5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <Trophy size={14} className="text-amber-500" />
                  {quizResult.rank_label}
                </motion.p>
              )}

              {/* Duration */}
              {quizResult.duration_formatted && (
                <motion.p
                  className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 }}
                >
                  <Clock size={14} />
                  {quizResult.duration_formatted}
                </motion.p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
            >
              <motion.button
                type="button"
                onClick={() => { setActiveIdx(0); setPhase("review"); }}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-colors border border-gray-200 shadow-sm flex items-center justify-center gap-2"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <BookOpen size={16} className="text-indigo-500" />
                Review Jawaban
              </motion.button>
              <motion.button
                type="button"
                onClick={handleRetake}
                disabled={starting}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {starting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                {t.myAccount.learning.retakeQuiz}
              </motion.button>
            </motion.div>

            {/* Ranking Leaderboard */}
            {ranking.length > 0 && (
              <motion.div
                className="mt-4 bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Trophy size={18} className="text-amber-500" />
                  </motion.div>
                  <h3 className="text-gray-800 font-black">Leaderboard</h3>
                </div>
                <div className="space-y-2">
                  {ranking.slice(0, 10).map((entry, idx) => {
                    const isMe = entry.sales_id === userId;
                    const medalColors = [
                      "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-amber-200",
                      "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-gray-200",
                      "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-200",
                    ];
                    return (
                      <motion.div
                        key={entry.sales_id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isMe
                            ? "bg-indigo-50 border-indigo-200"
                            : "bg-gray-50 border-gray-100"
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.1 + idx * 0.08 }}
                      >
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
                            idx < 3 ? medalColors[idx] : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {entry.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isMe ? "text-indigo-600" : "text-gray-700"}`}>
                            {entry.sales?.name ?? "—"}
                            {isMe && " (Kamu)"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {entry.total_duration_formatted}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-gray-700">
                            {entry.score_percentage}%
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {entry.total_score}/{entry.total_questions}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Back button */}
            <motion.div
              className="text-center pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <button
                type="button"
                onClick={goBack}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-all"
              >
                {t.myAccount.learning.back}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ----------- Empty state -----------
  if (quizzes.length === 0 && phase === "quiz") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex items-center justify-center px-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <BookOpen size={36} className="text-gray-300" />
          </motion.div>
          <p className="text-gray-500 text-lg font-bold">
            Belum ada soal quiz untuk level ini.
          </p>
          <motion.button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-all shadow-md border border-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={16} />
            {t.myAccount.learning.back}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ----------- Main quiz UI + Review UI -----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex flex-col">
      {/* Package expiring soon alert */}
      {session && packageAccess.isExpiringSoon && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-3">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800 font-semibold">
              Paket Anda akan berakhir dalam {packageAccess.daysRemaining} hari ({packageAccess.activeUntil}). Perpanjang sekarang agar akses tidak terputus.
            </p>
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="shrink-0 px-4 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full hover:bg-amber-600 transition-all"
            >
              Perpanjang
            </button>
          </div>
        </div>
      )}
      {/* Finishing overlay */}
      <AnimatePresence>
        {finishing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto"
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="h-10 w-10 text-indigo-500" />
              </motion.div>
              <p className="mt-4 text-indigo-600 text-sm font-bold">Menghitung hasil...</p>
              <motion.div
                className="flex justify-center gap-1.5 mt-3"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== TOP BAR ===== */}
      <motion.div
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3 min-w-0">
              <motion.button
                type="button"
                onClick={isReview ? () => setPhase("result") : goBack}
                className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0"
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-black text-gray-800 truncate flex items-center gap-2">
                  {isReview ? (
                    <><BookOpen size={16} className="text-indigo-500 shrink-0" /> Review — {levelLabel}</>
                  ) : (
                    <>
                      <motion.span
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                      >
                        <Zap size={16} className="text-amber-500 shrink-0" />
                      </motion.span>
                      Quiz — {levelLabel}
                    </>
                  )}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                  {isReview
                    ? `${quizResult?.score}/${quizResult?.total_questions} Benar · ${quizResult?.score_percentage}%`
                    : `${answeredCount} dijawab / ${quizzes.length} soal`}
                </p>
              </div>
            </div>

            {!isReview && (
              <motion.div
                className="flex items-center gap-2 sm:gap-3 shrink-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Clock size={14} />
                  {formatTime(elapsedSeconds)}
                </div>
              </motion.div>
            )}
          </div>

          <div className="pb-3">
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isReview
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : "bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400"
                }`}
                initial={{ width: "0%" }}
                animate={{ width: isReview ? "100%" : `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== BODY ===== */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-5xl w-full mx-auto">
        {/* --- Question Navigator --- */}
        <motion.div
          className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-3 sm:p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 hidden lg:block">
              {isReview ? "Review" : t.myAccount.learning.quizOverview}
            </p>
            <div className="flex lg:flex-wrap gap-1.5 sm:gap-2 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
              {quizzes.map((q, idx) => {
                const isActive = idx === activeIdx;
                const feedback = feedbackMap[q.id];
                const isAnsw = answeredIds.has(q.id);

                let btnClass = "";
                if (isAnsw && feedback) {
                  btnClass = isActive
                    ? feedback.is_correct
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110 ring-2 ring-emerald-300"
                      : "bg-red-500 text-white shadow-lg shadow-red-200 scale-110 ring-2 ring-red-300"
                    : feedback.is_correct
                      ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-300"
                      : "bg-red-100 text-red-600 border-2 border-red-300";
                } else if (isActive) {
                  btnClass = "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200 scale-110 ring-2 ring-indigo-300";
                } else if (isAnsw) {
                  btnClass = "bg-green-100 text-green-600 border-2 border-green-300";
                } else if (selectedOption[q.id] != null) {
                  btnClass = "bg-amber-100 text-amber-600 border-2 border-amber-300 hover:bg-amber-200";
                } else {
                  btnClass = "bg-white text-gray-400 border-2 border-gray-200 hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-200";
                }

                return (
                  <motion.button
                    key={q.id}
                    type="button"
                    onClick={() => navigateTo(idx)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-black transition-colors relative shrink-0 ${btnClass}`}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
                    transition={{ delay: 0.05 * idx, type: "spring", stiffness: 300 }}
                    layout
                  >
                    {idx + 1}
                    {isAnsw && !feedback && !isActive && (
                      <motion.span
                        className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Lock size={6} className="text-white" />
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* --- Question Content --- */}
        {currentQuiz && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.div
                  key={currentQuiz.id}
                  className="max-w-2xl mx-auto"
                  custom={slideDirection}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* Question header */}
                  <div className="flex items-center gap-3 mb-6">
                    <motion.span
                      className={`flex items-center justify-center w-11 h-11 rounded-2xl font-black text-sm shadow-sm ${
                        currentFeedback
                          ? currentFeedback.is_correct
                            ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                            : "bg-red-100 text-red-600 border border-red-200"
                          : "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 border border-indigo-200"
                      }`}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {currentQuiz.nomor}
                    </motion.span>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {t.myAccount.learning.question} {activeIdx + 1}{" "}
                        {t.myAccount.learning.of} {quizzes.length}
                      </p>
                      <AnimatePresence mode="wait">
                        {currentFeedback && (
                          <motion.p
                            key={currentFeedback.is_correct ? "correct" : "wrong"}
                            className={`text-xs font-black mt-0.5 flex items-center gap-1 ${currentFeedback.is_correct ? "text-emerald-500" : "text-red-500"}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                          >
                            {currentFeedback.is_correct ? <><CheckCircle2 size={12} /> Jawaban Benar!</> : <><XCircle size={12} /> Jawaban Salah</>}
                          </motion.p>
                        )}
                        {isCurrentAnswering && (
                          <motion.p
                            key="answering"
                            className="text-xs text-indigo-500 mt-0.5 flex items-center gap-1 font-bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Loader2 size={10} className="animate-spin" /> Memeriksa jawaban...
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Question content */}
                  <motion.div
                    className={`rounded-3xl p-5 sm:p-6 mb-6 shadow-sm border ${
                      currentFeedback
                        ? currentFeedback.is_correct
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-red-50 border-red-200"
                        : "bg-white border-gray-100"
                    }`}
                    layout
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-800 text-base sm:text-lg font-semibold leading-relaxed">
                      {currentQuiz.question}
                    </p>
                  </motion.div>

                  {/* Options */}
                  <div className="space-y-3">
                    {OPTIONS.map((opt, i) => {
                      const textKey = `option_${opt}` as keyof MateriQuizSalesQuizItem;
                      const label = currentQuiz[textKey] as string;
                      if (!label) return null;

                      const isSelected = selectedOption[currentQuiz.id] === opt;
                      const colors = OPTION_COLORS[i];

                      // === FEEDBACK MODE ===
                      if ((isCurrentAnswered || isReview) && currentFeedback) {
                        const isCorrectOpt = currentFeedback.correct_option === opt;
                        const isSelectedOpt = currentFeedback.selected_option === opt;
                        const explanation = currentFeedback.all_explanations?.[opt];

                        let optClass = "bg-gray-50 border-gray-100";
                        let badgeClass = "bg-gray-200 text-gray-400";
                        let textClass = "text-gray-400";

                        if (isCorrectOpt) {
                          optClass = "bg-emerald-50 border-emerald-300 shadow-sm shadow-emerald-100";
                          badgeClass = "bg-emerald-500 text-white";
                          textClass = "text-gray-800 font-semibold";
                        }
                        if (isSelectedOpt && !currentFeedback.is_correct) {
                          optClass = "bg-red-50 border-red-300 shadow-sm shadow-red-100";
                          badgeClass = "bg-red-500 text-white";
                          textClass = "text-gray-800 font-semibold";
                        }

                        return (
                          <motion.div
                            key={opt}
                            className={`w-full rounded-2xl border-2 p-4 ${optClass}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                          >
                            <div className="flex items-start gap-4">
                              <motion.span
                                className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black shrink-0 mt-0.5 shadow-sm ${badgeClass}`}
                                initial={isCorrectOpt || isSelectedOpt ? { scale: 0.5 } : {}}
                                animate={isCorrectOpt || isSelectedOpt ? { scale: 1 } : {}}
                                transition={{ type: "spring", stiffness: 400, delay: 0.2 + i * 0.08 }}
                              >
                                {OPTION_LABELS[i]}
                              </motion.span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-relaxed ${textClass}`}>{label}</p>
                              </div>
                              {isCorrectOpt && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                                >
                                  <CheckCircle2 size={22} className="text-emerald-500 shrink-0 mt-0.5" />
                                </motion.div>
                              )}
                              {isSelectedOpt && !currentFeedback.is_correct && (
                                <motion.div
                                  initial={{ scale: 0, rotate: 45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                                >
                                  <XCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
                                </motion.div>
                              )}
                            </div>
                            <AnimatePresence>
                              {explanation && (
                                <motion.p
                                  className={`mt-3 text-xs leading-relaxed pl-14 ${
                                    isCorrectOpt ? "text-emerald-600" : isSelectedOpt ? "text-red-600" : "text-gray-400"
                                  }`}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  transition={{ delay: 0.4 + i * 0.08 }}
                                >
                                  {explanation}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      }

                      // === ANSWERED but no feedback yet ===
                      if (isCurrentAnswered) {
                        return (
                          <motion.div
                            key={opt}
                            className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 cursor-not-allowed ${
                              isSelected
                                ? `${colors.activeBg} ${colors.activeBorder}`
                                : "bg-gray-50 border-gray-100 opacity-40"
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: isSelected ? 1 : 0.4, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <span className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black shrink-0 mt-0.5 shadow-sm ${
                              isSelected ? `${colors.badge} text-white` : "bg-gray-200 text-gray-400"
                            }`}>
                              {OPTION_LABELS[i]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-relaxed ${isSelected ? "text-gray-800 font-semibold" : "text-gray-400"}`}>
                                {label}
                              </p>
                            </div>
                            {isSelected && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Lock size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      }

                      // === NORMAL INTERACTIVE MODE ===
                      return (
                        <motion.button
                          key={opt}
                          type="button"
                          disabled={isCurrentAnswering}
                          onClick={() =>
                            setSelectedOption((prev) => ({
                              ...prev,
                              [currentQuiz.id]: opt,
                            }))
                          }
                          className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-colors group ${
                            isSelected
                              ? `${colors.activeBg} ${colors.activeBorder} shadow-md`
                              : `bg-white border-gray-200 ${colors.hoverBg} hover:border-gray-300 hover:shadow-sm`
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08, type: "spring", stiffness: 250 }}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.span
                            className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black shrink-0 mt-0.5 shadow-sm ${
                              isSelected
                                ? `${colors.badge} text-white`
                                : "bg-gray-100 text-gray-400"
                            }`}
                            animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {OPTION_LABELS[i]}
                          </motion.span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${isSelected ? "text-gray-800 font-semibold" : "text-gray-600"}`}>
                              {label}
                            </p>
                          </div>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <CheckCircle2 size={22} className="text-indigo-500 shrink-0 mt-0.5" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Wrong answer summary */}
                  <AnimatePresence>
                    {currentFeedback && !currentFeedback.is_correct && currentFeedback.selected_option && currentFeedback.correct_option && (
                      <motion.div
                        className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200"
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p className="text-xs text-gray-600 font-medium">
                          Jawaban kamu: <span className="text-red-500 font-black">{currentFeedback.selected_option.toUpperCase()}</span>
                          {" · "}
                          Jawaban benar: <span className="text-emerald-500 font-black">{currentFeedback.correct_option.toUpperCase()}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ===== BOTTOM NAV ===== */}
            <motion.div
              className="sticky bottom-0 border-t border-gray-100 bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <motion.button
                  type="button"
                  onClick={() => {
                    setSlideDirection(-1);
                    setActiveIdx((i) => Math.max(0, i - 1));
                  }}
                  disabled={activeIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={16} /> {t.myAccount.learning.prev}
                </motion.button>

                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {isReview ? (
                      <motion.button
                        key="review-result"
                        type="button"
                        onClick={() => setPhase("result")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-bold transition-colors shadow-lg shadow-indigo-200"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Award size={16} /> Lihat Hasil
                      </motion.button>
                    ) : isCurrentAnswering ? (
                      <motion.span
                        key="checking"
                        className="flex items-center gap-1.5 px-4 py-2.5 text-indigo-500 text-sm font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 size={14} className="animate-spin" /> Memeriksa...
                      </motion.span>
                    ) : isCurrentAnswered && currentFeedback && allAnswered ? (
                      <motion.button
                        key="finish"
                        type="button"
                        onClick={handleFinish}
                        disabled={finishing}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white text-sm font-bold transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {finishing ? <Loader2 size={14} className="animate-spin" /> : <PartyPopper size={16} />}
                        Selesai & Lihat Hasil
                      </motion.button>
                    ) : isCurrentAnswered && currentFeedback ? (
                      <motion.button
                        key="next"
                        type="button"
                        onClick={goToNextUnanswered}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-bold transition-colors shadow-lg shadow-indigo-200"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Soal Berikutnya <ChevronRight size={16} />
                      </motion.button>
                    ) : isCurrentAnswered ? (
                      <motion.span
                        key="answered"
                        className="flex items-center gap-1.5 px-4 py-2.5 text-green-500 text-sm font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Lock size={14} /> Terjawab
                      </motion.span>
                    ) : selectedOption[currentQuiz?.id] != null ? (
                      <motion.button
                        key="submit"
                        type="button"
                        onClick={submitAnswer}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-sm font-bold transition-colors shadow-lg shadow-amber-200"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckCircle2 size={16} /> Jawab
                      </motion.button>
                    ) : null}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="button"
                  onClick={() => {
                    setSlideDirection(1);
                    setActiveIdx((i) => Math.min(quizzes.length - 1, i + 1));
                  }}
                  disabled={activeIdx === quizzes.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.myAccount.learning.next} <ChevronRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
