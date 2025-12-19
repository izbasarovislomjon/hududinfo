import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Feedback, 
  statusLabels, 
  statusColors, 
  issueTypeLabels 
} from "@/data/mockData";
import { 
  ThumbsUp, 
  Clock, 
  User, 
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  Loader2,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

interface FeedbackDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: Feedback | null;
  onVote: (id: string) => void;
}

const statusIcons = {
  submitted: Circle,
  reviewing: Loader2,
  in_progress: AlertCircle,
  completed: CheckCircle2,
  rejected: XCircle,
};

export function FeedbackDetailModal({ 
  open, 
  onOpenChange, 
  feedback,
  onVote 
}: FeedbackDetailModalProps) {
  if (!feedback) return null;

  const StatusIcon = statusIcons[feedback.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {issueTypeLabels[feedback.issueType]}
            </Badge>
            <Badge className={`text-xs ${statusColors[feedback.status]}`}>
              {statusLabels[feedback.status]}
            </Badge>
          </div>
          <DialogTitle className="text-lg leading-tight">
            {feedback.objectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Muammo tavsifi
            </h4>
            <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
              {feedback.description}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{feedback.isAnonymous ? "Anonim" : feedback.authorName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(feedback.createdAt), "d MMMM yyyy, HH:mm", { locale: uz })}
              </span>
            </div>
          </div>

          {/* Vote Button */}
          <Button
            variant={feedback.hasVoted ? "secondary" : "outline"}
            onClick={() => onVote(feedback.id)}
            className="w-full gap-2"
          >
            <ThumbsUp className={`h-4 w-4 ${feedback.hasVoted ? "fill-current" : ""}`} />
            <span className="font-medium">{feedback.votes}</span>
            <span>ovoz - Qo'llab-quvvatlash</span>
          </Button>

          <Separator />

          {/* Status Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Murojaat holati</h4>
            <div className="space-y-3">
              {feedback.statusHistory.map((history, index) => {
                const HistoryIcon = statusIcons[history.status];
                const isLast = index === feedback.statusHistory.length - 1;
                
                return (
                  <div key={index} className="relative flex gap-3">
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    {/* Icon */}
                    <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                      isLast ? statusColors[history.status] : 'bg-muted'
                    }`}>
                      <HistoryIcon className={`h-3.5 w-3.5 ${
                        isLast ? '' : 'text-muted-foreground'
                      }`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-medium ${isLast ? '' : 'text-muted-foreground'}`}>
                          {statusLabels[history.status]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(history.date), "d MMM, HH:mm", { locale: uz })}
                        </span>
                      </div>
                      {history.comment && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {history.comment}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
