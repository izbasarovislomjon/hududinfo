import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FeedbackStatus,
  IssueType,
  statusLabels,
  issueTypeLabels,
} from "@/lib/types";
import {
  listFeedbackViews,
  subscribeToLocalBackend,
  voteForFeedback,
  type FeedbackView,
} from "@/lib/local-backend";
import {
  Search,
  SlidersHorizontal,
  ThumbsUp,
  Clock,
  MessageSquare,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Circle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uz, ru } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

/* ── Status visual config ── */
const statusConfig: Record<
  FeedbackStatus,
  {
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
    label: string;
  }
> = {
  submitted: {
    color: "hsl(39 96% 56%)",
    bg: "hsl(39 96% 56% / 0.1)",
    border: "hsl(39 96% 56% / 0.5)",
    icon: Circle,
    label: "Qabul qilindi",
  },
  reviewing: {
    color: "hsl(205 78% 55%)",
    bg: "hsl(205 78% 55% / 0.1)",
    border: "hsl(205 78% 55% / 0.5)",
    icon: RotateCcw,
    label: "Ko'rib chiqilmoqda",
  },
  in_progress: {
    color: "hsl(280 57% 62%)",
    bg: "hsl(280 57% 62% / 0.1)",
    border: "hsl(280 57% 62% / 0.5)",
    icon: AlertCircle,
    label: "Amalga oshirilmoqda",
  },
  completed: {
    color: "hsl(152 65% 46%)",
    bg: "hsl(152 65% 46% / 0.1)",
    border: "hsl(152 65% 46% / 0.5)",
    icon: CheckCircle2,
    label: "Bajarildi",
  },
  rejected: {
    color: "hsl(4 82% 62%)",
    bg: "hsl(4 82% 62% / 0.1)",
    border: "hsl(4 82% 62% / 0.5)",
    icon: XCircle,
    label: "Rad etildi",
  },
};

