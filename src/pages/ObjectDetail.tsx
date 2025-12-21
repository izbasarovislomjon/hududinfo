import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { SolutionRatingModal } from "@/components/feedback/SolutionRatingModal";
import { SolutionRatingCard } from "@/components/feedback/SolutionRatingCard";
import { StarRating } from "@/components/rating/StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  InfrastructureObject, 
  ObjectType,
  objectTypeLabels,
  objectTypeColors,
  issueTypeLabels,
  statusLabels,
  FeedbackStatus
} from "@/lib/types";
import { 
  MapPin, 
  Star, 
  MessageSquare, 
  Calendar,
  Users,
  Building2,
  ArrowLeft,
  Loader2,
  MessageSquarePlus,
  Clock,
  Image as ImageIcon,
  Send,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";

interface SolutionRating {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  images: { image_url: string }[];
}

interface FeedbackWithImages {
  id: string;
  issue_type: string;
  description: string;
  status: FeedbackStatus;
  created_at: string;
  votes: number;
  images: { image_url: string }[];
  solution_ratings: SolutionRating[];
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  author_name: string | null;
  created_at: string;
}

export default function ObjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [object, setObject] = useState<InfrastructureObject | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackWithImages[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [solutionRatingModalOpen, setSolutionRatingModalOpen] = useState(false);
  const [selectedFeedbackForRating, setSelectedFeedbackForRating] = useState<FeedbackWithImages | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedFeedbackImages, setSelectedFeedbackImages] = useState<string[]>([]);
  
  // Review form state
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchObjectDetails();
    }
  }, [id]);

  const fetchObjectDetails = async () => {
    setLoading(true);
    
    // Fetch object
    const { data: objData, error: objError } = await supabase
      .from('infrastructure_objects')
      .select('*')
      .eq('id', id)
      .single();

    if (objError) {
      console.error('Error fetching object:', objError);
      setLoading(false);
      return;
    }

    const mappedObject: InfrastructureObject = {
      id: objData.id,
      name: objData.name,
      type: objData.type as ObjectType,
      address: objData.address,
      region: objData.region,
      district: objData.district,
      lat: Number(objData.lat),
      lng: Number(objData.lng),
      rating: Number(objData.rating) || 0,
      total_reviews: objData.total_reviews || 0,
      total_feedbacks: objData.total_feedbacks || 0,
      is_new: objData.is_new || false,
      is_reconstructed: objData.is_reconstructed || false,
      capacity: objData.capacity || undefined,
      built_year: objData.built_year || undefined,
      last_renovation: objData.last_renovation || undefined,
    };
    setObject(mappedObject);

    // Fetch feedbacks with images and solution ratings
    const { data: feedbackData } = await supabase
      .from('feedbacks')
      .select(`
        id,
        issue_type,
        description,
        status,
        created_at,
        votes,
        feedback_images (image_url),
        solution_ratings (
          id,
          rating,
          comment,
          created_at,
          solution_rating_images (image_url)
        )
      `)
      .eq('object_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (feedbackData) {
      setFeedbacks(feedbackData.map(f => ({
        ...f,
        status: f.status as FeedbackStatus,
        images: f.feedback_images || [],
        solution_ratings: (f.solution_ratings || []).map((sr: any) => ({
          ...sr,
          images: sr.solution_rating_images || []
        }))
      })));
    }

    // Fetch reviews
    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*')
      .eq('object_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (reviewData) {
      setReviews(reviewData);
    }

    setLoading(false);
  };

  const getStatusColor = (status: FeedbackStatus) => {
    const colors: Record<FeedbackStatus, string> = {
      submitted: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      reviewing: "bg-blue-500/10 text-blue-700 border-blue-200",
      in_progress: "bg-purple-500/10 text-purple-700 border-purple-200",
      completed: "bg-green-500/10 text-green-700 border-green-200",
      rejected: "bg-red-500/10 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700";
  };

  const openImageGallery = (images: string[], index: number) => {
    setSelectedFeedbackImages(images);
    setSelectedImageIndex(index);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Kirish kerak",
        description: "Sharh qoldirish uchun tizimga kiring",
        variant: "destructive",
      });
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Reyting tanlang",
        description: "Iltimos, yulduzchalarni bosib reyting bering",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);

    const { error } = await supabase.from('reviews').insert({
      object_id: id,
      user_id: user.id,
      rating: newRating,
      comment: newComment || null,
      author_name: user.email?.split('@')[0] || "Foydalanuvchi",
    });

    if (error) {
      toast({
        title: "Xatolik",
        description: "Sharh qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Muvaffaqiyat",
        description: "Sharhingiz qo'shildi!",
      });
      setNewRating(0);
      setNewComment("");
      fetchObjectDetails(); // Refresh data
    }

    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container-gov py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Obyekt topilmadi</h1>
          <Link to="/">
            <Button>Bosh sahifaga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="py-8 sm:py-12"
        style={{ 
          background: `linear-gradient(135deg, ${objectTypeColors[object.type]}20 0%, ${objectTypeColors[object.type]}05 100%)`
        }}
      >
        <div className="container-gov">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Orqaga qaytish
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div 
              className="h-20 w-20 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: objectTypeColors[object.type] + "25" }}
            >
              <Building2 
                className="h-10 w-10" 
                style={{ color: objectTypeColors[object.type] }}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge 
                  style={{ 
                    backgroundColor: objectTypeColors[object.type] + "20",
                    color: objectTypeColors[object.type]
                  }}
                >
                  {objectTypeLabels[object.type]}
                </Badge>
                {object.is_new && (
                  <Badge className="bg-green-500 text-white">Yangi</Badge>
                )}
                {object.is_reconstructed && (
                  <Badge className="bg-blue-500 text-white">Ta'mirlangan</Badge>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{object.name}</h1>
              
              <p className="text-muted-foreground flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4" />
                {object.address}, {object.district}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold">{object.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({object.total_reviews} sharh)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{object.total_feedbacks} murojaat</span>
                </div>
                {object.built_year && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Qurilgan: {object.built_year}</span>
                  </div>
                )}
                {object.capacity && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Sig'imi: {object.capacity}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => setFeedbackModalOpen(true)}
            >
              <MessageSquarePlus className="h-5 w-5" />
              Murojaat yuborish
            </Button>
          </div>
        </div>
      </section>

      <div className="container-gov py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Feedbacks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  So'nggi murojaatlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Hozircha murojaatlar yo'q
                  </p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <Badge variant="outline">
                            {issueTypeLabels[feedback.issue_type as keyof typeof issueTypeLabels]}
                          </Badge>
                          <Badge className={getStatusColor(feedback.status)}>
                            {statusLabels[feedback.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {feedback.description}
                        </p>
                        
                        {/* Images */}
                        {feedback.images.length > 0 && (
                          <div className="flex gap-2">
                            {feedback.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.image_url}
                                alt={`Rasm ${idx + 1}`}
                                className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openImageGallery(feedback.images.map(i => i.image_url), idx)}
                              />
                            ))}
                            {feedback.images.length > 3 && (
                              <div 
                                className="h-16 w-16 bg-muted rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/80"
                                onClick={() => openImageGallery(feedback.images.map(i => i.image_url), 3)}
                              >
                                <span className="text-sm font-medium">+{feedback.images.length - 3}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(feedback.created_at), 'dd.MM.yyyy')}
                            </span>
                            <span>{feedback.votes} ovoz</span>
                          </div>
                          
                          {/* Rate solution button for completed feedbacks */}
                          {feedback.status === 'completed' && user && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => {
                                setSelectedFeedbackForRating(feedback);
                                setSolutionRatingModalOpen(true);
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Yechimni baholash
                            </Button>
                          )}
                        </div>

                        {/* Solution ratings */}
                        {feedback.solution_ratings && feedback.solution_ratings.length > 0 && (
                          <div className="pt-2 border-t space-y-2">
                            <p className="text-xs font-medium text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Fuqarolar baholari ({feedback.solution_ratings.length})
                            </p>
                            {feedback.solution_ratings.slice(0, 2).map((sr) => (
                              <SolutionRatingCard
                                key={sr.id}
                                rating={sr}
                                onImageClick={openImageGallery}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Review Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Sharh qoldirish
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Reyting bering:</p>
                    <StarRating
                      rating={newRating}
                      size="lg"
                      interactive
                      onRatingChange={setNewRating}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Sharh yozing (ixtiyoriy)..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={submittingReview || newRating === 0}
                    className="w-full gap-2"
                  >
                    {submittingReview ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Sharh yuborish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Sharhlar ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Hozircha sharhlar yo'q
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-foreground mb-2">{review.comment}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{review.author_name || "Anonim"}</span>
                          <span>•</span>
                          <span>{format(new Date(review.created_at), 'dd.MM.yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Umumiy reyting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-1">{object.rating.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    <StarRating rating={object.rating} size="md" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {object.total_reviews} ta sharh asosida
                  </p>
                </div>
                
                {/* Rating breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <Progress value={rating === 5 ? 60 : rating === 4 ? 25 : 10} className="flex-1 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Object Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ma'lumotlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tuman</span>
                  <span className="font-medium">{object.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Viloyat</span>
                  <span className="font-medium">{object.region}</span>
                </div>
                {object.built_year && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qurilgan yil</span>
                    <span className="font-medium">{object.built_year}</span>
                  </div>
                )}
                {object.last_renovation && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oxirgi ta'mir</span>
                    <span className="font-medium">{object.last_renovation}</span>
                  </div>
                )}
                {object.capacity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sig'imi</span>
                    <span className="font-medium">{object.capacity} kishi</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <img
            src={selectedFeedbackImages[selectedImageIndex]}
            alt="To'liq o'lchamli rasm"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setSelectedImageIndex(null)}
          >
            ✕
          </button>
        </div>
      )}

      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        selectedObject={object}
      />

      {selectedFeedbackForRating && (
        <SolutionRatingModal
          open={solutionRatingModalOpen}
          onOpenChange={setSolutionRatingModalOpen}
          feedbackId={selectedFeedbackForRating.id}
          feedbackDescription={selectedFeedbackForRating.description}
          onSuccess={fetchObjectDetails}
        />
      )}
    </div>
  );
}