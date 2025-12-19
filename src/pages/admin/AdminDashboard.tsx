import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  School,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalFeedbacks: number;
  completedFeedbacks: number;
  pendingFeedbacks: number;
  rejectedFeedbacks: number;
  totalUsers: number;
  totalObjects: number;
  recentFeedbacks: any[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFeedbacks: 0,
    completedFeedbacks: 0,
    pendingFeedbacks: 0,
    rejectedFeedbacks: 0,
    totalUsers: 0,
    totalObjects: 0,
    recentFeedbacks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get feedbacks count by status
      const { data: feedbacks } = await supabase
        .from("feedbacks")
        .select("id, status, created_at");

      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: objectsCount } = await supabase
        .from("infrastructure_objects")
        .select("*", { count: "exact", head: true });

      const totalFeedbacks = feedbacks?.length || 0;
      const completedFeedbacks = feedbacks?.filter((f) => f.status === "completed").length || 0;
      const pendingFeedbacks = feedbacks?.filter((f) => ["submitted", "reviewing", "in_progress"].includes(f.status || "")).length || 0;
      const rejectedFeedbacks = feedbacks?.filter((f) => f.status === "rejected").length || 0;

      setStats({
        totalFeedbacks,
        completedFeedbacks,
        pendingFeedbacks,
        rejectedFeedbacks,
        totalUsers: usersCount || 0,
        totalObjects: objectsCount || 0,
        recentFeedbacks: feedbacks?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: "Bajarildi", value: stats.completedFeedbacks },
    { name: "Kutilmoqda", value: stats.pendingFeedbacks },
    { name: "Rad etildi", value: stats.rejectedFeedbacks },
  ].filter((d) => d.value > 0);

  const statCards = [
    {
      title: "Jami murojaatlar",
      value: stats.totalFeedbacks,
      icon: MessageSquare,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Bajarilgan",
      value: stats.completedFeedbacks,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Kutilmoqda",
      value: stats.pendingFeedbacks,
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Rad etilgan",
      value: stats.rejectedFeedbacks,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      title: "Foydalanuvchilar",
      value: stats.totalUsers,
      icon: Users,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      title: "Obyektlar",
      value: stats.totalObjects,
      icon: School,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Boshqaruv paneli</h1>
          <p className="text-muted-foreground">
            Tizim holati va statistikasi
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Murojaatlar holati
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Ma'lumot yo'q
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Tizim ko'rsatkichlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Bajarilish darajasi</span>
                <span className="font-bold text-success">
                  {stats.totalFeedbacks > 0
                    ? Math.round((stats.completedFeedbacks / stats.totalFeedbacks) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Rad etilish darajasi</span>
                <span className="font-bold text-destructive">
                  {stats.totalFeedbacks > 0
                    ? Math.round((stats.rejectedFeedbacks / stats.totalFeedbacks) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">O'rtacha obyekt/user</span>
                <span className="font-bold text-primary">
                  {stats.totalUsers > 0
                    ? (stats.totalObjects / stats.totalUsers).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Kutilayotgan murojaatlar</span>
                <span className="font-bold text-warning">{stats.pendingFeedbacks}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
