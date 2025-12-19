import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";
import { FeedbackDetailModal } from "@/components/feedback/FeedbackDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  mockFeedbacks, 
  Feedback, 
  FeedbackStatus, 
  IssueType,
  statusLabels,
  issueTypeLabels 
} from "@/data/mockData";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = fb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fb.objectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || fb.status === statusFilter;
    const matchesType = typeFilter === "all" || fb.issueType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleVote = (id: string) => {
    setFeedbacks(prev => prev.map(fb => {
      if (fb.id === id) {
        return {
          ...fb,
          votes: fb.hasVoted ? fb.votes - 1 : fb.votes + 1,
          hasVoted: !fb.hasVoted,
        };
      }
      return fb;
    }));
  };

  const handleViewDetails = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setDetailModalOpen(true);
  };

  const statusCounts = {
    all: feedbacks.length,
    submitted: feedbacks.filter(f => f.status === 'submitted').length,
    reviewing: feedbacks.filter(f => f.status === 'reviewing').length,
    in_progress: feedbacks.filter(f => f.status === 'in_progress').length,
    completed: feedbacks.filter(f => f.status === 'completed').length,
    rejected: feedbacks.filter(f => f.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-card border-b py-6 sm:py-8">
        <div className="container-gov">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Fuqarolar murojaatlari
          </h1>
          <p className="text-muted-foreground">
            Barcha murojaatlarni ko'ring, ovoz bering va holatini kuzating
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card/50 border-b py-4">
        <div className="container-gov">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as FeedbackStatus | "all")}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Holati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi ({statusCounts.all})</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label} ({statusCounts[key as FeedbackStatus]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as IssueType | "all")}>
              <SelectTrigger className="w-full sm:w-48">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Muammo turi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha turlar</SelectItem>
                {Object.entries(issueTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Status Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { key: "all" as const, label: "Barchasi" },
              { key: "submitted" as const, label: statusLabels.submitted },
              { key: "reviewing" as const, label: statusLabels.reviewing },
              { key: "in_progress" as const, label: statusLabels.in_progress },
              { key: "completed" as const, label: statusLabels.completed },
            ].map(({ key, label }) => (
              <Badge
                key={key}
                variant={statusFilter === key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setStatusFilter(key)}
              >
                {label} ({statusCounts[key]})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Feedbacks List */}
      <section className="py-6">
        <div className="container-gov">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Murojaatlar topilmadi</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  onVote={handleVote}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <FeedbackDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        feedback={selectedFeedback}
        onVote={handleVote}
      />
    </div>
  );
}
