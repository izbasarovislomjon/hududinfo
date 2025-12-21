import { StarRating } from "@/components/rating/StarRating";
import { format } from "date-fns";
import { User, Calendar, MessageSquare } from "lucide-react";

interface SolutionRating {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  images: { image_url: string }[];
}

interface SolutionRatingCardProps {
  rating: SolutionRating;
  onImageClick?: (images: string[], index: number) => void;
}

export function SolutionRatingCard({ rating, onImageClick }: SolutionRatingCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <StarRating rating={rating.rating} size="sm" />
          <span className="text-sm font-medium">{rating.rating}/5</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(rating.created_at), "dd.MM.yyyy")}
        </div>
      </div>

      {rating.comment && (
        <p className="text-sm text-foreground mb-3">{rating.comment}</p>
      )}

      {rating.images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {rating.images.map((img, idx) => (
            <img
              key={img.image_url}
              src={img.image_url}
              alt={`O'zgarish rasmi ${idx + 1}`}
              className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity border border-border"
              onClick={() => onImageClick?.(rating.images.map((i) => i.image_url), idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
