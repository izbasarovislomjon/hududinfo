import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Search,
  Newspaper,
  ArrowRight,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { listLocalNews, subscribeToLocalBackend, type LocalNewsRecord } from "@/lib/local-backend";

const regions = [
  "Barcha viloyatlar",
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon viloyati",
  "Buxoro viloyati",
  "Farg'ona viloyati",
  "Jizzax viloyati",
  "Namangan viloyati",
  "Navoiy viloyati",
  "Qashqadaryo viloyati",
  "Qoraqolpog'iston Respublikasi",
  "Samarqand viloyati",
  "Sirdaryo viloyati",
  "Surxondaryo viloyati",
  "Xorazm viloyati",
];

const categories = [
  { value: "all", label: "Barcha yangiliklar" },
  { value: "infrastructure", label: "Infratuzilma" },
  { value: "education", label: "Ta'lim" },
  { value: "health", label: "Sog'liqni saqlash" },
  { value: "water", label: "Suv ta'minoti" },
  { value: "road", label: "Yo'l qurilishi" },
];

const categoryConfig: Record<string, { color: string; bg: string; label: string }> = {
  infrastructure: { color: "hsl(205 78% 55%)", bg: "hsl(205 78% 55% / 0.12)", label: "Infratuzilma" },
  education: { color: "hsl(152 65% 46%)", bg: "hsl(152 65% 46% / 0.12)", label: "Ta'lim" },
  health: { color: "hsl(4 82% 62%)", bg: "hsl(4 82% 62% / 0.12)", label: "Sog'liq" },
  water: { color: "hsl(186 72% 44%)", bg: "hsl(186 72% 44% / 0.12)", label: "Suv" },
  road: { color: "hsl(39 96% 56%)", bg: "hsl(39 96% 56% / 0.12)", label: "Yo'l" },
};

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Barcha viloyatlar");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [news, setNews] = useState<LocalNewsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const items = await listLocalNews({
        publishedOnly: true,
        region: selectedRegion,
        category: selectedCategory,
        search: searchQuery,
      });
      setNews(items);
      setLoading(false);
    };

    void load();
    const unsubscribe = subscribeToLocalBackend(() => {
      void load();
    });
    return unsubscribe;
  }, [searchQuery, selectedCategory, selectedRegion]);

  const getCfg = (category: string) =>
    categoryConfig[category] ?? { color: "hsl(215 14% 48%)", bg: "hsl(215 14% 48% / 0.1)", label: category };

  const hasFilters = searchQuery || selectedRegion !== "Barcha viloyatlar" || selectedCategory !== "all";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container-gov py-8 sm:py-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Yangiliklar</h1>
          <p className="text-muted-foreground max-w-xl">Hududlardagi murojaatlar, ta'mirlar va xizmat o'zgarishlari bo'yicha so'nggi yangiliklar.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 mb-6 p-4 rounded-xl border border-border bg-white animate-slide-up shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input placeholder="Yangilik qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-background border-border text-sm focus-visible:ring-primary" />
            {searchQuery && (
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearchQuery("") }>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full sm:w-[200px] h-9 bg-background border-border text-sm"><SelectValue placeholder="Viloyat tanlang" /></SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region} className="text-sm">{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background border-border text-sm"><SelectValue placeholder="Kategoriya" /></SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value} className="text-sm">{category.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <button onClick={() => { setSearchQuery(""); setSelectedRegion("Barcha viloyatlar"); setSelectedCategory("all"); }} className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive border border-border hover:border-destructive/40 transition-colors shrink-0">
              <X className="h-3 w-3" /> Tozalash
            </button>
          )}
        </div>

        {!loading && (
          <div className="mb-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{news.length}</span> ta yangilik
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="rounded-xl border border-border bg-white overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && news.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item, index) => {
              const cfg = getCfg(item.category);
              return (
                <Link key={item.id} to={`/news/${item.id}`} className="group block bg-white rounded-xl border border-border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20" style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}>
                  <div className="h-44 overflow-hidden relative bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Newspaper className="h-10 w-10 text-primary/45" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.publishedAt), "d MMM", { locale: uz })}
                      </span>
                    </div>
                    <h2 className="font-semibold text-foreground leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.summary || item.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 min-w-0">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.region || "Hududsiz"}</span>
                      </span>
                      <span className="font-semibold text-primary flex items-center gap-1">
                        O'qish <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && news.length === 0 && (
          <div className="py-14 text-center">
            <Newspaper className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Filtrlar bo'yicha yangilik topilmadi.</p>
          </div>
        )}
      </main>
    </div>
  );
}
