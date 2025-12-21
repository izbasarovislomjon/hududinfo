import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/rating/StarRating";
import { Loader2, Upload, X, Camera, CheckCircle2 } from "lucide-react";

interface SolutionRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackId: string;
  feedbackDescription: string;
  onSuccess?: () => void;
}

export function SolutionRatingModal({
  open,
  onOpenChange,
  feedbackId,
  feedbackDescription,
  onSuccess,
}: SolutionRatingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        toast({
          title: "Ko'p rasm",
          description: "Maksimum 5 ta rasm yuklash mumkin",
          variant: "destructive",
        });
        return;
      }
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Kirish kerak",
        description: "Baholash uchun tizimga kiring",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Reyting tanlang",
        description: "Iltimos, yulduzchalarni bosib baholang",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create solution rating
      const { data: ratingData, error: ratingError } = await supabase
        .from("solution_ratings")
        .insert({
          feedback_id: feedbackId,
          user_id: user.id,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (ratingError) throw ratingError;

      // Upload images if any
      if (images.length > 0 && ratingData) {
        for (const image of images) {
          const fileName = `${ratingData.id}/${Date.now()}-${image.name}`;
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from("solution-images")
            .upload(fileName, image);

          if (uploadError) {
            console.error("Image upload error:", uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("solution-images")
            .getPublicUrl(fileName);

          await supabase.from("solution_rating_images").insert({
            solution_rating_id: ratingData.id,
            image_url: urlData.publicUrl,
          });
        }
      }

      toast({
        title: "Muvaffaqiyat!",
        description: "Bahoingiz qabul qilindi",
      });

      // Reset form
      setRating(0);
      setComment("");
      setImages([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Xatolik",
        description: "Baholashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Yechimni baholash
          </DialogTitle>
          <DialogDescription>
            Davlat tomonidan amalga oshirilgan yechimni baholang va natijani rasmlarda ko'rsating
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Original feedback */}
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="text-muted-foreground mb-1 text-xs">Asl muammo:</p>
            <p className="line-clamp-2">{feedbackDescription}</p>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Yechimni baholang (1-5)</Label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
              {rating > 0 && (
                <span className="text-sm text-muted-foreground">
                  {rating === 1 && "Yomon"}
                  {rating === 2 && "Qoniqarsiz"}
                  {rating === 3 && "O'rtacha"}
                  {rating === 4 && "Yaxshi"}
                  {rating === 5 && "A'lo"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Izoh (ixtiyoriy)</Label>
            <Textarea
              id="comment"
              placeholder="O'zgarishlar haqida fikringizni yozing..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>O'zgarishlar rasmlari (ixtiyoriy)</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((file, index) => (
                <div key={index} className="relative h-20 w-20">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Rasm ${index + 1}`}
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="h-20 w-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Rasm</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Maksimum 5 ta rasm. O'zgarishlarni ko'rsatish uchun oldin/keyin rasmlarini yuklang.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="flex-1"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || rating === 0}
              className="flex-1 gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                "Baholash"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
