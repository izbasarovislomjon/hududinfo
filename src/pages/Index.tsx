import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { MapFilters } from "@/components/map/MapFilters";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  InfrastructureObject, 
  ObjectType,
  objectTypeLabels,
  objectTypeColors
} from "@/lib/types";
import { 
  MessageSquarePlus, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Info,
  MapPin,
  Star,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [objects, setObjects] = useState<InfrastructureObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    resolvedFeedbacks: 0,
    satisfactionRate: 78,
  });
  const [selectedTypes, setSelectedTypes] = useState<ObjectType[]>([]);
  const [selectedObject, setSelectedObject] = useState<InfrastructureObject | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  useEffect(() => {
    fetchObjects();
    fetchStats();
  }, []);

  const fetchObjects = async () => {
    const { data, error } = await supabase
      .from('infrastructure_objects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching objects:', error);
    } else {
      const mappedObjects: InfrastructureObject[] = (data || []).map(obj => ({
        id: obj.id,
        name: obj.name,
        type: obj.type as ObjectType,
        address: obj.address,
        region: obj.region,
        district: obj.district,
        lat: Number(obj.lat),
        lng: Number(obj.lng),
        rating: Number(obj.rating) || 0,
        total_reviews: obj.total_reviews || 0,
        total_feedbacks: obj.total_feedbacks || 0,
        is_new: obj.is_new || false,
        is_reconstructed: obj.is_reconstructed || false,
        capacity: obj.capacity || undefined,
        built_year: obj.built_year || undefined,
        last_renovation: obj.last_renovation || undefined,
      }));
      setObjects(mappedObjects);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    // Get total feedbacks
    const { count: totalCount } = await supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true });

    // Get resolved feedbacks
    const { count: resolvedCount } = await supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    setStats({
      totalFeedbacks: totalCount || 0,
      resolvedFeedbacks: resolvedCount || 0,
      satisfactionRate: totalCount && resolvedCount ? Math.round((resolvedCount / totalCount) * 100) : 78,
    });
  };

  const objectCounts = useMemo(() => {
    const counts: Record<ObjectType, number> = {
      school: 0,
      kindergarten: 0,
      clinic: 0,
      water: 0,
      road: 0,
    };
    objects.forEach(obj => {
      counts[obj.type]++;
    });
    return counts;
  }, [objects]);

  const filteredObjects = useMemo(() => {
    if (selectedTypes.length === 0) return objects;
    return objects.filter(obj => selectedTypes.includes(obj.type));
  }, [objects, selectedTypes]);

  const handleTypeToggle = (type: ObjectType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleFeedbackClick = (obj: InfrastructureObject) => {
    setSelectedObject(obj);
    setFeedbackModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-8 sm:py-12">
        <div className="container-gov">
          <div className="max-w-3xl">
            <Badge className="bg-primary-foreground/20 text-primary-foreground mb-4">
              Davlat xizmatlari platformasi
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Hududingiz infratuzilmasini birga yaxshilaymiz
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-6">
              Maktab, bog'cha, poliklinika, suv va yo'llardagi muammolarni bildiring. 
              Sizning ovozingiz muhim!
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2"
                onClick={() => setFeedbackModalOpen(true)}
              >
                <MessageSquarePlus className="h-5 w-5" />
                Murojaat yuborish
              </Button>
              <Link to="/feedbacks">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Murojaatlarni ko'rish
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-4 border-b bg-card">
        <div className="container-gov">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquarePlus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{stats.totalFeedbacks}</p>
                <p className="text-xs text-muted-foreground">Jami murojaatlar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-lg">{stats.resolvedFeedbacks}</p>
                <p className="text-xs text-muted-foreground">Hal qilingan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-lg">{stats.satisfactionRate}%</p>
                <p className="text-xs text-muted-foreground">Qoniqish darajasi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-bold text-lg">{objects.length}</p>
                <p className="text-xs text-muted-foreground">Obyektlar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objects Section */}
      <section className="flex-1 py-4 sm:py-6">
        <div className="container-gov h-full flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Obyektni tanlang va murojaat yuboring
              </span>
            </div>
            <MapFilters
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
              objectCounts={objectCounts}
            />
          </div>

          {/* Object Grid */}
          <div className="flex-1 rounded-xl border shadow-lg overflow-hidden bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredObjects.map(obj => (
                <div 
                  key={obj.id} 
                  className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-primary/50 bg-background"
                  onClick={() => handleFeedbackClick(obj)}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: objectTypeColors[obj.type] + "20" }}
                    >
                      <MapPin 
                        className="h-5 w-5" 
                        style={{ color: objectTypeColors[obj.type] }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm line-clamp-1">{obj.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{obj.address}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: objectTypeColors[obj.type] + "15",
                            color: objectTypeColors[obj.type]
                          }}
                        >
                          {objectTypeLabels[obj.type]}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{obj.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {obj.total_feedbacks} murojaat
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        selectedObject={selectedObject || objects[0] || null}
      />
    </div>
  );
}
