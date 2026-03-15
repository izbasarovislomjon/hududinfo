import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboardSnapshot, subscribeToLocalBackend } from "@/lib/local-backend";
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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    completedFeedbacks: 0,
    pendingFeedbacks: 0,
    rejectedFeedbacks: 0,
    totalUsers: 0,
    totalObjects: 0,
  });

  useEffect(() => {
    const load = async () => {
      const snapshot = await getAdminDashboardSnapshot();
      setStats(snapshot);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, []);

  const pieData = [
    { name: "Bajarildi", value: stats.completedFeedbacks },
    { name: "Kutilmoqda", value: stats.pendingFeedbacks },
    { name: "Rad etildi", value: stats.rejectedFeedbacks },
  ].filter((item) => item.value > 0);

  const statCards = [
    { title: "Jami murojaatlar", value: stats.totalFeedbacks, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
    { title: "Bajarilgan", value: stats.completedFeedbacks, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { title: "Kutilmoqda", value: stats.pendingFeedbacks, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { title: "Rad etilgan", value: stats.rejectedFeedbacks, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { title: "Foydalanuvchilar", value: stats.totalUsers, icon: Users, color: "text-info", bg: "bg-info/10" },
    { title: "Ob'ektlar", value: stats.totalObjects, icon: School, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Boshqaruv paneli</h1>
          <p className="text-muted-foreground">Mahalliy demo ma'lumotlari real vaqtga yaqin yangilanadi.</p>
        </div>

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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" /> Murojaatlar holati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Demo holati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>- Rad etilgan murojaatlar foydalanuvchi reytingiga manfiy ta'sir qiladi.</p>
              <p>- Ovozlar bir foydalanuvchi uchun bir martalik va backend holatida saqlanadi.</p>
              <p>- Checklist ballari endi pastroq va real profilingizga yoziladi.</p>
              <p>- News va feedbacklar localhost ichida dinamik saqlanadi.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
