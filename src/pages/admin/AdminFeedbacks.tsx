import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { listFeedbackViews, subscribeToLocalBackend, updateFeedbackStatusLocal, type FeedbackView } from "@/lib/local-backend";
import { reportValidityLabels } from "@/lib/report-validation";
import { toast } from "sonner";
import {
  Search,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import type { FeedbackStatus } from "@/lib/types";

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

export default function AdminFeedbacks() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackView | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    const data = await listFeedbackViews({ status: statusFilter });
    setFeedbacks(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchFeedbacks();
    const unsubscribe = subscribeToLocalBackend(() => {
      void fetchFeedbacks();
    });
    return unsubscribe;
  }, [statusFilter]);

  const handleStatusChange = async (feedbackId: string, newStatus: FeedbackStatus) => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateFeedbackStatusLocal({
        feedbackId,
        status: newStatus,
        adminComment,
        changedBy: user.id,
      });
      toast.success(newStatus === "rejected" ? "Murojaat rad etildi va reyting qayta hisoblandi" : "Holat yangilandi");
      setDetailOpen(false);
      setAdminComment("");
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setUpdating(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) =>
    feedback.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.object_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feedback.submitter.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const statusCounts = {
    all: feedbacks.length,
    submitted: feedbacks.filter((feedback) => feedback.status === "submitted").length,
    reviewing: feedbacks.filter((feedback) => feedback.status === "reviewing").length,
    in_progress: feedbacks.filter((feedback) => feedback.status === "in_progress").length,
    completed: feedbacks.filter((feedback) => feedback.status === "completed").length,
    rejected: feedbacks.filter((feedback) => feedback.status === "rejected").length,
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Murojaatlar boshqaruvi</h1>
            <p className="text-muted-foreground">Rad etilgan murojaatlar avtomatik ravishda foydalanuvchi reytingini pasaytiradi.</p>
          </div>
          <Button variant="outline" onClick={() => void fetchFeedbacks()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yangilash
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "submitted", "reviewing", "in_progress", "completed", "rejected"] as const).map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className="cursor-pointer py-1.5 px-3"
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "Barchasi" : statusLabels[status]} ({statusCounts[status]})
            </Badge>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ob'ekt</TableHead>
                    <TableHead>Holat</TableHead>
                    <TableHead>Muallif</TableHead>
                    <TableHead>Unvon</TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Sana
                      </span>
                    </TableHead>
                    <TableHead>Ovozlar</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Yuklanmoqda...</TableCell>
                    </TableRow>
                  ) : filteredFeedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Murojaatlar topilmadi</TableCell>
                    </TableRow>
                  ) : (
                    filteredFeedbacks.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell className="max-w-[220px]">
                          <p className="truncate font-medium text-sm">{feedback.object_name}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${statusColors[feedback.status]}`}>
                            {statusLabels[feedback.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{feedback.display_name}</TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold" style={{ color: feedback.submitter.titleColor }}>
                            {feedback.submitter.titleEmoji} {feedback.submitter.titleLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(feedback.created_at), "d MMM yyyy", { locale: uz })}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{feedback.votes}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setAdminComment(feedback.admin_comment ?? "");
                              setDetailOpen(true);
                            }}
                          >
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Murojaat tafsilotlari</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Ob'ekt:</span>
                  <p className="font-medium">{selectedFeedback.object_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Muallif:</span>
                  <p className="font-medium">{selectedFeedback.display_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Unvon:</span>
                  <p className="font-medium" style={{ color: selectedFeedback.submitter.titleColor }}>
                    {selectedFeedback.submitter.titleEmoji} {selectedFeedback.submitter.titleLabel}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sana:</span>
                  <p className="font-medium">{format(new Date(selectedFeedback.created_at), "d MMMM yyyy, HH:mm", { locale: uz })}</p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Tavsif:</span>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedFeedback.description}</p>
              </div>

              {selectedFeedback.validation && (
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground mb-1">AI validatsiya</p>
                  <p className="text-sm text-muted-foreground mb-1.5">
                    {selectedFeedback.validation.summary}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Holat: {reportValidityLabels[selectedFeedback.validation.validity]} · Ishonchlilik: {selectedFeedback.validation.confidence}% · {selectedFeedback.validation.source}
                  </p>
                </div>
              )}

              {selectedFeedback.status === "rejected" && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Rad etish ushbu foydalanuvchi reytingiga manfiy ta'sir qiladi.
                </div>
              )}

              <div>
                <span className="text-muted-foreground text-sm">Admin izohi:</span>
                <Textarea placeholder="Izoh yozing..." value={adminComment} onChange={(e) => setAdminComment(e.target.value)} className="mt-1" />
              </div>

              <div>
                <span className="text-muted-foreground text-sm block mb-2">Holatni o'zgartirish:</span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" disabled={updating} onClick={() => void handleStatusChange(selectedFeedback.id, "reviewing")} className="gap-1">
                    <Clock className="h-4 w-4" /> Ko'rib chiqish
                  </Button>
                  <Button variant="outline" size="sm" disabled={updating} onClick={() => void handleStatusChange(selectedFeedback.id, "in_progress")} className="gap-1">
                    <Clock className="h-4 w-4" /> Jarayon
                  </Button>
                  <Button variant="outline" size="sm" disabled={updating} onClick={() => void handleStatusChange(selectedFeedback.id, "completed")} className="gap-1 border-green-200 text-green-700">
                    <CheckCircle2 className="h-4 w-4" /> Tasdiqlash
                  </Button>
                  <Button variant="outline" size="sm" disabled={updating} onClick={() => void handleStatusChange(selectedFeedback.id, "rejected")} className="gap-1 border-red-200 text-red-700">
                    <XCircle className="h-4 w-4" /> Rad etish
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
