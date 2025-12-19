import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/stats/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStats, issueTypeLabels } from "@/data/mockData";
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
  Legend
} from "recharts";
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ThumbsUp,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const COLORS = ['#3b82f6', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7', '#22c55e', '#64748b'];

export default function Statistics() {
  const pieData = Object.entries(mockStats.feedbacksByType).map(([key, value]) => ({
    name: issueTypeLabels[key as keyof typeof issueTypeLabels],
    value,
  }));

  const regionData = Object.entries(mockStats.feedbacksByRegion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name: name.replace(' tumani', ''), value }));

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
            Murojaatlar va infratuzilma holati bo'yicha statistik ma'lumotlar
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-6">
        <div className="container-gov">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Jami murojaatlar"
              value={mockStats.totalFeedbacks}
              icon={MessageSquare}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Hal qilingan"
              value={mockStats.resolvedFeedbacks}
              subtitle={`${Math.round((mockStats.resolvedFeedbacks / mockStats.totalFeedbacks) * 100)}% hal qilindi`}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              title="Ko'rib chiqilmoqda"
              value={mockStats.pendingFeedbacks}
              icon={Clock}
              variant="warning"
            />
            <StatCard
              title="Qoniqish darajasi"
              value={`${mockStats.satisfactionRate}%`}
              subtitle={`O'rtacha ${mockStats.averageResolutionDays} kun`}
              icon={ThumbsUp}
              variant="info"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Oylik murojaatlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockStats.monthlyFeedbacks}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        name="Murojaatlar"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Issue Types Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Muammo turlari
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Regions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Eng ko'p murojaat tushgan hududlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: 12 }} 
                        width={100}
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
                        fill="hsl(var(--accent))" 
                        radius={[0, 4, 4, 0]}
                        name="Murojaatlar"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