export default function Feedbacks() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");

  const getDateLocale = () => (language === "ru" ? ru : uz);

  useEffect(() => {
    void fetchFeedbacks();
    const unsubscribe = subscribeToLocalBackend(() => {
      void fetchFeedbacks();
    });
    return unsubscribe;
  }, [user?.id]);

  const handleVote = async (feedbackId: string) => {
    if (!user) return;
    try {
      await voteForFeedback(feedbackId, user.id);
      await fetchFeedbacks();
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    const data = await listFeedbackViews({ currentUserId: user?.id ?? null });
    setFeedbacks(data);
    setLoading(false);
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.object_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || fb.status === statusFilter;
    const matchesType = typeFilter === "all" || fb.issue_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusCounts: Record<string, number> = {
    all: feedbacks.length,
    submitted: feedbacks.filter((f) => f.status === "submitted").length,
    reviewing: feedbacks.filter((f) => f.status === "reviewing").length,
    in_progress: feedbacks.filter((f) => f.status === "in_progress").length,
    completed: feedbacks.filter((f) => f.status === "completed").length,
    rejected: feedbacks.filter((f) => f.status === "rejected").length,
  };

  const quickTabs: { key: FeedbackStatus | "all"; label: string }[] = [
    { key: "all", label: t("feedbacks.all") },
    { key: "submitted", label: t("status.submitted") },
    { key: "reviewing", label: t("status.reviewing") },
    { key: "in_progress", label: t("status.in_progress") },
    { key: "completed", label: t("status.completed") },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      {/* ── PAGE HEADER ── */}
      <section className="bg-primary text-white py-6 px-4">
        <div className="container-gov">
          <h1 className="text-2xl font-bold mb-1">{t("feedbacks.title")}</h1>
          <p className="text-white/75 text-sm">{t("feedbacks.subtitle")}</p>
        </div>
      </section>

      {/* ── FILTERS BAR ── */}
      <section className="bg-white border-b border-border py-3 sticky top-14 z-30">
        <div className="container-gov space-y-3">
          {/* Search + dropdowns */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t("filter.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-background border-border text-sm rounded-lg"
              />
              {searchQuery && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status dropdown */}
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as FeedbackStatus | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-48 h-9 bg-background border-border text-sm rounded-lg">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                <SelectValue placeholder="Holati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">
                  Barchasi ({statusCounts.all})
                </SelectItem>
                {(
                  Object.entries(statusLabels) as [FeedbackStatus, string][]
                ).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm">
                    {label} ({statusCounts[key] ?? 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type dropdown */}
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as IssueType | "all")}
            >
              <SelectTrigger className="w-full sm:w-48 h-9 bg-background border-border text-sm rounded-lg">
                <MessageSquare className="h-3.5 w-3.5 mr-2 text-primary shrink-0" />
                <SelectValue placeholder="Muammo turi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">
                  Barcha turlar
                </SelectItem>
                {(Object.entries(issueTypeLabels) as [IssueType, string][]).map(
                  ([key, label]) => (
                    <SelectItem key={key} value={key} className="text-sm">
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Quick status pills */}
          <div className="flex flex-wrap gap-1.5">
            {quickTabs.map(({ key, label }) => {
              const isActive = statusFilter === key;
              const cfg =
                key !== "all" ? statusConfig[key as FeedbackStatus] : null;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150"
                  style={
                    isActive
                      ? {
                          background: cfg ? cfg.bg : "hsl(221 83% 47% / 0.1)",
                          color: cfg ? cfg.color : "hsl(221 83% 47%)",
                          borderColor: cfg
                            ? cfg.border
                            : "hsl(221 83% 47% / 0.4)",
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
                    {statusCounts[key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section className="py-6">
        <div className="container-gov">
          {/* Results count */}
          {!loading && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {filteredFeedbacks.length}
                </span>{" "}
                ta murojaat
              </span>
              {(searchQuery ||
                statusFilter !== "all" ||
                typeFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                  Filterni tozalash
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20 flex-col gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Yuklanmoqda…
              </span>
            </div>
          )}

          {/* Empty – no feedbacks at all */}
          {!loading && feedbacks.length === 0 && (
            <div className="bg-white rounded-2xl border border-border p-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">
                {t("feedbacks.no_feedbacks")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {t("feedbacks.no_feedbacks_desc")}
              </p>
            </div>
          )}

          {/* Empty – filter has no results */}
          {!loading &&
            feedbacks.length > 0 &&
            filteredFeedbacks.length === 0 && (
              <div className="text-center py-14">
                <p className="text-sm text-muted-foreground">
                  {t("feedbacks.filter_none")}
                </p>
              </div>
            )}

          {/* Cards grid */}
          {!loading && filteredFeedbacks.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeedbacks.map((feedback, idx) => {
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
                      animationDelay: `${Math.min(idx * 0.04, 0.5)}s`,
                    }}
                  >
                    <div className="p-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        {/* Issue type badge */}
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium shrink-0"
                        >
                          {t(`issue.${feedback.issue_type}`) ||
                            issueTypeLabels[feedback.issue_type]}
                        </Badge>

                        {/* Status badge */}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                          }}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {t(`status.${feedback.status}`) || cfg.label}
                        </span>
                      </div>

                      {/* Object name */}
                      <p className="font-semibold text-sm mb-1.5 line-clamp-1 text-foreground">
                        {feedback.object_name}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3 leading-relaxed">
                        {feedback.description}
                      </p>

                      {/* Meta footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/60">
                        <div className="flex items-center gap-3">
                          {/* Votes */}
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void handleVote(feedback.id);
                            }}
                            disabled={feedback.has_voted || !user}
                            aria-label="Ovoz berish"
                            className="flex items-center gap-1 text-xs font-semibold transition-all duration-150 active:scale-90 disabled:cursor-default"
                            style={{
                              color: feedback.has_voted
                                ? "hsl(221 83% 47%)"
                                : "hsl(215 14% 52%)",
                            }}
                          >
                            <ThumbsUp
                              className="h-3.5 w-3.5 transition-all duration-150"
                              style={{
                                fill: feedback.has_voted
                                  ? "hsl(221 83% 47%)"
                                  : "transparent",
                                strokeWidth: feedback.has_voted ? 2 : 1.5,
                              }}
                            />
                            <span>{feedback.votes}</span>
                          </button>

                          {/* Time */}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(
                              new Date(feedback.created_at),
                              {
                                addSuffix: true,
                                locale: getDateLocale(),
                              },
                            )}
                          </span>
                        </div>

                        {/* Author */}
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {feedback.is_anonymous ? "Anonim" : feedback.author_name || feedback.submitter.name}
                          </p>
                          <p
                            className="text-[10px] font-semibold"
                            style={{ color: feedback.submitter.titleColor }}
                          >
                            {feedback.submitter.titleEmoji} {feedback.submitter.titleLabel}
                          </p>
                        </div>
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
