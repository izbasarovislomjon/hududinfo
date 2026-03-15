import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  getFeedbackDetail,
  listFeedbackHistory,
  subscribeToLocalBackend,
  voteForFeedback,
  type FeedbackView,
} from "@/lib/local-backend";
import { issueTypeLabels, statusLabels, type FeedbackStatus } from "@/lib/types";
import { reportValidityLabels } from "@/lib/report-validation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MapPin,
  RotateCcw,
  ThumbsUp,
  User,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

const statusIcons: Record<FeedbackStatus, React.ElementType> = {
  submitted: Circle,
  reviewing: RotateCcw,
  in_progress: AlertCircle,
  completed: CheckCircle2,
  rejected: XCircle,
};

const statusStyles: Record<
  FeedbackStatus,
  { color: string; bg: string; border: string }
> = {
  submitted: {
    color: "hsl(39 96% 46%)",
    bg: "hsl(39 96% 56% / 0.1)",
    border: "hsl(39 96% 56% / 0.5)",
  },
  reviewing: {
    color: "hsl(205 78% 45%)",
    bg: "hsl(205 78% 55% / 0.1)",
    border: "hsl(205 78% 55% / 0.5)",
  },
  in_progress: {
    color: "hsl(280 57% 52%)",
    bg: "hsl(280 57% 62% / 0.1)",
    border: "hsl(280 57% 62% / 0.5)",
  },
  completed: {
    color: "hsl(152 65% 36%)",
    bg: "hsl(152 65% 46% / 0.1)",
    border: "hsl(152 65% 46% / 0.5)",
  },
  rejected: {
    color: "hsl(4 82% 52%)",
    bg: "hsl(4 82% 62% / 0.1)",
    border: "hsl(4 82% 62% / 0.5)",
  },
};

interface HistoryItem {
  id: string;
  feedbackId: string;
  status: FeedbackStatus;
  comment: string | null;
  changedBy: string | null;
  createdAt: string;
}

export default function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackView | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setFeedback(null);
        setHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const [detail, timeline] = await Promise.all([
        getFeedbackDetail(id),
        listFeedbackHistory(id),
      ]);
      setFeedback(detail);
      setHistory(timeline as HistoryItem[]);
      setLoading(false);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container-gov py-16 text-center">
          <h1 className="mb-3 text-2xl font-bold">Murojaat topilmadi</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Bu murojaat mavjud emas yoki o'chirilgan.
          </p>
          <Button onClick={() => navigate("/feedbacks")}>Murojaatlarga qaytish</Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[feedback.status];
  const statusStyle = statusStyles[feedback.status];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <section className="bg-primary text-white py-6 px-4">
        <div className="container-gov">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm text-white/75 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary">{issueTypeLabels[feedback.issue_type]}</Badge>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: statusStyle.bg, color: statusStyle.color }}
            >
              <StatusIcon className="h-3 w-3" />
              {statusLabels[feedback.status]}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{feedback.object_name}</h1>
          <p className="text-sm text-white/75 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {feedback.object_district}, {feedback.object_region}
          </p>
        </div>
      </section>

      <div className="container-gov py-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold">Muammo tavsifi</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feedback.description}
            </p>

            {feedback.admin_comment && (
              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-sm text-foreground">
                <span className="font-semibold text-primary">Admin javobi: </span>
                {feedback.admin_comment}
              </div>
            )}

            {feedback.validation && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-sm">
                <p className="font-semibold text-foreground mb-1">AI tekshiruv</p>
                <p className="text-muted-foreground mb-1">{feedback.validation.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {reportValidityLabels[feedback.validation.validity]} · {feedback.validation.confidence}% · {feedback.validation.source}
                </p>
              </div>
            )}

            <Separator className="my-4" />

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {feedback.is_anonymous ? "Anonim" : feedback.author_name || feedback.submitter.name}
              </span>
              <span
                className="font-semibold"
                style={{ color: feedback.submitter.titleColor }}
              >
                {feedback.submitter.titleEmoji} {feedback.submitter.titleLabel}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {format(new Date(feedback.created_at), "d MMMM yyyy, HH:mm", { locale: uz })}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant={feedback.has_voted ? "secondary" : "outline"}
                disabled={feedback.has_voted || voting || !user}
                onClick={async () => {
                  if (!user) return;
                  setVoting(true);
                  try {
                    await voteForFeedback(feedback.id, user.id);
                  } finally {
                    setVoting(false);
                  }
                }}
                className="gap-2"
              >
                <ThumbsUp className={`h-4 w-4 ${feedback.has_voted ? "fill-current" : ""}`} />
                {feedback.votes} ovoz
              </Button>

              <Link to={`/object/${feedback.object_id}`}>
                <Button variant="outline">Ob'ekt sahifasi</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Holat tarixi</h2>
            <div className="space-y-4">
              {history.map((item, index) => {
                const HistoryIcon = statusIcons[item.status];
                const style = statusStyles[item.status];
                const isLast = index === history.length - 1;
                return (
                  <div key={item.id} className="relative flex gap-3">
                    {!isLast && (
                      <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-border" />
                    )}
                    <div
                      className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ background: style.bg, color: style.color }}
                    >
                      <HistoryIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {statusLabels[item.status]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "d MMM, HH:mm", { locale: uz })}
                        </span>
                      </div>
                      {item.comment && (
                        <p className="mt-1 text-xs text-muted-foreground">{item.comment}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
