import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { StarRating } from "@/components/rating/StarRating";
import {
  fetchGeoasrOverview,
  formatGeoasrValue,
  GEOASR_DATASET_LABELS,
  GEOASR_ISSUE_LABELS,
  getGeoasrObjectById,
  type GeoasrOverview,
  type GeoasrUnifiedObject,
} from "@/lib/geoasr-api";
import {
  createLocalReview,
  getLocalObjectById,
  listFeedbackViews,
  listObjectReviews,
  subscribeToLocalBackend,
} from "@/lib/local-backend";
import { objectTypeColors, objectTypeLabels, type InfrastructureObject } from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Loader2,
  MapPin,
  Send,
  Star,
  ThumbsUp,
  Users,
} from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function GeoasrObjectView({ object, overview }: { object: GeoasrUnifiedObject; overview: GeoasrOverview | null }) {
  const navigate = useNavigate();
  const issueSet = new Set(object.issues);
  const regionSummary = overview?.regionBreakdown.find((region) => region.region === object.region);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <section className="py-8 sm:py-12" style={{ background: `linear-gradient(135deg, ${objectTypeColors[object.uiType]}20 0%, ${objectTypeColors[object.uiType]}05 100%)` }}>
        <div className="container-gov">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Orqaga qaytish
          </button>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl shrink-0" style={{ backgroundColor: `${objectTypeColors[object.uiType]}25` }}>
              <Building2 className="h-10 w-10" style={{ color: objectTypeColors[object.uiType] }} />
            </div>
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge style={{ backgroundColor: `${objectTypeColors[object.uiType]}20`, color: objectTypeColors[object.uiType] }}>{objectTypeLabels[object.uiType]}</Badge>
                <Badge variant="secondary">{GEOASR_DATASET_LABELS[object.sourceType]}</Badge>
                <Badge className="bg-red-500 text-white">{object.issueCount} ta muammo</Badge>
              </div>
              <h1 className="mb-2 text-2xl font-bold sm:text-3xl">{object.name}</h1>
              <p className="mb-4 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{object.district}, {object.region}</p>
            </div>
          </div>
        </div>
      </section>
      <div className="container-gov py-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Aniqlangan muammolar</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {object.issues.map((issue) => (
                <Badge key={issue} className="bg-red-500/10 text-red-700 border border-red-200">{GEOASR_ISSUE_LABELS[issue]}</Badge>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Infratuzilma holati</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <InfoRow label="Elektr ta'minoti" value={formatGeoasrValue(object.electricity)} />
              <InfoRow label="Ichimlik suvi" value={formatGeoasrValue(object.waterSource)} />
              <InfoRow label="Internet" value={formatGeoasrValue(object.internet)} />
              <InfoRow label="Sport zal" value={formatGeoasrValue(object.sportsHall)} />
              <InfoRow label="Oshxona" value={formatGeoasrValue(object.cafeteria)} />
              <InfoRow label="Kapital ta'mir" value={formatGeoasrValue(object.repairStatus)} />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Hudud konteksti</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Viloyat" value={object.region} />
              <InfoRow label="Tuman" value={object.district} />
              <InfoRow label="Muammo ulushi" value={`${regionSummary?.issueRate ?? 0}%`} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LocalObjectView({ objectId, object }: { objectId: string; object: InfrastructureObject }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Awaited<ReturnType<typeof listFeedbackViews>>>([]);
  const [reviews, setReviews] = useState<Array<{ id: string; authorName: string; rating: number; comment: string | null; createdAt: string }>>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const load = async () => {
      setFeedbacks(await listFeedbackViews({ objectId, currentUserId: user?.id ?? null }));
      setReviews(await listObjectReviews(objectId));
    };
    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [objectId, user?.id]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <section className="py-8 sm:py-12" style={{ background: `linear-gradient(135deg, ${objectTypeColors[object.type]}20 0%, ${objectTypeColors[object.type]}05 100%)` }}>
        <div className="container-gov">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Orqaga qaytish
          </button>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl shrink-0" style={{ backgroundColor: `${objectTypeColors[object.type]}25` }}>
              <Building2 className="h-10 w-10" style={{ color: objectTypeColors[object.type] }} />
            </div>
            <div className="flex-1">
              <Badge style={{ backgroundColor: `${objectTypeColors[object.type]}20`, color: objectTypeColors[object.type] }}>{objectTypeLabels[object.type]}</Badge>
              <h1 className="mt-3 mb-2 text-2xl font-bold sm:text-3xl">{object.name}</h1>
              <p className="mb-4 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{object.address}, {object.district}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {object.built_year && <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />Qurilgan: {object.built_year}</span>}
                {object.capacity && <span className="flex items-center gap-2"><Users className="h-4 w-4" />Sig'imi: {object.capacity}</span>}
                <span className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" />{object.rating.toFixed(1)} reyting</span>
              </div>
            </div>
            <Button onClick={() => navigate(`/submit?type=${object.type}`)}>Murojaat yuborish</Button>
          </div>
        </div>
      </section>

      <div className="container-gov py-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>So'nggi murojaatlar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {feedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hozircha murojaatlar yo'q.</p>
              ) : (
                feedbacks.map((feedback) => (
                  <div key={feedback.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <Badge variant="outline">{feedback.display_name}</Badge>
                      <span className="text-[10px] font-semibold" style={{ color: feedback.submitter.titleColor }}>
                        {feedback.submitter.titleEmoji} {feedback.submitter.titleLabel}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">{feedback.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{feedback.status}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{feedback.votes}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sharh qoldirish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <StarRating rating={newRating} size="lg" interactive onRatingChange={setNewRating} />
              <Textarea value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder="Sharh yozing..." rows={3} />
              <Button
                disabled={!user || newRating === 0}
                onClick={async () => {
                  if (!user || newRating === 0) return;
                  await createLocalReview({ userId: user.id, objectId, rating: newRating, comment: newComment });
                  setNewRating(0);
                  setNewComment("");
                }}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" /> Sharh yuborish
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sharhlar ({reviews.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm font-medium">{review.authorName}</span>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Ma'lumotlar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Viloyat" value={object.region} />
              <InfoRow label="Tuman" value={object.district} />
              <InfoRow label="Murojaatlar" value={String(object.total_feedbacks)} />
              <InfoRow label="Sharhlar" value={String(object.total_reviews)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ObjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [geoObject, setGeoObject] = useState<GeoasrUnifiedObject | null>(null);
  const [overview, setOverview] = useState<GeoasrOverview | null>(null);
  const [localObject, setLocalObject] = useState<InfrastructureObject | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      if (id.startsWith("geoasr:")) {
        const [object, nextOverview] = await Promise.all([getGeoasrObjectById(id), fetchGeoasrOverview()]);
        setGeoObject(object);
        setOverview(nextOverview);
        setLocalObject(null);
        setLoading(false);
        return;
      }

      const object = await getLocalObjectById(id);
      setLocalObject(object);
      setGeoObject(null);
      setOverview(null);
      setLoading(false);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-28">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!geoObject && !localObject) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container-gov py-16 text-center">
          <h1 className="mb-3 text-2xl font-bold">Ob'ekt topilmadi</h1>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">Tanlangan ob'ekt hozircha mavjud emas.</p>
          <Link to="/statistics"><Button>Statistikaga qaytish</Button></Link>
        </div>
      </div>
    );
  }

  if (geoObject) {
    return <GeoasrObjectView object={geoObject} overview={overview} />;
  }

  return <LocalObjectView objectId={id!} object={localObject!} />;
}
