import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MapFilters } from "@/components/map/MapFilters";
import { InfrastructureMap } from "@/components/map/InfrastructureMap";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
  Search,
  Map,
  List,
  ExternalLink
} from "lucide-react";

const TASHKENT_DISTRICTS = [
  "Barcha tumanlar",
  "Bektemir tumani",
  "Chilonzor tumani",
  "Yakkasaroy tumani",
  "Yunusobod tumani",
  "Mirzo Ulug'bek tumani",
  "Mirobod tumani",
  "Sergeli tumani",
  "Shayxontohur tumani",
  "Olmazor tumani",
  "Uchtepa tumani",
  "Yashnobod tumani",
];

export default function Index() {
  const [objects, setObjects] = useState<InfrastructureObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    resolvedFeedbacks: 0,
    satisfactionRate: 78,
  });
  const [selectedTypes, setSelectedTypes] = useState<ObjectType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Barcha tumanlar");
  const [selectedObject, setSelectedObject] = useState<InfrastructureObject | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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
    const { count: totalCount } = await supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true });

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
    let result = objects;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(obj => 
        obj.name.toLowerCase().includes(query) ||
        obj.address.toLowerCase().includes(query) ||
        obj.district.toLowerCase().includes(query)
      );
    }
    
    // Filter by district
    if (selectedDistrict !== "Barcha tumanlar") {
      result = result.filter(obj => obj.district === selectedDistrict);
    }
    
    // Filter by type
    if (selectedTypes.length > 0) {
      result = result.filter(obj => selectedTypes.includes(obj.type));
    }
    
    return result;
  }, [objects, selectedTypes, searchQuery, selectedDistrict]);

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
                  variant="ghost"
                  className="gap-2 bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
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
          {/* Search, filters and view toggle row */}
          <div className="flex flex-col gap-4">
            {/* Main controls row */}
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
              {/* Search input */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              
              {/* District select */}
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-full lg:w-[200px] h-10">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Tumanni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {TASHKENT_DISTRICTS.map(district => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Type filters */}
              <div className="flex-1 w-full lg:w-auto">
                <MapFilters
                  selectedTypes={selectedTypes}
                  onTypeToggle={handleTypeToggle}
                  objectCounts={objectCounts}
                />
              </div>
              
              {/* View toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")} className="shrink-0">
                <TabsList className="h-10">
                  <TabsTrigger value="list" className="gap-2 px-4 h-8">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Ro'yxat</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="gap-2 px-4 h-8">
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">Xarita</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Results info row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span><strong className="text-foreground">{filteredObjects.length}</strong> ta obyekt topildi</span>
              </div>
              {(searchQuery || selectedTypes.length > 0 || selectedDistrict !== "Barcha tumanlar") && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTypes([]);
                    setSelectedDistrict("Barcha tumanlar");
                  }}
                >
                  Filterni tozalash
                </Button>
              )}
            </div>
          </div>

          {/* Content based on view mode */}
          <div className="flex-1 rounded-xl border shadow-lg overflow-hidden bg-card">
            {viewMode === "list" ? (
              filteredObjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center p-4">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">Hech narsa topilmadi</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Qidiruv natijasi topilmadi. Boshqa filtrlarni sinab ko'ring.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTypes([]);
                      setSelectedDistrict("Barcha tumanlar");
                    }}
                  >
                    Filterni tozalash
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto p-4">
                  {filteredObjects.map(obj => (
                    <div 
                      key={obj.id} 
                      className="p-4 border rounded-lg hover:shadow-md transition-all hover:border-primary/50 bg-background group"
                    >
                      <Link to={`/object/${obj.id}`} className="block">
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
                            <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{obj.name}</h3>
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
                      </Link>
                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={() => handleFeedbackClick(obj)}
                        >
                          <MessageSquarePlus className="h-3 w-3 mr-1" />
                          Murojaat
                        </Button>
                        <Link to={`/object/${obj.id}`} className="flex-1">
                          <Button size="sm" variant="ghost" className="w-full text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Batafsil
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="h-[60vh]">
                <InfrastructureMap 
                  objects={filteredObjects}
                  onFeedbackClick={handleFeedbackClick}
                />
              </div>
            )}
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
