import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { InfrastructureMap } from "@/components/map/InfrastructureMap";
import { MapFilters } from "@/components/map/MapFilters";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  mockObjects, 
  InfrastructureObject, 
  ObjectType,
  mockStats 
} from "@/data/mockData";
import { 
  MessageSquarePlus, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [selectedTypes, setSelectedTypes] = useState<ObjectType[]>([]);
  const [selectedObject, setSelectedObject] = useState<InfrastructureObject | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const objectCounts = useMemo(() => {
    const counts: Record<ObjectType, number> = {
      school: 0,
      kindergarten: 0,
      clinic: 0,
      water: 0,
      road: 0,
    };
    mockObjects.forEach(obj => {
      counts[obj.type]++;
    });
    return counts;
  }, []);

  const handleTypeToggle = (type: ObjectType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleObjectSelect = (obj: InfrastructureObject) => {
    setSelectedObject(obj);
  };

  const handleFeedbackClick = (obj: InfrastructureObject) => {
    setSelectedObject(obj);
    setFeedbackModalOpen(true);
  };

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
                <p className="font-bold text-lg">{mockStats.totalFeedbacks}</p>
                <p className="text-xs text-muted-foreground">Jami murojaatlar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="font-bold text-lg">{mockStats.resolvedFeedbacks}</p>
                <p className="text-xs text-muted-foreground">Hal qilingan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-info" />
              </div>
              <div>
                <p className="font-bold text-lg">{mockStats.satisfactionRate}%</p>
                <p className="text-xs text-muted-foreground">Qoniqish darajasi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="font-bold text-lg">{mockObjects.length}</p>
                <p className="text-xs text-muted-foreground">Obyektlar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="flex-1 py-4 sm:py-6">
        <div className="container-gov h-full flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Xaritada obyektni tanlang va murojaat yuboring
              </span>
            </div>
            <MapFilters
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
              objectCounts={objectCounts}
            />
          </div>

          {/* Map Container */}
          <div className="flex-1 min-h-[500px] lg:min-h-[600px] rounded-xl border shadow-lg overflow-hidden">
            <InfrastructureMap
              objects={mockObjects}
              selectedTypes={selectedTypes}
              onObjectSelect={handleObjectSelect}
              onFeedbackClick={handleFeedbackClick}
            />
          </div>
        </div>
      </section>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        selectedObject={selectedObject || mockObjects[0]}
      />
    </div>
  );
}
