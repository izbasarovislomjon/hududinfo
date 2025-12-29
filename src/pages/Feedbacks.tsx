import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  FeedbackStatus, 
  IssueType,
  statusLabels,
  issueTypeLabels 
} from "@/lib/types";
import { Search, Filter, SlidersHorizontal, ThumbsUp, Clock, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uz, ru } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedbackItem {
  id: string;
  issue_type: IssueType;
  description: string;
  status: FeedbackStatus;
  votes: number;
  is_anonymous: boolean;
  author_name: string | null;
  created_at: string;
  object_name: string;
}

export default function Feedbacks() {
  const { t, language } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");

  const getDateLocale = () => {
    return language === "ru" ? ru : uz;
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`
        id,
        issue_type,
        description,
        status,
        votes,
        is_anonymous,
        author_name,
        created_at,
        infrastructure_objects (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedbacks:', error);
    } else if (data) {
      setFeedbacks(data.map(f => ({
        ...f,
        issue_type: f.issue_type as IssueType,
        status: (f.status || 'submitted') as FeedbackStatus,
        votes: f.votes || 0,
        object_name: f.infrastructure_objects?.name || "Noma'lum"
      })));
    }
    
    setLoading(false);
  };

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = fb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fb.object_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || fb.status === statusFilter;
    const matchesType = typeFilter === "all" || fb.issue_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusCounts = {
    all: feedbacks.length,
    submitted: feedbacks.filter(f => f.status === 'submitted').length,
    reviewing: feedbacks.filter(f => f.status === 'reviewing').length,
    in_progress: feedbacks.filter(f => f.status === 'in_progress').length,
    completed: feedbacks.filter(f => f.status === 'completed').length,
    rejected: feedbacks.filter(f => f.status === 'rejected').length,
  };

  const getStatusColor = (status: FeedbackStatus) => {
    const colors: Record<FeedbackStatus, string> = {
      submitted: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      reviewing: "bg-blue-500/10 text-blue-700 border-blue-200",
      in_progress: "bg-purple-500/10 text-purple-700 border-purple-200",
      completed: "bg-green-500/10 text-green-700 border-green-200",
      rejected: "bg-red-500/10 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-card border-b py-6 sm:py-8">
        <div className="container-gov">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {t('feedbacks.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('feedbacks.subtitle')}
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
                placeholder={t('filter.search')}
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
              { key: "all" as const, label: t('feedbacks.all') },
              { key: "submitted" as const, label: t('status.submitted') },
              { key: "reviewing" as const, label: t('status.reviewing') },
              { key: "in_progress" as const, label: t('status.in_progress') },
              { key: "completed" as const, label: t('status.completed') },
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedbacks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('feedbacks.no_feedbacks')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('feedbacks.no_feedbacks_desc')}
                </p>
              </CardContent>
            </Card>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('feedbacks.filter_none')}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFeedbacks.map((feedback) => (
                <Card key={feedback.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {t(`issue.${feedback.issue_type}`)}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(feedback.status)}`}>
                        {t(`status.${feedback.status}`)}
                      </Badge>
                    </div>

                    {/* Object name */}
                    <p className="font-medium text-sm mb-2 line-clamp-1">
                      {feedback.object_name}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {feedback.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {feedback.votes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(feedback.created_at), { 
                            addSuffix: true,
                            locale: getDateLocale()
                          })}
                        </span>
                      </div>
                      <span>
                        {feedback.is_anonymous ? "Anonim" : feedback.author_name || "Foydalanuvchi"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
