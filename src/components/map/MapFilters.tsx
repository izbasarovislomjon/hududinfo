import { ObjectType, objectTypeLabels, objectTypeColors } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Baby, 
  Stethoscope, 
  Droplets, 
  Route,
  Check
} from "lucide-react";

const typeIcons: Record<ObjectType, React.ElementType> = {
  school: GraduationCap,
  kindergarten: Baby,
  clinic: Stethoscope,
  water: Droplets,
  road: Route,
};

interface MapFiltersProps {
  selectedTypes: ObjectType[];
  onTypeToggle: (type: ObjectType) => void;
  objectCounts: Record<ObjectType, number>;
}

export function MapFilters({ selectedTypes, onTypeToggle, objectCounts }: MapFiltersProps) {
  const allTypes: ObjectType[] = ['school', 'kindergarten', 'clinic', 'water', 'road'];

  return (
    <div className="flex flex-wrap gap-2">
      {allTypes.map((type) => {
        const Icon = typeIcons[type];
        const isSelected = selectedTypes.length === 0 || selectedTypes.includes(type);
        const color = objectTypeColors[type];
        
        return (
          <Button
            key={type}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeToggle(type)}
            className="gap-2 transition-all"
            style={{
              backgroundColor: isSelected ? color : undefined,
              borderColor: isSelected ? color : undefined,
              color: isSelected ? 'white' : color,
            }}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{objectTypeLabels[type]}</span>
            <span className="text-xs opacity-80">({objectCounts[type] || 0})</span>
            {isSelected && selectedTypes.length > 0 && (
              <Check className="h-3 w-3 ml-1" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
