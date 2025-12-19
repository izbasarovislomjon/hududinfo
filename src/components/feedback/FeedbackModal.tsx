import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  InfrastructureObject, 
  IssueType, 
  issueTypeLabels,
  objectTypeLabels,
  objectTypeColors
} from "@/lib/types";
import { 
  MapPin, 
  Building2, 
  Upload, 
  Send, 
  User,
  Phone,
  Clock,
  CheckCircle2,
  X,
  Loader2
} from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedObject: InfrastructureObject | null;
}

export function FeedbackModal({ open, onOpenChange, selectedObject }: FeedbackModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const issueTypes: IssueType[] = [
    'water_supply',
    'road_condition', 
    'heating',
    'medical_quality',
    'staff_shortage',
    'infrastructure',
    'other'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Ba'zi fayllar qabul qilinmadi",
        description: "Faqat 5MB gacha bo'lgan rasmlar yuklash mumkin",
        variant: "destructive",
      });
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (feedbackId: string): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${feedbackId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('feedback-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Image upload error:', error);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('feedback-images')
        .getPublicUrl(data.path);
      
      imageUrls.push(publicUrl);
    }
    
    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Kirish talab qilinadi",
        description: "Murojaat yuborish uchun tizimga kirishingiz kerak",
        variant: "destructive",
      });
      onOpenChange(false);
      navigate('/auth');
      return;
    }

    if (!selectedObject) {
      toast({
        title: "Xatolik",
        description: "Obyekt tanlanmagan",
        variant: "destructive",
      });
      return;
    }
    
    if (!issueType || !description.trim()) {
      toast({
        title: "Xatolik",
        description: "Iltimos, barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedbacks')
        .insert({
          user_id: user.id,
          object_id: selectedObject.id,
          issue_type: issueType,
          description: description.trim(),
          is_anonymous: isAnonymous,
          author_name: isAnonymous ? null : name || null,
          author_phone: isAnonymous ? null : phone || null,
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      // Upload images if any
      if (selectedFiles.length > 0 && feedback) {
        setUploadingImages(true);
        const imageUrls = await uploadImages(feedback.id);
        
        // Save image URLs to database
        for (const url of imageUrls) {
          await supabase
            .from('feedback_images')
            .insert({
              feedback_id: feedback.id,
              image_url: url,
            });
        }
        setUploadingImages(false);
      }

      // Add initial status history
      await supabase
        .from('feedback_status_history')
        .insert({
          feedback_id: feedback.id,
          status: 'submitted',
          comment: 'Murojaat qabul qilindi',
        });

      // Send SMS notification if phone is provided
      if (phone && !isAnonymous) {
        try {
          await supabase.functions.invoke('send-sms', {
            body: {
              phone: phone,
              message: `Hurmatli ${name || 'foydalanuvchi'}, sizning "${selectedObject.name}" bo'yicha murojaatingiz qabul qilindi. Murojaat raqami: ${feedback.id.slice(0, 8)}. HududInfo.uz`,
              feedbackId: feedback.id,
            },
          });
        } catch (smsError) {
          console.error('SMS sending error:', smsError);
          // Don't fail the whole submission if SMS fails
        }
      }

      setIsSuccess(true);
      
      toast({
        title: "Murojaat yuborildi!",
        description: phone && !isAnonymous 
          ? "Sizning murojaatingiz qabul qilindi. SMS xabar yuborildi." 
          : "Sizning murojaatingiz qabul qilindi va ko'rib chiqiladi.",
      });

      // Reset and close after success
      setTimeout(() => {
        setIsSuccess(false);
        setIssueType("");
        setDescription("");
        setIsAnonymous(false);
        setName("");
        setPhone("");
        setSelectedFiles([]);
        onOpenChange(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Xatolik",
        description: error.message || "Murojaat yuborishda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedObject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="py-12 text-center animate-scale-in">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Murojaat yuborildi!</h3>
            <p className="text-muted-foreground">
              Sizning murojaatingiz qabul qilindi
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                onOpenChange(false);
                navigate('/my-feedbacks');
              }}
            >
              Murojaatlarimni ko'rish
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Murojaat yuborish</DialogTitle>
              <DialogDescription>
                {!user ? (
                  <span className="text-destructive">Murojaat yuborish uchun tizimga kirishingiz kerak</span>
                ) : (
                  "Muammoni batafsil tasvirlab, fikringizni bildiring"
                )}
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
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="h-16 w-16 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Rasmni bu yerga tashlang yoki tanlang
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG (max 5MB, max 5 ta rasm)
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
                      Telefon raqamingiz (SMS bildirishnoma uchun)
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
                    <p className="text-xs text-muted-foreground">
                      Murojaat holati o'zgarganda SMS orqali xabar olasiz
                    </p>
                  </div>
                </div>
              )}

              {/* Auto-detected info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Vaqt: {new Date().toLocaleString('uz-UZ')}</span>
                </div>
              </div>

              {/* Submit Button */}
              {!user ? (
                <Button 
                  type="button" 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/auth');
                  }}
                >
                  Tizimga kirish
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting || uploadingImages}
                >
                  {isSubmitting || uploadingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadingImages ? 'Rasmlar yuklanmoqda...' : 'Yuborilmoqda...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Murojaatni yuborish
                    </>
                  )}
                </Button>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
