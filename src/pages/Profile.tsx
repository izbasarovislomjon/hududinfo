import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getLocalProfile, subscribeToLocalBackend } from "@/lib/local-backend";
import {
  User,
  Phone,
  Mail,
  MessageSquare,
  ThumbsUp,
  Clock,
  CheckCircle2,
  Trophy,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { statusLabels, issueTypeLabels } from "@/lib/types";

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<Awaited<ReturnType<typeof getLocalProfile>> | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setProfileData(null);
        return;
      }

      const data = await getLocalProfile(user.id);
      setProfileData(data);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [user?.id]);

  if (!user || !profileData) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container-gov py-16 text-center">
          <h1 className="text-2xl font-bold mb-3">Profil</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Profil ma'lumotlarini ko'rish uchun tizimga kiring.
          </p>
          <Link to="/auth">
            <Card className="inline-flex px-6 py-3 hover:shadow-md transition-shadow cursor-pointer">
              Kirish
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  const { stats, feedbacks, checklistSummary, rank } = profileData;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b py-8">
        <div className="container-gov">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{user.full_name}</h1>
              <p className="font-semibold text-sm mb-1.5 flex items-center gap-1.5">
                <span className="text-base">{user.titleEmoji}</span>
                <span style={{ color: user.titleColor }}>{user.titleLabel}</span>
                <span className="text-muted-foreground font-normal text-xs">· {user.reputationPoints} ball</span>
              </p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                {user.phone}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-gov py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Link to="/leaderboard">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Fuqarolar reytingi</p>
                    <p className="text-xs text-muted-foreground">Sizning o'rningiz: {rank ?? "—"}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistika</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm">Jami murojaatlar</span>
                  </div>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Hal qilingan</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Kutilmoqda</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Rad etilgan</span>
                  </div>
                  <span className="font-bold text-red-600">{stats.rejected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Jami ovozlar</span>
                  </div>
                  <span className="font-bold text-blue-600">{stats.totalVotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Checklist ballari</span>
                  </div>
                  <span className="font-bold text-amber-600">{stats.checklistPoints}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="feedbacks">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="feedbacks" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Murojaatlarim ({feedbacks.length})
                </TabsTrigger>
                <TabsTrigger value="checklist" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Tekshiruvlar ({checklistSummary.totalSubmissions})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feedbacks">
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <Card key={feedback.id} className="overflow-hidden">
                      <div
                        className="h-1 w-full"
                        style={{
                          background:
                            feedback.status === "completed"
                              ? "#22c55e"
                              : feedback.status === "rejected"
                              ? "#ef4444"
                              : feedback.status === "in_progress"
                              ? "#a855f7"
                              : feedback.status === "reviewing"
                              ? "#3b82f6"
                              : "#f59e0b",
                        }}
                      />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {issueTypeLabels[feedback.issue_type]}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {statusLabels[feedback.status]}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(feedback.created_at).toLocaleDateString("uz-UZ")}
                          </span>
                        </div>
                        <p className="text-sm font-semibold mb-1">{feedback.object_name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {feedback.description}
                        </p>
                        {feedback.admin_comment && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 mb-3">
                            <p className="text-xs font-semibold text-blue-700 mb-0.5">Admin izohi:</p>
                            <p className="text-xs text-blue-900 leading-relaxed">{feedback.admin_comment}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {feedback.votes} ovoz
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: feedback.submitter.titleColor }}
                          >
                            {feedback.submitter.titleEmoji} {feedback.submitter.titleLabel}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="checklist">
                <div className="space-y-4">
                  {checklistSummary.submissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{submission.programId}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleDateString("uz-UZ")}
                          </p>
                        </div>
                        <Badge variant="secondary">+{submission.earnedPoints} ball</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
