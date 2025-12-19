import { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { 
  InfrastructureObject, 
  ObjectType, 
  objectTypeLabels, 
  objectTypeColors 
} from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, MapPin, Building2 } from "lucide-react";

// Custom marker icons for different object types
const createCustomIcon = (type: ObjectType) => {
  const color = objectTypeColors[type];
  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.164 0 0 7.164 0 16c0 10.5 14.25 24.75 14.875 25.375a1.5 1.5 0 002.25 0C17.75 40.75 32 26.5 32 16c0-8.836-7.164-16-16-16z" fill="${color}"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

function MapController({ center, zoom }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

interface InfrastructureMapProps {
  objects: InfrastructureObject[];
  selectedTypes: ObjectType[];
  onObjectSelect: (obj: InfrastructureObject) => void;
  onFeedbackClick: (obj: InfrastructureObject) => void;
}

export function InfrastructureMap({ 
  objects, 
  selectedTypes, 
  onObjectSelect,
  onFeedbackClick 
}: InfrastructureMapProps) {
  const [mapCenter] = useState<[number, number]>([41.2995, 69.2401]); // Tashkent center
  const [mapZoom] = useState(12);
  const iconsInitialized = useRef(false);

  // Initialize Leaflet default icons once
  useEffect(() => {
    if (!iconsInitialized.current) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      iconsInitialized.current = true;
    }
  }, []);

  const filteredObjects = useMemo(() => {
    if (selectedTypes.length === 0) return objects;
    return objects.filter(obj => selectedTypes.includes(obj.type));
  }, [objects, selectedTypes]);

  const icons = useMemo(() => {
    const iconMap: Record<ObjectType, L.DivIcon> = {} as Record<ObjectType, L.DivIcon>;
    (['school', 'kindergarten', 'clinic', 'water', 'road'] as ObjectType[]).forEach(type => {
      iconMap[type] = createCustomIcon(type);
    });
    return iconMap;
  }, []);

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController center={mapCenter} zoom={mapZoom} />
      
      {filteredObjects.map((obj) => (
        <Marker
          key={obj.id}
          position={obj.coordinates}
          icon={icons[obj.type]}
          eventHandlers={{
            click: () => onObjectSelect(obj),
          }}
        >
          <Popup className="custom-popup" minWidth={280} maxWidth={320}>
            <div className="p-1">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: objectTypeColors[obj.type] + "20" }}
                >
                  <Building2 
                    className="h-5 w-5" 
                    style={{ color: objectTypeColors[obj.type] }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">
                    {obj.name}
                  </h3>
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
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{obj.address}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="font-medium">{obj.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">
                    ({obj.totalReviews})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{obj.totalFeedbacks} murojaat</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {obj.isNew && (
                  <Badge className="bg-success text-success-foreground text-xs">
                    Yangi
                  </Badge>
                )}
                {obj.isReconstructed && (
                  <Badge className="bg-info text-info-foreground text-xs">
                    Ta'mirlangan
                  </Badge>
                )}
              </div>

              {/* Action */}
              <Button 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onFeedbackClick(obj);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Murojaat yuborish
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
