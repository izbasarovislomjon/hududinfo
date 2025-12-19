import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Clock, CheckCircle2, AlertCircle, XCircle, Eye } from 'lucide-react';

type FeedbackStatus = 'submitted' | 'reviewing' | 'in_progress' | 'completed' | 'rejected';

interface Feedback {
  id: string;
  issue_type: string;
  description: string;
  status: FeedbackStatus;
  created_at: string;
  admin_comment: string | null;
  infrastructure_objects: {
    name: string;
    address: string;
    type: string;
  } | null;
}

const statusConfig: Record<FeedbackStatus, { label: string; color: string; icon: React.ElementType }> = {
  submitted: { label: 'Qabul qilindi', color: 'bg-blue-500', icon: Clock },
  reviewing: { label: 'Ko\'rib chiqilmoqda', color: 'bg-yellow-500', icon: Eye },
  in_progress: { label: 'Amalga oshirilmoqda', color: 'bg-purple-500', icon: AlertCircle },
  completed: { label: 'Bajarildi', color: 'bg-green-500', icon: CheckCircle2 },
  rejected: { label: 'Rad etildi', color: 'bg-red-500', icon: XCircle },
};

const issueTypeLabels: Record<string, string> = {
  water_supply: 'Suv ta\'minoti',
  road_condition: 'Yo\'l holati',
  heating: 'Isitish tizimi',
  medical_quality: 'Tibbiy xizmat sifati',
  staff_shortage: 'Xodimlar yetishmasligi',
  infrastructure: 'Infratuzilma',
  other: 'Boshqa',
};

export default function MyFeedbacks() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFeedbacks();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`
        id,
        issue_type,
        description,
        status,
        created_at,
        admin_comment,
        infrastructure_objects (
          name,
          address,
          type
        )
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedbacks:', error);
    } else {
      setFeedbacks(data || []);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="bg-card border-b py-6 sm:py-8">
        <div className="container-gov">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mening murojaatlarim</h1>
          <p className="text-muted-foreground">
            Siz yuborgan barcha murojaatlar va ularning holati
          </p>
        </div>
      </section>

      <section className="py-6">
        <div className="container-gov">
          {feedbacks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Murojaatlar yo'q</h3>
                <p className="text-muted-foreground mb-4">
                  Siz hali birorta murojaat yubormadingiz
                </p>
                <Button onClick={() => navigate('/')}>
                  Murojaat yuborish
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {feedbacks.map((feedback) => {
                const status = statusConfig[feedback.status];
                const StatusIcon = status.icon;
                
                return (
                  <Card key={feedback.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-1">
                            {feedback.infrastructure_objects?.name || 'Noma\'lum obyekt'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {feedback.infrastructure_objects?.address}
                          </p>
                        </div>
                        <Badge className={`${status.color} text-white shrink-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {issueTypeLabels[feedback.issue_type] || feedback.issue_type}
                          </Badge>
                          <p className="text-sm text-foreground">{feedback.description}</p>
                        </div>
                        
                        {feedback.admin_comment && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Admin izohi:</p>
                            <p className="text-sm">{feedback.admin_comment}</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Yuborilgan: {new Date(feedback.created_at).toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
