import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  ThumbsUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { statusLabels, issueTypeLabels, FeedbackStatus, IssueType } from "@/lib/types";

interface ProfileData {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface UserFeedback {
  id: string;
  issue_type: string;
  description: string;
  status: FeedbackStatus;
  created_at: string;
  votes: number;
  object_name: string;
}

interface UserVote {
  feedback_id: string;
  feedback: {
    description: string;
    status: FeedbackStatus;
    object_name: string;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfileData();
  }, [user, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setEditForm({
        full_name: profileData.full_name || "",
        phone: profileData.phone || "",
      });
    }

    // Fetch user's feedbacks with object info
    const { data: feedbackData } = await supabase
      .from('feedbacks')
      .select(`
        id,
        issue_type,
        description,
        status,
        created_at,
        votes,
        infrastructure_objects (name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (feedbackData) {
      setFeedbacks(feedbackData.map(f => ({
        ...f,
        status: f.status as FeedbackStatus,
        object_name: f.infrastructure_objects?.name || "Noma'lum"
      })));
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: editForm.full_name,
        phone: editForm.phone,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: "Xatolik",
        description: "Ma'lumotlarni saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Muvaffaqiyat",
        description: "Ma'lumotlar saqlandi",
      });
      setProfile({
        id: user.id,
        full_name: editForm.full_name,
        phone: editForm.phone,
      });
      setEditing(false);
    }
    
    setSaving(false);
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

  const stats = {
    total: feedbacks.length,
    completed: feedbacks.filter(f => f.status === 'completed').length,
    pending: feedbacks.filter(f => f.status !== 'completed' && f.status !== 'rejected').length,
    totalVotes: feedbacks.reduce((sum, f) => sum + (f.votes || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Profile Header */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b py-8">
        <div className="container-gov">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {profile?.full_name || "Foydalanuvchi"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              {profile?.phone && (
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </p>
              )}
            </div>
            <Button 
              variant={editing ? "default" : "outline"} 
              onClick={() => editing ? handleSaveProfile() : setEditing(true)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : editing ? (
                <Save className="h-4 w-4 mr-2" />
              ) : (
                <Edit2 className="h-4 w-4 mr-2" />
              )}
              {editing ? "Saqlash" : "Tahrirlash"}
            </Button>
          </div>
        </div>
      </section>

      <div className="container-gov py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Edit Profile Card */}
            {editing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ma'lumotlarni tahrirlash</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">To'liq ism</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Ismingizni kiriting"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon raqam</Label>
                    <Input
                      id="phone"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Saqlash"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Bekor qilish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistika</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm">Jami murojaatlar</span>
                  </div>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Hal qilingan</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Kutilmoqda</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Jami ovozlar</span>
                  </div>
                  <span className="font-bold text-blue-600">{stats.totalVotes}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="feedbacks">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="feedbacks" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Murojaatlarim ({feedbacks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feedbacks">
                {feedbacks.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Sizda hali murojaatlar yo'q
                      </p>
                      <Button className="mt-4" onClick={() => navigate('/')}>
                        Murojaat yuborish
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <Card key={feedback.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">
                                {issueTypeLabels[feedback.issue_type as IssueType]}
                              </Badge>
                              <Badge className={getStatusColor(feedback.status)}>
                                {statusLabels[feedback.status]}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(feedback.created_at), 'dd.MM.yyyy')}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">{feedback.object_name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {feedback.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {feedback.votes} ovoz
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
