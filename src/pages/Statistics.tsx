import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/stats/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { issueTypeLabels, IssueType } from "@/lib/types";
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
  Cell
} from "recharts";
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ThumbsUp,
  AlertCircle,
  Loader2,
  Building2
} from "lucide-react";

const COLORS = ['#3b82f6', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7', '#22c55e', '#64748b'];

interface Stats {
  totalFeedbacks: number;
  resolvedFeedbacks: number;
  pendingFeedbacks: number;
  totalVotes: number;
  totalObjects: number;
  totalReviews: number;
}

interface TypeData {
  name: string;
  value: number;
}

interface DistrictData {
  name: string;
  value: number;
}

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalFeedbacks: 0,
    resolvedFeedbacks: 0,
    pendingFeedbacks: 0,
    totalVotes: 0,
    totalObjects: 0,
    totalReviews: 0,
  });
  const [typeData, setTypeData] = useState<TypeData[]>([]);
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);

    try {
      // Fetch feedbacks
      const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('status, issue_type, votes');

      // Fetch infrastructure objects with district info
      const { data: objects } = await supabase
        .from('infrastructure_objects')
        .select('district');

      // Fetch reviews count
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      if (feedbacks) {
        const total = feedbacks.length;
        const resolved = feedbacks.filter(f => f.status === 'completed').length;
        const pending = feedbacks.filter(f => f.status !== 'completed' && f.status !== 'rejected').length;
        const votes = feedbacks.reduce((sum, f) => sum + (f.votes || 0), 0);

        setStats({
          totalFeedbacks: total,
          resolvedFeedbacks: resolved,
          pendingFeedbacks: pending,
          totalVotes: votes,
          totalObjects: objects?.length || 0,
          totalReviews: reviewsCount || 0,
        });

        // Group by issue type
        const typeGroups: Record<string, number> = {};
        feedbacks.forEach(f => {
          const type = f.issue_type;
          typeGroups[type] = (typeGroups[type] || 0) + 1;
        });

        const typeDataArray = Object.entries(typeGroups)
          .map(([key, value]) => ({
            name: issueTypeLabels[key as IssueType] || key,
            value,
          }))
          .sort((a, b) => b.value - a.value);

        setTypeData(typeDataArray);
      }

      if (objects) {
        // Group by district
        const districtGroups: Record<string, number> = {};
        objects.forEach(obj => {
          const district = obj.district?.replace(' tumani', '') || 'Noma\'lum';
          districtGroups[district] = (districtGroups[district] || 0) + 1;
        });

        const districtDataArray = Object.entries(districtGroups)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);

        setDistrictData(districtDataArray);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const satisfactionRate = stats.totalFeedbacks > 0 
    ? Math.round((stats.resolvedFeedbacks / stats.totalFeedbacks) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-card border-b py-6 sm:py-8">
        <div className="container-gov">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Statistika
          </h1>
          <p className="text-muted-foreground">
            Murojaatlar va infratuzilma holati bo'yicha real statistik ma'lumotlar
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-6">
        <div className="container-gov">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Jami murojaatlar"
              value={stats.totalFeedbacks}
              icon={MessageSquare}
            />
            <StatCard
              title="Hal qilingan"
              value={stats.resolvedFeedbacks}
              subtitle={stats.totalFeedbacks > 0 ? `${satisfactionRate}% hal qilindi` : "Hali murojaatlar yo'q"}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              title="Ko'rib chiqilmoqda"
              value={stats.pendingFeedbacks}
              icon={Clock}
              variant="warning"
            />
            <StatCard
              title="Jami ovozlar"
              value={stats.totalVotes}
              subtitle={`${stats.totalObjects} ta ob'ekt`}
              icon={ThumbsUp}
              variant="info"
            />
          </div>

          {/* Additional Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalObjects}</p>
                    <p className="text-sm text-muted-foreground">Jami ob'ektlar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalReviews}</p>
                    <p className="text-sm text-muted-foreground">Jami sharhlar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{satisfactionRate}%</p>
                    <p className="text-sm text-muted-foreground">Hal qilish darajasi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Issue Types Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Muammo turlari bo'yicha murojaatlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Hali murojaatlar yo'q
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {typeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Districts Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Tumanlar bo'yicha ob'ektlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {districtData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Ma'lumot yo'q
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={districtData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 11 }} 
                          width={90}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="hsl(var(--primary))" 
                          radius={[0, 4, 4, 0]}
                          name="Ob'ektlar soni"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* No data message */}
          {stats.totalFeedbacks === 0 && (
            <Card className="mt-6">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Hali murojaatlar yo'q</h3>
                <p className="text-sm text-muted-foreground">
                  Fuqarolar murojaat yuborgandan so'ng bu yerda statistik ma'lumotlar ko'rinadi
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
