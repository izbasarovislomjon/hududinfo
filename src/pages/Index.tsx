import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import {
  GraduationCap,
  Baby,
  Stethoscope,
  Droplets,
  Construction,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Circle,
  XCircle,
  RotateCcw,
  ClipboardCheck,
  MessageSquarePlus,
  Loader2,
  ArrowRight,
  TrendingUp,
  User,
  Flame,
  MapPin,
  Clock,
  ThumbsUp,
  Trophy,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import type { ObjectType, FeedbackStatus, IssueType } from "@/lib/types";
import { getIndexSnapshot, subscribeToLocalBackend } from "@/lib/local-backend";
import {
  fetchGeoasrOverview,
  GEOASR_DATASET_LABELS,
  GEOASR_ISSUE_LABELS,
  type GeoasrDatasetSummary,
  type GeoasrOverview,
  type GeoasrUnifiedObject,
} from "@/lib/geoasr-api";

// ── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ObjectType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  school: {
    label: "Maktablar",
    icon: GraduationCap,
    color: "#1A56DB",
    bg: "#EFF4FF",
  },
  kindergarten: {
    label: "Bog'chalar",
    icon: Baby,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  clinic: {
    label: "Poliklinikalar",
    icon: Stethoscope,
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  water: {
    label: "Suv ta'minoti",
    icon: Droplets,
    color: "#0891B2",
    bg: "#ECFEFF",
  },
  road: {
    label: "Yo'llar",
    icon: Construction,
    color: "#D97706",
    bg: "#FFFBEB",
  },
};

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  FeedbackStatus,
  { color: string; bg: string; icon: React.ElementType; label: string }
> = {
  submitted: {
    color: "hsl(39 96% 46%)",
    bg: "hsl(39 96% 46% / 0.1)",
    icon: Circle,
    label: "Qabul qilindi",
  },
  reviewing: {
    color: "hsl(205 78% 48%)",
    bg: "hsl(205 78% 48% / 0.1)",
    icon: RotateCcw,
    label: "Ko'rib chiqilmoqda",
  },
  in_progress: {
    color: "hsl(280 57% 55%)",
    bg: "hsl(280 57% 55% / 0.1)",
    icon: AlertCircle,
    label: "Bajarilmoqda",
  },
  completed: {
    color: "hsl(152 60% 38%)",
    bg: "hsl(152 60% 38% / 0.1)",
    icon: CheckCircle2,
    label: "Bajarildi",
  },
  rejected: {
    color: "hsl(4 78% 54%)",
    bg: "hsl(4 78% 54% / 0.1)",
    icon: XCircle,
    label: "Rad etildi",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface RecentFeedback {
  id: string;
  description: string;
  status: FeedbackStatus;
  issue_type: IssueType;
  votes: number;
  created_at: string;
  object_name: string;
  object_type: ObjectType;
}

interface UserFeedback {
  id: string;
  description: string;
  status: FeedbackStatus;
  issue_type: string;
  created_at: string;
  object_name: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: number | string; label: string }) {
  return (
    <div
      className="flex-1 rounded-2xl py-3 px-2 text-center"
      style={{ background: "rgba(255,255,255,0.13)" }}
    >
      <p className="text-[22px] font-bold text-white leading-none mb-0.5">
        {value}
      </p>
      <p
        className="text-[11px] font-medium"
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        {label}
      </p>
    </div>
  );
}

function ReportCard({ feedback }: { feedback: RecentFeedback }) {
  const cfg = STATUS_CONFIG[feedback.status];
  const typeCfg = TYPE_CONFIG[feedback.object_type] ?? TYPE_CONFIG.school;
  const StatusIcon = cfg.icon;

  return (
    <Link to={`/feedbacks/${feedback.id}`} className="block bg-white rounded-xl border border-border overflow-hidden transition-all hover:shadow-md">
      <div className="p-3.5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: typeCfg.bg }}
            >
              <typeCfg.icon
                style={{ width: 14, height: 14, color: typeCfg.color }}
              />
            </div>
            <p className="text-xs font-semibold text-foreground truncate">
              {feedback.object_name}
            </p>
          </div>
          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            <StatusIcon style={{ width: 10, height: 10 }} />
            {cfg.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
          {feedback.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp style={{ width: 11, height: 11 }} />
            {feedback.votes}
          </span>
          <span className="flex items-center gap-1">
            <Clock style={{ width: 11, height: 11 }} />
            {formatDistanceToNow(new Date(feedback.created_at), {
              addSuffix: true,
              locale: uz,
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}

function UserReportRow({ feedback }: { feedback: UserFeedback }) {
  const cfg = STATUS_CONFIG[feedback.status];
  const StatusIcon = cfg.icon;
  return (
    <Link to={`/feedbacks/${feedback.id}`} className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-0 transition-colors hover:bg-muted/20">
      <div
        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: cfg.bg }}
      >
        <StatusIcon style={{ width: 15, height: 15, color: cfg.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate">
          {feedback.object_name}
        </p>
        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
          {feedback.description}
        </p>
      </div>
      <span
        className="text-[10px] font-bold shrink-0"
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </Link>
  );
}

function LiveMonitoringCard({
  summary,
  onOpen,
}: {
  summary: GeoasrDatasetSummary;
  onOpen: () => void;
}) {
  const typeCfg = TYPE_CONFIG[summary.uiType] ?? TYPE_CONFIG.school;
  const Icon = typeCfg.icon;
  const healthyShare = Math.max(100 - summary.issueRate, 0);

  return (
    <div className="px-4 py-3.5 border-b border-border/60 last:border-0">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: typeCfg.bg }}
          >
            <Icon style={{ width: 18, height: 18, color: typeCfg.color }} />
          </div>
          <div>
            <p className="font-semibold text-sm leading-none mb-0.5">
              {summary.label}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {summary.issueObjects} ta muammoli ob'ekt aniqlangan
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold leading-none" style={{ color: typeCfg.color }}>
            {healthyShare}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {summary.healthyObjects}/{summary.total}
          </p>
        </div>
      </div>

      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${healthyShare}%`, background: typeCfg.color }}
        />
      </div>

      <button
        onClick={onOpen}
        className="flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-transform"
        style={{ color: typeCfg.color }}
      >
        Statistikani ko'rish
        <ArrowRight style={{ width: 13, height: 13 }} />
      </button>
    </div>
  );
}

function UrgentObjectCard({
  object,
  onOpen,
}: {
  object: GeoasrUnifiedObject;
  onOpen: () => void;
}) {
  const typeCfg = TYPE_CONFIG[object.uiType] ?? TYPE_CONFIG.school;
  const Icon = typeCfg.icon;

  return (
    <button
      onClick={onOpen}
      className="text-left rounded-2xl border border-border bg-white p-4 transition-all duration-150 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: typeCfg.bg }}
          >
            <Icon style={{ width: 18, height: 18, color: typeCfg.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground line-clamp-1">
              {object.name}
            </p>
            <p className="text-[11px] text-muted-foreground">{GEOASR_DATASET_LABELS[object.sourceType]}</p>
          </div>
        </div>
        <span
          className="rounded-full px-2 py-1 text-[10px] font-bold"
          style={{ background: `${typeCfg.color}14`, color: typeCfg.color }}
        >
          {object.issueCount} ta muammo
        </span>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
        <MapPin style={{ width: 12, height: 12 }} />
        {object.district}, {object.region}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {object.issues.slice(0, 3).map((issue) => (
          <span
            key={issue}
            className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
          >
            {GEOASR_ISSUE_LABELS[issue]}
          </span>
        ))}
      </div>

      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: typeCfg.color }}>
        Batafsil ko'rish
        <ArrowRight style={{ width: 13, height: 13 }} />
      </span>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [totalObjects, setTotalObjects] = useState(0);
  const [typeCounts, setTypeCounts] = useState<Record<ObjectType, number>>({
    school: 0,
    kindergarten: 0,
    clinic: 0,
    water: 0,
    road: 0,
  });
  const [geoOverview, setGeoOverview] = useState<GeoasrOverview | null>(null);
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedback[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<UserFeedback[]>([]);

  useEffect(() => {
    void loadData();
    const unsubscribe = subscribeToLocalBackend(() => {
      void loadData();
    });
    return unsubscribe;
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [snapshot, liveOverview] = await Promise.all([
        getIndexSnapshot(user?.id ?? null),
        fetchGeoasrOverview(),
      ]);

      setGeoOverview(liveOverview);
      setTotalObjects(snapshot.totalObjects);
      setTypeCounts(snapshot.typeCounts);
      setRecentFeedbacks(snapshot.recentFeedbacks);
      setUserFeedbacks(snapshot.userFeedbacks);
    } catch (error) {
      console.error("Index data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Yuklanmoqda…</p>
      </div>
    );
  }

  const healthyFacilityRate =
    geoOverview && geoOverview.totalObjects > 0
      ? Math.round((geoOverview.healthyObjects / geoOverview.totalObjects) * 100)
      : 0;
  const liveMonitoring = geoOverview?.datasetSummary ?? [];
  const urgentObjects = geoOverview?.topIssueObjects.slice(0, 4) ?? [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, hsl(221 83% 50%) 0%, hsl(230 80% 38%) 100%)",
        }}
      >
        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="container-gov py-6 pb-12 relative z-10">
          {/* Greeting */}
          <p
            className="text-sm font-medium mb-0.5"
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            Xush kelibsiz 👋
          </p>
          <h1 className="text-white text-[22px] font-bold leading-snug mb-1">
            Hududingizdagi holat
          </h1>
          <p
            className="text-sm mb-5"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Muammo? 30 soniyada bildiring
          </p>

          {/* Action buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => navigate("/checklist")}
              className="flex-1 bg-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-sm"
              style={{ color: "hsl(221 83% 47%)" }}
            >
              <ClipboardCheck style={{ width: 17, height: 17 }} />
              Tekshiruv
            </button>
            <button
              onClick={() => navigate("/submit")}
              className="flex-1 font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform text-white"
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1.5px solid rgba(255,255,255,0.28)",
              }}
            >
              <MessageSquarePlus style={{ width: 17, height: 17 }} />
              Murojaat
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex gap-3">
            <StatPill value={totalObjects} label="Muassasa" />
            <StatPill value={geoOverview?.issueObjects ?? 0} label="Muammo" />
            <StatPill value={`${healthyFacilityRate}%`} label="Barqaror" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIVE MONITORING (overlaps hero)
      ══════════════════════════════════════════════ */}
      <div className="container-gov -mt-5 relative z-20 mb-1">
        <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
              <TrendingUp
                style={{ width: 15, height: 15, color: "hsl(221 83% 47%)" }}
              />
              Jonli monitoring
            </h2>
            <span className="text-[11px] text-muted-foreground font-medium">
              {liveMonitoring.length} ta manba
            </span>
          </div>

          {geoOverview && Object.keys(geoOverview.errors).length > 0 && (
            <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Ayrim manbalar vaqtincha javob bermadi. Bosh sahifa mavjud
              ma'lumotlar bilan yangilandi.
            </div>
          )}

          {liveMonitoring.map((summary) => (
            <LiveMonitoringCard
              key={summary.type}
              summary={summary}
              onOpen={() => navigate("/statistics")}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          INSTITUTION CATEGORIES
      ══════════════════════════════════════════════ */}
      <section className="container-gov mt-4 mb-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-foreground">
            Muassasa turlari
          </h2>
          <Link
            to="/submit"
            className="text-xs font-semibold flex items-center gap-0.5"
            style={{ color: "hsl(221 83% 47%)" }}
          >
            Murojaat yuborish
            <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {(
            Object.entries(TYPE_CONFIG) as [
              ObjectType,
              (typeof TYPE_CONFIG)[ObjectType],
            ][]
          ).map(([type, cfg]) => {
            const count = typeCounts[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => navigate(`/submit?type=${type}`)}
                className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl border border-border bg-white active:scale-95 transition-all duration-150 hover:shadow-sm"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: cfg.bg }}
                >
                  <Icon style={{ width: 20, height: 20, color: cfg.color }} />
                </div>
                <span
                  className="text-[10px] font-semibold leading-tight text-center"
                  style={{ color: cfg.color }}
                >
                  {cfg.label.split(" ")[0]}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: cfg.color, opacity: 0.65 }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIVE PRIORITIES
      ══════════════════════════════════════════════ */}
      <section className="container-gov mt-4 mb-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <AlertTriangle
              style={{ width: 15, height: 15, color: "hsl(3 78% 54%)" }}
            />
            Dolzarb ob'ektlar
          </h2>
          <Link
            to="/statistics"
            className="text-xs font-semibold flex items-center gap-0.5"
            style={{ color: "hsl(221 83% 47%)" }}
          >
            Xarita va statistika
            <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        {urgentObjects.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
            Jonli GEOASR ob'ektlari yuklanmoqda.
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {urgentObjects.map((object) => (
              <UrgentObjectCard
                key={object.id}
                object={object}
                onOpen={() => navigate(`/object/${object.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════
          MY ACTIVITY
      ══════════════════════════════════════════════ */}
        <section className="container-gov mt-4 mb-1">
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Flame
                  style={{ width: 15, height: 15, color: "hsl(36 90% 48%)" }}
                />
                Mening faoliyatim
              </h2>
              <Link
                to="/profile"
                className="text-xs font-semibold flex items-center gap-0.5"
                style={{ color: "hsl(221 83% 47%)" }}
              >
                Barchasi
                <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            </div>

            {user ? (
              <>
                <div
                  className="flex items-center gap-3 px-4 py-3 border-b border-border/60"
                  style={{ background: "hsl(221 83% 47% / 0.04)" }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "hsl(221 83% 47% / 0.15)" }}
                  >
                    <User
                      style={{ width: 18, height: 18, color: "hsl(221 83% 47%)" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.email}
                    </p>
                    <p className="text-xs" style={{ color: user.titleColor }}>
                      {user.titleEmoji} {user.titleLabel}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className="text-lg font-bold leading-none"
                      style={{ color: "hsl(36 90% 44%)" }}
                    >
                      {user.reputationPoints}
                    </p>
                    <p className="text-[10px] text-muted-foreground">ball</p>
                  </div>
                </div>

                {userFeedbacks.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Hali birorta murojaat yubormadingiz
                    </p>
                    <button
                      onClick={() => navigate("/submit")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
                      style={{ background: "hsl(221 83% 47%)" }}
                    >
                      <MessageSquarePlus style={{ width: 15, height: 15 }} />
                      Murojaat yuborish
                    </button>
                  </div>
                ) : (
                  <div className="px-4">
                    {userFeedbacks.map((f) => (
                      <UserReportRow key={f.id} feedback={f} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Faoliyat tarixini ko'rish uchun tizimga kiring
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
                  style={{ background: "hsl(221 83% 47%)" }}
                >
                  <MessageSquarePlus style={{ width: 15, height: 15 }} />
                  Kirish
                </button>
              </div>
            )}
          </div>
        </section>

      {/* ══════════════════════════════════════════════
          RECENT COMMUNITY REPORTS
      ══════════════════════════════════════════════ */}
      <section className="container-gov mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
            <MapPin
              style={{ width: 14, height: 14, color: "hsl(221 83% 47%)" }}
            />
            Yangi murojaatlar
          </h2>
          <Link
            to="/feedbacks"
            className="text-xs font-semibold flex items-center gap-0.5"
            style={{ color: "hsl(221 83% 47%)" }}
          >
            Ko'proq
            <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        {recentFeedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Hozircha murojaatlar yo'q
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {recentFeedbacks.map((f) => (
              <ReportCard key={f.id} feedback={f} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 bg-white rounded-2xl border border-border p-5 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">
            Muammo ko'rdingizmi?
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Muammoingizni bildiring. Fuqarolar ovozi muhim.
          </p>
          <button
            onClick={() => navigate("/submit")}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ background: "hsl(221 83% 47%)" }}
          >
            Murojaat yuborish
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LEADERBOARD TEASER
      ══════════════════════════════════════════════ */}
      <section className="container-gov mt-4">
        <div
          className="rounded-2xl overflow-hidden relative cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => navigate("/leaderboard")}
          style={{
            background:
              "linear-gradient(135deg, hsl(258 70% 50%) 0%, hsl(221 83% 47%) 100%)",
            minHeight: 100,
          }}
        >
          {/* Star sparkles */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            {[
              { x: "8%",  y: "20%", s: 6  },
              { x: "18%", y: "70%", s: 4  },
              { x: "40%", y: "15%", s: 5  },
              { x: "55%", y: "75%", s: 4  },
              { x: "70%", y: "25%", s: 6  },
              { x: "85%", y: "60%", s: 5  },
            ].map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: star.x,
                  top: star.y,
                  width: star.s,
                  height: star.s,
                  opacity: 0.25,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy
                  style={{ width: 16, height: 16, color: "#FDE68A" }}
                />
                <p className="text-white font-bold text-base">
                  Fuqarolar reytingi
                </p>
              </div>
              <p className="text-white/60 text-xs leading-relaxed max-w-[200px]">
                Eng faol fuqarolar va ularning ballari
              </p>
              <div className="flex items-center gap-2 mt-3">
                {["🥇", "🥈", "🥉"].map((medal, i) => (
                  <span
                    key={i}
                    className="text-sm leading-none"
                    style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
                  >
                    {medal}
                  </span>
                ))}
                <span className="text-[11px] font-medium text-white/60 ml-1">
                  Top fuqarolar
                </span>
              </div>
            </div>
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <ArrowRight style={{ width: 18, height: 18, color: "white" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MAP TEASER
      ══════════════════════════════════════════════ */}
      <section className="container-gov mt-4">
        <div
          className="rounded-2xl overflow-hidden relative cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => navigate("/statistics")}
          style={{
            background:
              "linear-gradient(135deg, hsl(215 28% 14%) 0%, hsl(221 40% 22%) 100%)",
            minHeight: 120,
          }}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 100% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.3) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Mock map dots */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none">
            {[
              { x: "20%", y: "40%", c: "#ef4444" },
              { x: "35%", y: "55%", c: "#f59e0b" },
              { x: "50%", y: "35%", c: "#ef4444" },
              { x: "60%", y: "60%", c: "#22c55e" },
              { x: "72%", y: "42%", c: "#f59e0b" },
              { x: "82%", y: "58%", c: "#22c55e" },
            ].map((dot, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: dot.x,
                  top: dot.y,
                  width: 10,
                  height: 10,
                  background: dot.c,
                  boxShadow: `0 0 8px ${dot.c}`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-base mb-1">
                Muammo xaritasi
              </p>
              <p className="text-white/60 text-xs leading-relaxed max-w-[200px]">
                {geoOverview
                  ? `${geoOverview.affectedRegions} ta hududda ${geoOverview.issueObjects} ta muammoli ob'ekt aniqlangan`
                  : "Hududlardagi muammolarni xaritada ko'ring"}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="flex items-center gap-1 text-[11px] font-medium text-white/70">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Kritik
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-white/70">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  O'rtacha
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-white/70">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Yaxshi
                </span>
              </div>
            </div>
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <ArrowRight style={{ width: 18, height: 18, color: "white" }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
