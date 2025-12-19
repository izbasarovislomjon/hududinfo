import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search,
  Eye,
  ArrowUpDown,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type FeedbackStatus = Database["public"]["Enums"]["feedback_status"];
type IssueType = Database["public"]["Enums"]["issue_type"];

interface Feedback {
  id: string;
  description: string;
  status: FeedbackStatus | null;
  issue_type: IssueType;
  created_at: string | null;
  author_name: string | null;
  is_anonymous: boolean | null;
  admin_comment: string | null;
  votes: number | null;
  object_id: string;
  infrastructure_objects?: {
    name: string;
    type: string;
  };
}

const statusLabels: Record<FeedbackStatus, string> = {
  submitted: "Yuborildi",
  reviewing: "Ko'rib chiqilmoqda",
  in_progress: "Jarayonda",
  completed: "Tasdiqlandi",
  rejected: "Rad etildi",
};

const statusColors: Record<FeedbackStatus, string> = {
  submitted: "bg-info text-info-foreground",
  reviewing: "bg-warning text-warning-foreground",
  in_progress: "bg-accent text-accent-foreground",
  completed: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const issueTypeLabels: Record<IssueType, string> = {
  water_supply: "Suv ta'minoti",
  road_condition: "Yo'l holati",
  heating: "Isitish tizimi",
  medical_quality: "Tibbiy xizmat",
  staff_shortage: "Xodim yetishmasligi",
  infrastructure: "Infratuzilma",
  other: "Boshqa",
};

type SortField = "created_at" | "status" | "issue_type";
type SortOrder = "asc" | "desc";

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter, sortField, sortOrder]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("feedbacks")
        .select(`
          *,
          infrastructure_objects (
            name,
            type
          )
        `)
        .order(sortField, { ascending: sortOrder === "asc" });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      toast.error("Murojaatlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId: string, newStatus: FeedbackStatus) => {
    setUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from("feedbacks")
        .update({ status: newStatus, admin_comment: adminComment || null })
        .eq("id", feedbackId);

      if (updateError) throw updateError;

      // Add to status history
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("feedback_status_history").insert({
        feedback_id: feedbackId,
        status: newStatus,
        changed_by: session?.user?.id,
        comment: adminComment || null,
      });

      toast.success("Holat yangilandi");
      setDetailOpen(false);
      setAdminComment("");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setUpdating(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((fb) =>
    fb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fb.infrastructure_objects?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setAdminComment(feedback.admin_comment || "");
    setDetailOpen(true);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const statusCounts = {
    all: feedbacks.length,
    submitted: feedbacks.filter((f) => f.status === "submitted").length,
    reviewing: feedbacks.filter((f) => f.status === "reviewing").length,
    in_progress: feedbacks.filter((f) => f.status === "in_progress").length,
    completed: feedbacks.filter((f) => f.status === "completed").length,
    rejected: feedbacks.filter((f) => f.status === "rejected").length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Murojaatlar boshqaruvi</h1>
            <p className="text-muted-foreground">
              Barcha murojaatlarni ko'ring va boshqaring
            </p>
          </div>
          <Button variant="outline" onClick={fetchFeedbacks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yangilash
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          {(["all", "submitted", "reviewing", "in_progress", "completed", "rejected"] as const).map(
            (status) => (
              <Badge
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                className="cursor-pointer py-1.5 px-3"
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "Barchasi" : statusLabels[status]} ({statusCounts[status]})
              </Badge>
            )
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortField} onValueChange={(val) => setSortField(val as SortField)}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Saralash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Sana bo'yicha</SelectItem>
                  <SelectItem value="status">Holat bo'yicha</SelectItem>
                  <SelectItem value="issue_type">Turi bo'yicha</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obyekt</TableHead>
                    <TableHead>Muammo turi</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>Muallif</TableHead>
                    <TableHead>
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => toggleSort("created_at")}
                      >
                        <Calendar className="h-4 w-4" />
                        Sana
                        {sortField === "created_at" && (sortOrder === "asc" ? " ↑" : " ↓")}
                      </button>
                    </TableHead>
                    <TableHead>Ovozlar</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Yuklanmoqda...
                      </TableCell>
                    </TableRow>
                  ) : filteredFeedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Murojaatlar topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFeedbacks.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate font-medium text-sm">
                            {feedback.infrastructure_objects?.name || "Noma'lum"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {issueTypeLabels[feedback.issue_type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${statusColors[feedback.status || "submitted"]}`}>
                            {statusLabels[feedback.status || "submitted"]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {feedback.is_anonymous ? (
                            <span className="text-muted-foreground">Anonim</span>
                          ) : (
                            feedback.author_name || "Noma'lum"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {feedback.created_at
                            ? format(new Date(feedback.created_at), "d MMM yyyy", { locale: uz })
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{feedback.votes || 0}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(feedback)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ko'rish
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Murojaat tafsilotlari</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Obyekt:</span>
                  <p className="font-medium">{selectedFeedback.infrastructure_objects?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Muammo turi:</span>
                  <p className="font-medium">{issueTypeLabels[selectedFeedback.issue_type]}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Muallif:</span>
                  <p className="font-medium">
                    {selectedFeedback.is_anonymous ? "Anonim" : selectedFeedback.author_name}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sana:</span>
                  <p className="font-medium">
                    {selectedFeedback.created_at
                      ? format(new Date(selectedFeedback.created_at), "d MMMM yyyy, HH:mm", { locale: uz })
                      : "—"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Tavsif:</span>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedFeedback.description}</p>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Admin izohi:</span>
                <Textarea
                  placeholder="Izoh yozing..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <span className="text-muted-foreground text-sm block mb-2">Holatni o'zgartirish:</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusChange(selectedFeedback.id, "reviewing")}
                    className="gap-1"
                  >
                    <Clock className="h-4 w-4" />
                    Ko'rib chiqish
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusChange(selectedFeedback.id, "in_progress")}
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Jarayonda
                  </Button>
                  <Button
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusChange(selectedFeedback.id, "completed")}
                    className="gap-1 bg-success hover:bg-success/90"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Tasdiqlash
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={updating}
                    onClick={() => handleStatusChange(selectedFeedback.id, "rejected")}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Rad etish
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
