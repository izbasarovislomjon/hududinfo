import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Clock, 
  ThumbsUp,
  Flame,
  Trophy,
  Target,
  ArrowUp,
  MapPin,
  Building2,
  Droplets,
  GraduationCap,
  Stethoscope,
  Route
} from "lucide-react";
import { issueTypeLabels, objectTypeLabels } from "@/lib/types";

interface PriorityIssue {
  id: string;
  issue_type: string;
  district: string;
  region: string;
  total_feedbacks: number;
  total_votes: number;
  pending_count: number;
  priority_score: number;
  affected_objects: number;
  sample_descriptions: string[];
}

const issueTypeIcons: Record<string, React.ReactNode> = {
  water_supply: <Droplets className="h-5 w-5" />,
  road_condition: <Route className="h-5 w-5" />,
  heating: <Flame className="h-5 w-5" />,
  medical_quality: <Stethoscope className="h-5 w-5" />,
  staff_shortage: <Users className="h-5 w-5" />,
  infrastructure: <Building2 className="h-5 w-5" />,
  other: <Target className="h-5 w-5" />,
};

const getPriorityColor = (score: number) => {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-blue-500";
  return "bg-green-500";
};

const getPriorityLabel = (score: number) => {
  if (score >= 80) return { text: "Juda dolzarb", color: "bg-red-500/20 text-red-600 border-red-500/30" };
  if (score >= 60) return { text: "Dolzarb", color: "bg-orange-500/20 text-orange-600 border-orange-500/30" };
  if (score >= 40) return { text: "O'rtacha", color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30" };
  if (score >= 20) return { text: "Past", color: "bg-blue-500/20 text-blue-600 border-blue-500/30" };
  return { text: "Juda past", color: "bg-green-500/20 text-green-600 border-green-500/30" };
};

export default function PriorityRanking() {
  const [issues, setIssues] = useState<PriorityIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewBy, setViewBy] = useState<"issue_type" | "district">("issue_type");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    fetchPriorityData();
  }, [viewBy, selectedRegion]);

  const fetchPriorityData = async () => {
    setLoading(true);
    try {
      // Fetch all feedbacks with object info
      let query = supabase
        .from('feedbacks')
        .select(`
          id,
          issue_type,
          description,
          votes,
          status,
          object_id,
          infrastructure_objects!inner (
            id,
            name,
            district,
            region,
            type
          )
        `);

      const { data: feedbacks, error } = await query;

      if (error) throw error;

      // Get unique regions
      const uniqueRegions = [...new Set(feedbacks?.map(f => f.infrastructure_objects?.region).filter(Boolean))] as string[];
      setRegions(uniqueRegions);

      // Filter by region if selected
      let filteredFeedbacks = feedbacks || [];
      if (selectedRegion !== "all") {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.infrastructure_objects?.region === selectedRegion);
      }

      // Group and calculate priority scores
      const groupedData: Record<string, PriorityIssue> = {};

      filteredFeedbacks.forEach(feedback => {
        const key = viewBy === "issue_type" 
          ? feedback.issue_type 
          : feedback.infrastructure_objects?.district || "Noma'lum";

        if (!groupedData[key]) {
          groupedData[key] = {
            id: key,
            issue_type: viewBy === "issue_type" ? feedback.issue_type : "mixed",
            district: viewBy === "district" ? key : "mixed",
            region: feedback.infrastructure_objects?.region || "",
            total_feedbacks: 0,
            total_votes: 0,
            pending_count: 0,
            priority_score: 0,
            affected_objects: new Set<string>() as any,
            sample_descriptions: [],
          };
        }

        const group = groupedData[key];
        group.total_feedbacks += 1;
        group.total_votes += feedback.votes || 0;
        
        if (feedback.status !== 'completed' && feedback.status !== 'rejected') {
          group.pending_count += 1;
        }

        // Track unique objects
        if (feedback.object_id) {
          (group.affected_objects as unknown as Set<string>).add(feedback.object_id);
        }

        // Collect sample descriptions
        if (group.sample_descriptions.length < 3 && feedback.description) {
          group.sample_descriptions.push(feedback.description.slice(0, 100));
        }
      });

      // Calculate priority scores and convert Sets to counts
      const processedIssues = Object.values(groupedData).map(issue => {
        const affectedCount = (issue.affected_objects as unknown as Set<string>).size;
        
        // Priority formula:
        // - 40% based on pending feedbacks (max 100 for normalization)
        // - 30% based on total votes (max 500 for normalization)
        // - 20% based on affected objects count (max 20 for normalization)
        // - 10% based on total feedbacks (max 50 for normalization)
        const pendingScore = Math.min(issue.pending_count / 100, 1) * 40;
        const votesScore = Math.min(issue.total_votes / 500, 1) * 30;
        const objectsScore = Math.min(affectedCount / 20, 1) * 20;
        const feedbacksScore = Math.min(issue.total_feedbacks / 50, 1) * 10;

        return {
          ...issue,
          affected_objects: affectedCount,
          priority_score: Math.round(pendingScore + votesScore + objectsScore + feedbacksScore),
        };
      });

      // Sort by priority score
      processedIssues.sort((a, b) => b.priority_score - a.priority_score);

      setIssues(processedIssues);
    } catch (error) {
      console.error("Error fetching priority data:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxScore = Math.max(...issues.map(i => i.priority_score), 1);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b py-8 sm:py-12">
        <div className="container-gov">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Ustuvorlik reytingi
              </h1>
              <p className="text-muted-foreground">
                Qaysi muammolar birinchi navbatda hal qilinishi kerak?
              </p>
            </div>
          </div>

          {/* Explanation Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Card className="bg-background/60 backdrop-blur">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Hal qilinmagan</p>
                    <p className="text-xs text-muted-foreground">Kutilayotgan murojaatlar soni</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <ThumbsUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Ovozlar</p>
                    <p className="text-xs text-muted-foreground">Fuqarolar qo'llab-quvvatlashi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/60 backdrop-blur">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Ta'sirlangan joylar</p>
                    <p className="text-xs text-muted-foreground">Muammo kuzatilgan ob'ektlar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-card/50 border-b py-4">
        <div className="container-gov">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewBy === "issue_type" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewBy("issue_type")}
              >
                <Target className="h-4 w-4 mr-2" />
                Muammo turi bo'yicha
              </Button>
              <Button
                variant={viewBy === "district" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewBy("district")}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Tuman bo'yicha
              </Button>
            </div>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Viloyat tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha viloyatlar</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Priority List */}
      <section className="py-6">
        <div className="container-gov">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ma'lumot topilmadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue, index) => {
                const priorityLabel = getPriorityLabel(issue.priority_score);
                const relativeScore = (issue.priority_score / maxScore) * 100;

                return (
                  <Card 
                    key={issue.id} 
                    className={`overflow-hidden transition-all hover:shadow-lg ${
                      index === 0 ? "ring-2 ring-primary/50" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Rank Badge */}
                        <div className={`flex items-center justify-center w-full lg:w-20 py-4 lg:py-0 ${
                          index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500" :
                          index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                          index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400" :
                          "bg-muted"
                        }`}>
                          <div className="text-center">
                            <span className={`text-2xl font-bold ${
                              index < 3 ? "text-white" : "text-muted-foreground"
                            }`}>
                              #{index + 1}
                            </span>
                            {index === 0 && (
                              <Trophy className="h-5 w-5 text-white mx-auto mt-1" />
                            )}
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-4 lg:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  {viewBy === "issue_type" 
                                    ? issueTypeIcons[issue.issue_type] || <Target className="h-5 w-5" />
                                    : <MapPin className="h-5 w-5" />
                                  }
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {viewBy === "issue_type" 
                                      ? issueTypeLabels[issue.issue_type as keyof typeof issueTypeLabels] || issue.issue_type
                                      : issue.district
                                    }
                                  </h3>
                                  {viewBy === "district" && issue.region && (
                                    <p className="text-sm text-muted-foreground">{issue.region} viloyati</p>
                                  )}
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                                    <Clock className="h-4 w-4" />
                                  </div>
                                  <p className="text-xl font-bold">{issue.pending_count}</p>
                                  <p className="text-xs text-muted-foreground">Kutmoqda</p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                                    <ThumbsUp className="h-4 w-4" />
                                  </div>
                                  <p className="text-xl font-bold">{issue.total_votes}</p>
                                  <p className="text-xs text-muted-foreground">Ovoz</p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                                    <Building2 className="h-4 w-4" />
                                  </div>
                                  <p className="text-xl font-bold">{issue.affected_objects}</p>
                                  <p className="text-xs text-muted-foreground">Ob'ekt</p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                                    <Users className="h-4 w-4" />
                                  </div>
                                  <p className="text-xl font-bold">{issue.total_feedbacks}</p>
                                  <p className="text-xs text-muted-foreground">Murojaat</p>
                                </div>
                              </div>

                              {/* Sample descriptions */}
                              {issue.sample_descriptions.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-xs text-muted-foreground mb-2">Namuna murojaatlar:</p>
                                  <div className="space-y-1">
                                    {issue.sample_descriptions.slice(0, 2).map((desc, i) => (
                                      <p key={i} className="text-sm text-muted-foreground italic line-clamp-1">
                                        "{desc}..."
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Priority Score */}
                            <div className="sm:text-right">
                              <Badge className={`${priorityLabel.color} border mb-2`}>
                                {priorityLabel.text}
                              </Badge>
                              <div className="flex items-center gap-2 sm:justify-end">
                                <span className="text-3xl font-bold">{issue.priority_score}</span>
                                <span className="text-sm text-muted-foreground">ball</span>
                              </div>
                              <div className="w-32 mt-2">
                                <Progress 
                                  value={relativeScore} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ustuvorlik qanday hisoblanadi?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-red-500">40%</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Hal qilinmagan murojaatlar</p>
                    <p className="text-xs text-muted-foreground">Kutayotgan va ko'rib chiqilayotgan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">30%</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Fuqarolar ovozi</p>
                    <p className="text-xs text-muted-foreground">Qo'llab-quvvatlash soni</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-orange-500">20%</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Ta'sirlangan ob'ektlar</p>
                    <p className="text-xs text-muted-foreground">Muammo kuzatilgan joylar</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-500">10%</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Umumiy murojaatlar</p>
                    <p className="text-xs text-muted-foreground">Jami kelgan shikoyatlar</p>
                  </div>
                </div>
              </div>

              {/* Priority Level Legend */}
              <div className="mt-6 pt-6 border-t">
                <p className="font-medium text-sm mb-3">Ustuvorlik darajalari:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-red-500/20 text-red-600 border-red-500/30 border">
                    80+ Juda dolzarb
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 border">
                    60-79 Dolzarb
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 border">
                    40-59 O'rtacha
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 border">
                    20-39 Past
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30 border">
                    0-19 Juda past
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
