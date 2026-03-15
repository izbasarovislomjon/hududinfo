import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  listChecklistPrograms,
  listChecklistQuestions,
  submitChecklistLocal,
  subscribeToLocalBackend,
  type ChecklistAnswer,
  type ChecklistProgramView,
  type LocalChecklistQuestion,
} from "@/lib/local-backend";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Loader2,
} from "lucide-react";

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 px-4 py-2 max-w-2xl mx-auto w-full">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{
            background:
              index < step
                ? "hsl(221 83% 47%)"
                : index === step
                ? "hsl(221 83% 47% / 0.35)"
                : "hsl(214 20% 88%)",
          }}
        />
      ))}
    </div>
  );
}

export default function Checklist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [programs, setPrograms] = useState<ChecklistProgramView[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(searchParams.get("program"));
  const [questions, setQuestions] = useState<LocalChecklistQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, ChecklistAnswer | null>>({});
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const nextPrograms = await listChecklistPrograms(user?.id ?? null);
      setPrograms(nextPrograms);
      setLoading(false);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [user?.id]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedProgramId) {
        setQuestions([]);
        return;
      }
      const nextQuestions = await listChecklistQuestions(selectedProgramId);
      setQuestions(nextQuestions);
      if (step === 0) setStep(1);
    };

    void loadQuestions();
  }, [selectedProgramId]);

  const selectedProgram = programs.find((program) => program.id === selectedProgramId) ?? null;
  const answeredCount = Object.values(answers).filter((value) => value !== null).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleSubmit = async () => {
    if (!user || !selectedProgramId || !allAnswered) return;

    const submission = await submitChecklistLocal({
      userId: user.id,
      programId: selectedProgramId,
      answers: questions.map((question) => ({
        questionId: question.id,
        answer: (answers[question.id] ?? "no") as ChecklistAnswer,
      })),
    });

    setEarnedPoints(submission.earnedPoints);
    setYesCount(submission.yesCount);
    setNoCount(submission.noCount);
    setDone(true);
    setStep(2);
  };

  const resetFlow = () => {
    setSelectedProgramId(null);
    setQuestions([]);
    setAnswers({});
    setDone(false);
    setEarnedPoints(0);
    setYesCount(0);
    setNoCount(0);
    setStep(0);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container-gov py-16 text-center">
          <h1 className="text-2xl font-bold mb-3">Checklist</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Checklist ballari va tarixini saqlash uchun tizimga kiring.
          </p>
          <Button onClick={() => navigate("/auth")}>Kirish</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="flex items-center justify-center py-28">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (done && selectedProgram) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container-gov py-10 max-w-md mx-auto flex flex-col items-center text-center">
          <div
            className="h-24 w-24 rounded-full flex items-center justify-center mb-5 text-5xl shadow-lg"
            style={{ background: selectedProgram.bg, border: `2px solid ${selectedProgram.borderColor}` }}
          >
            {selectedProgram.emoji}
          </div>

          <h1 className="text-2xl font-bold mb-1">Tekshiruv yakunlandi!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {selectedProgram.name} bo'yicha monitoring saqlandi
          </p>

          <div
            className="w-full rounded-2xl p-6 mb-5 text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${selectedProgram.color}f0 0%, ${selectedProgram.color}99 100%)` }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <p className="text-sm font-semibold opacity-90">Siz topdingiz</p>
            </div>
            <p className="text-5xl font-bold mb-1">+{earnedPoints}</p>
            <p className="text-sm opacity-75">ball</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{yesCount}</p>
              <p className="text-xs text-green-800 font-medium">Muammo yo'q</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600">{noCount}</p>
              <p className="text-xs text-red-700 font-medium">Muammo topildi</p>
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl border border-border p-4 mb-6 text-left">
            <p className="text-xs font-bold text-foreground mb-3">Qanday ishlaydi?</p>
            {[
              "Checklist natijasi profil va reytingga qo'shildi",
              "Muammo topilgan savollar asosiy kuzatuv sifatida saqlandi",
              "Kerak bo'lsa shu sahifadan darhol murojaat yuborishingiz mumkin",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-3 py-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-xs text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            <button
              onClick={resetFlow}
              className="w-full h-12 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-transform"
              style={{ background: "hsl(221 83% 47%)" }}
            >
              Yangi tekshiruv boshlash
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full h-12 rounded-2xl font-semibold text-sm border border-border text-foreground active:scale-[0.98] transition-transform"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="sticky top-14 z-40 bg-white border-b border-border">
        <div className="flex items-center h-14 px-4 gap-3 max-w-2xl mx-auto w-full">
          <button
            onClick={() => {
              if (step === 0) navigate(-1);
              else {
                setStep(0);
                setSelectedProgramId(null);
                setQuestions([]);
                setAnswers({});
              }
            }}
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: "hsl(220 14% 92%)" }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-none text-foreground">
              {step === 0 ? "Dastur tanlang" : "Checklist savollari"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{step + 1}-qadam / 2</p>
          </div>
        </div>
        <StepBar step={step} total={2} />
      </div>

      {step === 0 && (
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
            Har bir checklist endi real profil tarixiga yoziladi. Ballar kamaytirildi va reytingga me'yorida qo'shiladi.
          </p>
          <div className="flex flex-col gap-3">
            {programs.map((program) => (
              <button
                key={program.id}
                onClick={() => setSelectedProgramId(program.id)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border active:scale-[0.98] transition-all duration-150 hover:shadow-sm text-left"
              >
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl" style={{ background: program.bg }}>
                  {program.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">{program.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{program.description}</p>
                  <p className="text-[11px] mt-1" style={{ color: program.color }}>
                    {program.totalCount} ta savol · maksimum {program.totalPossiblePoints} ball
                  </p>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: "hsl(215 14% 52%)" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && selectedProgram && (
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-5">
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center text-xl" style={{ background: selectedProgram.bg }}>
                {selectedProgram.emoji}
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{selectedProgram.name}</p>
                <p className="text-xs text-muted-foreground">{selectedProgram.description}</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: selectedProgram.color }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{answeredCount}/{questions.length} savolga javob berildi</p>
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">{question.text}</p>
                    <p className="text-[11px] mt-1" style={{ color: question.important ? "#dc2626" : "#64748b" }}>
                      {question.important ? "Muhim savol" : "Qo'shimcha nazorat"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "yes", label: "Ha, joyida", color: "#16a34a" },
                    { value: "no", label: "Yo'q, muammo bor", color: "#dc2626" },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.value }))}
                      className="rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all"
                      style={{
                        background: answers[question.id] === option.value ? `${option.color}12` : "white",
                        borderColor: answers[question.id] === option.value ? option.color : "hsl(214 20% 88%)",
                        color: answers[question.id] === option.value ? option.color : "hsl(215 14% 32%)",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {!allAnswered && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Barcha savollarga javob berganingizdan keyin natija saqlanadi.
            </div>
          )}

          <button
            onClick={() => void handleSubmit()}
            disabled={!allAnswered}
            className="w-full h-12 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "hsl(221 83% 47%)" }}
          >
            <ClipboardList className="h-4 w-4" />
            Tekshiruvni yakunlash
          </button>
        </div>
      )}
    </div>
  );
}
