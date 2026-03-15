import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserRank, getLocalLeaderboard, subscribeToLocalBackend, type LeaderboardEntry } from "@/lib/local-backend";
import {
  Trophy,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Crown,
  AlertTriangle,
} from "lucide-react";

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const colors = ["#F59E0B", "#9CA3AF", "#CD7F32"];
    const backgrounds = ["#FFFBEB", "#F9FAFB", "#FFF7ED"];
    return (
      <div
        className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: backgrounds[rank - 1], border: `2px solid ${colors[rank - 1]}55` }}
      >
        <Crown className="h-4 w-4" style={{ color: colors[rank - 1] }} />
      </div>
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-muted-foreground">{rank}</span>
    </div>
  );
}

function InitialAvatar({ name, rank }: { name: string; rank: number }) {
  const initial = name.charAt(0).toUpperCase();
  const palettes = [
    { bg: "#DBEAFE", color: "#1D4ED8" },
    { bg: "#D1FAE5", color: "#065F46" },
    { bg: "#EDE9FE", color: "#5B21B6" },
    { bg: "#FCE7F3", color: "#9D174D" },
    { bg: "#FEF3C7", color: "#92400E" },
  ];
  const palette = palettes[rank % palettes.length];
  return (
    <div
      className="h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ background: palette.bg, color: palette.color }}
    >
      {initial}
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const entries = await getLocalLeaderboard();
      setLeaderboard(entries);
      setUserRank(user ? await getCurrentUserRank(user.id) : null);
      setLoading(false);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const currentUserEntry = user ? leaderboard.find((entry) => entry.id === user.id) : null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <section
        className="text-white py-7 px-4"
        style={{ background: "linear-gradient(135deg, hsl(221 83% 47%) 0%, hsl(258 70% 50%) 100%)" }}
      >
        <div className="container-gov">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga
          </button>
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <h1 className="text-2xl font-bold">Fuqarolar reytingi</h1>
          </div>
          <p className="text-white/70 text-sm">Reyting endi real murojaat, ovoz, checklist va rad etilgan holatlar bilan hisoblanadi.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { icon: MessageSquare, label: "Murojaat", points: "+2" },
              { icon: ThumbsUp, label: "Ovoz", points: "+1" },
              { icon: CheckCircle2, label: "Hal qilindi", points: "+10" },
              { icon: AlertTriangle, label: "Rad etildi", points: "-10" },
            ].map(({ icon: Icon, label, points }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
                <Icon className="h-3.5 w-3.5 text-white/80" />
                <span className="text-xs text-white/80">{label}</span>
                <span className="text-xs font-bold text-yellow-300">{points}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-gov py-5 space-y-5">
        {user && currentUserEntry && userRank && (
          <div className="rounded-2xl border-2 p-4 flex items-center gap-3" style={{ borderColor: "hsl(221 83% 47% / 0.4)", background: "hsl(221 83% 47% / 0.05)" }}>
            <RankBadge rank={userRank} />
            <InitialAvatar name={currentUserEntry.name} rank={userRank} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm line-clamp-1">Sizning o'rningiz: {userRank}-o'rin</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {currentUserEntry.titleEmoji} {currentUserEntry.titleLabel} · {currentUserEntry.reputationPoints} ball
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 items-end">
          {top3.map((entry, index) => {
            const rank = index + 1;
            const heights = rank === 1 ? "h-28" : rank === 2 ? "h-20" : "h-16";
            const order = rank === 1 ? "order-2" : rank === 2 ? "order-1" : "order-3";
            const medalBg = rank === 1 ? "#FFFBEB" : rank === 2 ? "#F9FAFB" : "#FFF7ED";
            return (
              <div key={entry.id} className={`flex flex-col items-center gap-2 ${order}`}>
                <InitialAvatar name={entry.name} rank={rank} />
                <div className="text-center">
                  <p className="font-bold text-sm line-clamp-1 max-w-[90px]">{entry.name.split(" ")[0]}</p>
                  <p
                    className="mx-auto mt-0.5 max-w-[120px] text-[10px] font-semibold leading-tight text-center"
                    style={{ color: entry.titleColor }}
                  >
                    {entry.titleEmoji} {entry.titleLabel}
                  </p>
                  <p className="text-xs font-bold" style={{ color: entry.titleColor }}>
                    {entry.reputationPoints} ball
                  </p>
                </div>
                <div className={`w-full ${heights} rounded-t-xl flex flex-col items-center justify-center`} style={{ background: medalBg }}>
                  <Crown className="h-5 w-5" style={{ color: entry.titleColor }} />
                  <span className="text-[10px] mt-1 font-semibold">{entry.titleEmoji}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {rest.map((entry, index) => {
            const rank = index + 4;
            return (
              <div key={entry.id} className="px-4 py-3.5 border-b border-border/60 last:border-0 flex items-center gap-3">
                <RankBadge rank={rank} />
                <InitialAvatar name={entry.name} rank={rank} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{entry.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {entry.titleEmoji} {entry.titleLabel} · {entry.feedbacks} murojaat · {entry.votes} ovoz · {entry.checklistPoints} checklist ball
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm" style={{ color: entry.titleColor }}>{entry.reputationPoints}</p>
                  <p className="text-[10px] text-muted-foreground">ball</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
