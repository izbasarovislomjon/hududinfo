import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { listFeedbackViews, subscribeToLocalBackend, type FeedbackView } from "@/lib/local-backend";
import {
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  XCircle,
  RotateCcw,
  MessageSquarePlus,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { issueTypeLabels, FeedbackStatus } from "@/lib/types";

const statusConfig: Record<
  FeedbackStatus,
  { color: string; bg: string; border: string; icon: React.ElementType; label: string }
> = {
  submitted: {
    color: "hsl(39 96% 46%)",
    bg: "hsl(39 96% 56% / 0.1)",
    border: "hsl(39 96% 56% / 0.5)",
    icon: Circle,
    label: "Qabul qilindi",
  },
  reviewing: {
    color: "hsl(205 78% 45%)",
    bg: "hsl(205 78% 55% / 0.1)",
    border: "hsl(205 78% 55% / 0.5)",
    icon: RotateCcw,
    label: "Ko'rib chiqilmoqda",
  },
  in_progress: {
    color: "hsl(280 57% 52%)",
    bg: "hsl(280 57% 62% / 0.1)",
    border: "hsl(280 57% 62% / 0.5)",
    icon: AlertCircle,
    label: "Amalga oshirilmoqda",
  },
  completed: {
    color: "hsl(152 65% 36%)",
    bg: "hsl(152 65% 46% / 0.1)",
    border: "hsl(152 65% 46% / 0.5)",
    icon: CheckCircle2,
    label: "Bajarildi",
  },
  rejected: {
    color: "hsl(4 82% 52%)",
    bg: "hsl(4 82% 62% / 0.1)",
    border: "hsl(4 82% 62% / 0.5)",
    icon: XCircle,
    label: "Rad etildi",
  },
};

const FILTERS: { key: FeedbackStatus | "all"; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "submitted", label: "Qabul qilindi" },
  { key: "reviewing", label: "Ko'rib chiqilmoqda" },
  { key: "in_progress", label: "Jarayonda" },
  { key: "completed", label: "Bajarildi" },
  { key: "rejected", label: "Rad etildi" },
];

export default function MyFeedbacks() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FeedbackStatus | "all">("all");
  const [feedbacks, setFeedbacks] = useState<FeedbackView[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setFeedbacks([]);
        return;
      }

      const data = await listFeedbackViews({ userId: user.id, currentUserId: user.id });
      setFeedbacks(data);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [user?.id]);

  const filtered =
    filter === "all" ? feedbacks : feedbacks.filter((feedback) => feedback.status === filter);

  const counts: Record<string, number> = {
    all: feedbacks.length,
    submitted: feedbacks.filter((feedback) => feedback.status === "submitted").length,
    reviewing: feedbacks.filter((feedback) => feedback.status === "reviewing").length,
    in_progress: feedbacks.filter((feedback) => feedback.status === "in_progress").length,
    completed: feedbacks.filter((feedback) => feedback.status === "completed").length,
    rejected: feedbacks.filter((feedback) => feedback.status === "rejected").length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container-gov py-16 text-center">
          <h1 className="text-2xl font-bold mb-3">Mening murojaatlarim</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Murojaatlaringiz tarixini ko'rish uchun tizimga kiring.
          </p>
          <Link to="/auth">
            <Button>Kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <section className="bg-primary text-white py-6 px-4">
        <div className="container-gov flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Mening murojaatlarim</h1>
            <p className="text-white/75 text-sm">
              {user.full_name} — {feedbacks.length} ta murojaat
            </p>
          </div>
          <Link to="/submit">
            <Button variant="secondary" size="sm" className="gap-1.5 shrink-0">
              <MessageSquarePlus className="h-4 w-4" />
              Yangi murojaat
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-white border-b border-border py-3 sticky top-14 z-30">
        <div className="container-gov">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(({ key, label }) => {
              const isActive = filter === key;
              const cfg = key !== "all" ? statusConfig[key as FeedbackStatus] : null;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150"
                  style={
                    isActive
                      ? {
                          background: cfg ? cfg.bg : "hsl(221 83% 47% / 0.1)",
                          color: cfg ? cfg.color : "hsl(221 83% 47%)",
                          borderColor: cfg ? cfg.border : "hsl(221 83% 47% / 0.4)",
                        }
                      : {
                          background: "white",
                          color: "hsl(215 14% 48%)",
                          borderColor: "hsl(214 20% 88%)",
                        }
                  }
                >
                  {label}
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
                    style={{
                      background: isActive
                        ? cfg
                          ? cfg.color + "22"
                          : "hsl(221 83% 47% / 0.15)"
                        : "hsl(214 20% 92%)",
                      color: isActive
                        ? cfg
                          ? cfg.color
                          : "hsl(221 83% 47%)"
                        : "hsl(215 14% 52%)",
                    }}
                  >
                    {counts[key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container-gov">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">Murojaat topilmadi</h3>
              <p className="text-sm text-muted-foreground">Bu holat bo'yicha murojaatlar yo'q.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((feedback, index) => {
                const cfg = statusConfig[feedback.status];
                const StatusIcon = cfg.icon;
                return (
                  <Link
                    key={feedback.id}
                    to={`/feedbacks/${feedback.id}`}
                    className="bg-white rounded-xl border border-border overflow-hidden transition-all duration-150 hover:shadow-md animate-slide-up"
                    style={{
                      borderLeftWidth: "3px",
                      borderLeftColor: cfg.color,
                      animationDelay: `${Math.min(index * 0.04, 0.5)}s`,
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs font-medium shrink-0">
                          {issueTypeLabels[feedback.issue_type]}
                        </Badge>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>

                      <p className="font-semibold text-sm mb-1.5 line-clamp-1 text-foreground">
                        {feedback.object_name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                        {feedback.description}
                      </p>

                      {feedback.admin_comment && (
                        <div className="mb-3 p-2.5 rounded-lg bg-muted/60 border border-border/60 text-xs text-foreground leading-relaxed">
                          <span className="font-semibold text-primary">Admin javobi: </span>
                          {feedback.admin_comment}
                        </div>
                      )}

                      {feedback.validation && (
                        <div className="mb-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">AI tekshiruv: </span>
                          {feedback.validation.summary}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-border/60">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {feedback.votes}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(feedback.created_at), {
                              addSuffix: true,
                              locale: uz,
                            })}
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: feedback.submitter.titleColor }}
                        >
                          {feedback.submitter.titleEmoji} {feedback.submitter.titleLabel}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
