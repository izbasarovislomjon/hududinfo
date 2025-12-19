import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  InfrastructureObject, 
  IssueType, 
  issueTypeLabels,
  objectTypeLabels,
  objectTypeColors
} from "@/data/mockData";
import { 
  MapPin, 
  Building2, 
  Upload, 
  Send, 
  User,
  Phone,
  Clock,
  CheckCircle2
} from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedObject: InfrastructureObject | null;
}

export function FeedbackModal({ open, onOpenChange, selectedObject }: FeedbackModalProps) {
  const { toast } = useToast();
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const issueTypes: IssueType[] = [
    'water_supply',
    'road_condition', 
    'heating',
    'medical_quality',
    'staff_shortage',
    'infrastructure',
    'other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueType || !description.trim()) {
      toast({
        title: "Xatolik",
        description: "Iltimos, barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    toast({
      title: "Murojaat yuborildi!",
      description: "Sizning murojaatingiz qabul qilindi va ko'rib chiqiladi.",
    });

    // Reset and close after success
    setTimeout(() => {
      setIsSuccess(false);
      setIssueType("");
      setDescription("");
      setIsAnonymous(false);
      setName("");
      setPhone("");
      onOpenChange(false);
    }, 2000);
  };

  if (!selectedObject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-12 text-center animate-scale-in">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Murojaat yuborildi!</h3>
            <p className="text-muted-foreground">
              Sizning murojaatingiz #{Math.random().toString(36).substr(2, 6).toUpperCase()} raqami bilan ro'yxatga olindi
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Murojaat yuborish</DialogTitle>
              <DialogDescription>
                Muammoni batafsil tasvirlab, fikringizni bildiring
              </DialogDescription>
            </DialogHeader>

            {/* Selected Object Info */}
            <div className="rounded-lg border bg-muted/30 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: objectTypeColors[selectedObject.type] + "20" }}
                >
                  <Building2 
                    className="h-5 w-5" 
                    style={{ color: objectTypeColors[selectedObject.type] }}
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-sm mb-1">{selectedObject.name}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: objectTypeColors[selectedObject.type] + "15",
                        color: objectTypeColors[selectedObject.type]
                      }}
                    >
                      {objectTypeLabels[selectedObject.type]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedObject.address}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Issue Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Muammo turi *</Label>
                <RadioGroup 
                  value={issueType} 
                  onValueChange={(val) => setIssueType(val as IssueType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {issueTypes.map((type) => (
                    <div key={type} className="relative">
                      <RadioGroupItem
                        value={type}
                        id={type}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={type}
                        className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-sm transition-all"
                      >
                        {issueTypeLabels[type]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Muammo tavsifi *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Muammoni batafsil tasvirlab bering..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rasm yuklash (ixtiyoriy)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Rasmni bu yerga tashlang yoki tanlang
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG (max 5MB)
                  </p>
                </div>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <Label
                  htmlFor="anonymous"
                  className="text-sm font-normal cursor-pointer"
                >
                  Anonim ravishda yuborish
                </Label>
              </div>

              {/* Contact Info (if not anonymous) */}
              {!isAnonymous && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Ismingiz
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="F.I.O."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Telefon raqamingiz
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+998 90 123 45 67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-detected info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Joylashuv avtomatik aniqlanadi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Vaqt: {new Date().toLocaleString('uz-UZ')}</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Murojaatni yuborish
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
