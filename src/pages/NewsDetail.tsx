import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getLocalNewsById, subscribeToLocalBackend, type LocalNewsRecord } from "@/lib/local-backend";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { ArrowLeft, Calendar, MapPin, Loader2, Newspaper, Play } from "lucide-react";

const categories = [
  { value: "general", label: "Umumiy" },
  { value: "infrastructure", label: "Infratuzilma" },
  { value: "education", label: "Ta'lim" },
  { value: "health", label: "Sog'liqni saqlash" },
  { value: "water", label: "Suv ta'minoti" },
  { value: "road", label: "Yo'l qurilishi" },
];

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<LocalNewsRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setNews(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const item = await getLocalNewsById(id);
      setNews(item?.isPublished ? item : null);
      setLoading(false);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [id]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "infrastructure": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "education": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "health": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "water": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "road": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryLabel = (category: string) => categories.find((item) => item.value === category)?.label || category;

  const isVideoUrl = (url: string) => {
    const lowerUrl = url.toLowerCase();
    return [".mp4", ".webm", ".ogg", ".mov"].some((ext) => lowerUrl.includes(ext)) || lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("vimeo.com");
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="container-gov py-12 text-center">
          <Newspaper className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Yangilik topilmadi</h1>
          <p className="text-muted-foreground mb-6">Tanlangan yangilik mavjud emas yoki hali chop etilmagan.</p>
          <Link to="/news">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Yangiliklarga qaytish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container-gov py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Yangiliklarga qaytish
        </Button>

        <article className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={getCategoryColor(news.category)}>
              {getCategoryLabel(news.category)}
            </Badge>
            {news.region && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {news.region}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(news.publishedAt), "d MMMM yyyy", { locale: uz })}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{news.title}</h1>
          {news.summary && <p className="text-lg text-muted-foreground leading-relaxed">{news.summary}</p>}

          {news.imageUrl && (
            <div className="rounded-xl overflow-hidden border">
              <img src={news.imageUrl} alt={news.title} className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          {news.videoUrl && isVideoUrl(news.videoUrl) && (
            <div className="rounded-xl overflow-hidden border aspect-video">
              {news.videoUrl.includes("youtube") || news.videoUrl.includes("youtu.be") || news.videoUrl.includes("vimeo") ? (
                <iframe src={getEmbedUrl(news.videoUrl)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <video src={news.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          )}

          {!news.imageUrl && !news.videoUrl && (
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 h-64 flex items-center justify-center">
              <Play className="h-10 w-10 text-primary/50" />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {news.content.split("\n").map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index} className="text-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ) : null,
            )}
          </div>

          <div className="border-t pt-6 mt-8">
            <Link to="/news">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Yangiliklarga qaytish
              </Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
