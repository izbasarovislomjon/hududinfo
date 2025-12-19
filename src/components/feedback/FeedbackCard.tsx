import { Feedback, statusLabels, statusColors, issueTypeLabels } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ThumbsUp, 
  Clock, 
  MapPin, 
  ChevronRight,
  User,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";

interface FeedbackCardProps {
  feedback: Feedback;
  onVote: (id: string) => void;
  onViewDetails: (feedback: Feedback) => void;
}

export function FeedbackCard({ feedback, onVote, onViewDetails }: FeedbackCardProps) {
  const timeAgo = formatDistanceToNow(new Date(feedback.createdAt), {
    addSuffix: true,
    locale: uz,
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 animate-fade-in">
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="outline" className="text-xs">
                  {issueTypeLabels[feedback.issueType]}
                </Badge>
                <Badge className={`text-xs ${statusColors[feedback.status]}`}>
                  {statusLabels[feedback.status]}
                </Badge>
              </div>
              <h3 className="font-medium text-sm text-foreground line-clamp-1">
                {feedback.objectName}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {feedback.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              {feedback.isAnonymous ? (
                <>
                  <User className="h-3.5 w-3.5" />
                  <span>Anonim</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  <span>{feedback.authorName}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant={feedback.hasVoted ? "secondary" : "outline"}
              size="sm"
              onClick={() => onVote(feedback.id)}
              className="gap-2"
            >
              <ThumbsUp className={`h-4 w-4 ${feedback.hasVoted ? "fill-current" : ""}`} />
              <span className="font-medium">{feedback.votes}</span>
              <span className="hidden sm:inline text-muted-foreground">ovoz</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(feedback)}
              className="gap-1"
            >
              Batafsil
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status indicator bar */}
        <div 
          className={`h-1 w-full ${
            feedback.status === 'completed' ? 'bg-success' :
            feedback.status === 'rejected' ? 'bg-destructive' :
            feedback.status === 'in_progress' ? 'bg-accent' :
            feedback.status === 'reviewing' ? 'bg-warning' :
            'bg-info'
          }`}
        />
      </CardContent>
    </Card>
  );
}
