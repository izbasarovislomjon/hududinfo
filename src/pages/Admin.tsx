import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/stats/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  mockStats, 
  mockFeedbacks, 
  Feedback,
  FeedbackStatus,
  statusLabels,
  statusColors,
  issueTypeLabels
} from "@/data/mockData";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  Search,
  Eye,
  MoreHorizontal,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

export default function Admin() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = (feedbackId: string, newStatus: FeedbackStatus) => {
    setFeedbacks(prev => prev.map(fb => {
      if (fb.id === feedbackId) {
        return { ...fb, status: newStatus };
      }
      return fb;
    }));
  };

  const filteredFeedbacks = feedbacks.filter(fb =>
    fb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fb.objectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Admin Header */}
      <section className="bg-primary text-primary-foreground py-6">
        <div className="container-gov">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Boshqaruv paneli
            </h1>
          </div>
          <p className="text-primary-foreground/80">
            Murojaatlar, statistika va tizim holati
          </p>
        </div>
      </section>

      {/* Stats Overview */}
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
              subtitle={`${Math.round((mockStats.resolvedFeedbacks / mockStats.totalFeedbacks) * 100)}%`}
              icon={CheckCircle2}
              variant="success"
            />
            <StatCard
              title="Ko'rib chiqilmoqda"
              value={mockStats.pendingFeedbacks}
              subtitle="Kutilmoqda"
              icon={Clock}
              variant="warning"
            />
            <StatCard
              title="Rad etilgan"
              value={mockStats.rejectedFeedbacks}
              icon={XCircle}
              variant="destructive"
            />
          </div>

          {/* Quick Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                So'nggi 12 oy statistikasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStats.monthlyFeedbacks}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Feedbacks Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">Murojaatlar ro'yxati</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Obyekt</TableHead>
                      <TableHead>Muammo turi</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead>Ovozlar</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-mono text-xs">
                          {feedback.id.toUpperCase()}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate font-medium text-sm">
                            {feedback.objectName}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {issueTypeLabels[feedback.issueType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={feedback.status}
                            onValueChange={(val) => handleStatusChange(feedback.id, val as FeedbackStatus)}
                          >
                            <SelectTrigger className="w-36 h-8">
                              <Badge className={`text-xs ${statusColors[feedback.status]}`}>
                                {statusLabels[feedback.status]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(feedback.createdAt), "d MMM yyyy", { locale: uz })}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{feedback.votes}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
