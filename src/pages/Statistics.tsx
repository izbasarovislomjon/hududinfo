import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  Loader2,
  MapPin,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { PriorityMap } from "@/components/map/PriorityMap";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  fetchGeoasrOverview,
  type GeoasrOverview,
  GEOASR_DATASET_LABELS,
} from "@/lib/geoasr-api";

const CHART_COLORS = [
  "hsl(221 83% 47%)",
  "hsl(175 65% 36%)",
  "hsl(3 78% 54%)",
  "hsl(36 90% 48%)",
  "hsl(148 64% 36%)",
  "hsl(200 80% 44%)",
  "hsl(280 58% 54%)",
];

interface TooltipPayloadItem {
  fill?: string;
  color?: string;
  name?: string;
  value?: number | string;
}

function DarkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid hsl(214 20% 88%)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "12px",
        color: "hsl(215 30% 12%)",
        boxShadow: "0 4px 12px hsl(215 30% 12% / 0.1)",
      }}
    >
      {label && (
        <p
          style={{
            color: "hsl(215 14% 48%)",
            fontSize: "11px",
            marginBottom: "4px",
            fontWeight: 600,
          }}
        >
          {label}
        </p>
      )}
      {payload.map((item, index) => (
        <p key={index} style={{ color: item.fill || item.color || "hsl(221 83% 47%)" }}>
          {item.name ? `${item.name}: ` : ""}
          <strong>{item.value}</strong>
        </p>
      ))}
    </div>
  );
}

function BigStat({
  value,
  label,
  sub,
  color = "hsl(221 83% 47%)",
  delay = "0s",
}: {
  value: string | number;
  label: string;
  sub?: string;
  color?: string;
  delay?: string;
}) {
  return (
    <div
      className="animate-slide-up rounded-xl border border-border bg-white p-5 flex flex-col gap-1 transition-all hover:shadow-md"
      style={{ animationDelay: delay }}
    >
      <span className="text-3xl font-bold leading-none" style={{ color }}>
        {value}
      </span>
      <span className="mt-1 text-xs font-semibold text-muted-foreground">{label}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function Statistics() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<GeoasrOverview | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchGeoasrOverview();
        if (mounted) {
          setOverview(data);
        }
      } catch (error) {
        console.error("Statistics fetch error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const derived = useMemo(() => {
    if (!overview) {
      return null;
    }

    const regionData = overview.regionBreakdown
      .filter((region) => region.totalObjects > 0)
      .slice(0, 8)
      .map((region) => ({
        name: region.region.replace(" viloyati", ""),
        value: region.issueObjects,
        total: region.totalObjects,
      }));

    const datasetIssueData = overview.datasetSummary.map((dataset, index) => ({
      name: dataset.label,
      value: dataset.issueObjects,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    const mostAffectedRegion =
      overview.regionBreakdown.find((region) => region.issueObjects > 0) ?? null;

    const averageIssueLoad =
      overview.issueObjects > 0
        ? (overview.issueOccurrences / overview.issueObjects).toFixed(1)
        : "0.0";

    const healthyRate =
      overview.totalObjects > 0
        ? Math.round((overview.healthyObjects / overview.totalObjects) * 100)
        : 0;

    return {
      regionData,
      datasetIssueData,
      mostAffectedRegion,
      averageIssueLoad,
      healthyRate,
    };
  }, [overview]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center gap-3 py-28">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!overview || !derived) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container-gov py-12 text-center text-sm text-muted-foreground">
          Statistik ma'lumotlarni yuklab bo'lmadi.
        </div>
      </div>
    );
  }

  const schoolSummary = overview.datasetSummary.find((item) => item.type === "maktab");
  const kindergartenSummary = overview.datasetSummary.find(
    (item) => item.type === "bogcha",
  );
  const healthSummary = overview.datasetSummary.find((item) => item.type === "ssv");

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <section className="bg-primary px-4 py-6 text-white">
        <div className="container-gov">
          <h1 className="mb-1 text-2xl font-bold">{t("statistics.title")}</h1>
          <p className="text-sm text-white/75">{t("statistics.subtitle")}</p>
        </div>
      </section>

      <div className="container-gov space-y-8 py-6">
        {Object.keys(overview.errors).length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Ayrim GEOASR manbalari vaqtincha ishlamadi. Statistikalar mavjud
              bo'lgan ma'lumotlar asosida hisoblandi.
            </span>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-semibold">Prioritet xarita</span>
            </div>
            <span className="text-xs text-muted-foreground">Viloyat → tuman → ob'ekt ko'rinishi</span>
          </div>
          <div className="p-4">
            <PriorityMap />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Asosiy ko'rsatkichlar
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BigStat
              value={overview.totalObjects}
              label="Jami ob'ektlar"
              sub="3 ta GEOASR manbasi"
              color="hsl(221 83% 47%)"
            />
            <BigStat
              value={overview.issueObjects}
              label="Muammoli ob'ektlar"
              sub={`${overview.affectedRegions} ta hududda aniqlangan`}
              color="hsl(3 78% 54%)"
              delay="0.08s"
            />
            <BigStat
              value={overview.healthyObjects}
              label="Barqaror holat"
              sub={`${derived.healthyRate}% ob'ekt joriy xavfsiz zonada`}
              color="hsl(152 65% 46%)"
              delay="0.16s"
            />
            <BigStat
              value={overview.issueOccurrences}
              label="Jami muammo holati"
              sub={`${derived.averageIssueLoad} ta muammo / ob'ekt`}
              color="hsl(39 96% 56%)"
              delay="0.24s"
            />
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Manbalar kesimida
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BigStat
              value={schoolSummary?.total ?? 0}
              label={GEOASR_DATASET_LABELS.maktab}
              sub={`${schoolSummary?.issueObjects ?? 0} ta muammoli ob'ekt`}
              color="hsl(221 83% 47%)"
            />
            <BigStat
              value={kindergartenSummary?.total ?? 0}
              label={GEOASR_DATASET_LABELS.bogcha}
              sub={`${kindergartenSummary?.issueObjects ?? 0} ta muammoli ob'ekt`}
              color="hsl(280 58% 54%)"
              delay="0.08s"
            />
            <BigStat
              value={healthSummary?.total ?? 0}
              label={GEOASR_DATASET_LABELS.ssv}
              sub={`${healthSummary?.issueObjects ?? 0} ta muammoli ob'ekt`}
              color="hsl(3 78% 54%)"
              delay="0.16s"
            />
            <BigStat
              value={derived.mostAffectedRegion?.issueObjects ?? 0}
              label="Eng yuklangan hudud"
              sub={derived.mostAffectedRegion?.region ?? "Ma'lumot yo'q"}
              color="hsl(175 65% 36%)"
              delay="0.24s"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
              <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm font-semibold">Muammo turlari bo'yicha holat</span>
            </div>
            <div className="p-5">
              {overview.issueTypeBreakdown.length === 0 ? (
                <EmptyChart />
              ) : (
                <>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overview.issueTypeBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {overview.issueTypeBreakdown.map((_, index) => (
                            <Cell
                              key={index}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                              stroke="hsl(222 30% 11%)"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<DarkTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    {overview.issueTypeBreakdown.map((item, index) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                            style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
              <TrendingUp className="h-4 w-4 shrink-0 text-accent" />
              <span className="text-sm font-semibold">Muammoli ob'ektlar manba bo'yicha</span>
            </div>
            <div className="p-5">
              {derived.datasetIssueData.every((item) => item.value === 0) ? (
                <EmptyChart />
              ) : (
                <>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={derived.datasetIssueData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {derived.datasetIssueData.map((item, index) => (
                            <Cell
                              key={item.name}
                              fill={item.color}
                              stroke="hsl(222 30% 11%)"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<DarkTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    {derived.datasetIssueData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-sm shrink-0"
                            style={{ background: item.color }}
                          />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: item.color }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm font-semibold">Hududlar bo'yicha muammoli ob'ektlar</span>
          </div>
          <div className="p-5">
            {derived.regionData.length === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derived.regionData} margin={{ top: 4, right: 4, left: -16, bottom: 60 }}>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(222 22% 20%)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(215 14% 48%)", fontSize: 11 }}
                      axisLine={{ stroke: "hsl(214 20% 88%)" }}
                      tickLine={false}
                      angle={-38}
                      textAnchor="end"
                      height={72}
                    />
                    <YAxis
                      tick={{ fill: "hsl(215 14% 48%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<DarkTooltip />}
                      cursor={{ fill: "hsl(222 22% 19% / 0.5)" }}
                    />
                    <Bar
                      dataKey="value"
                      name="Muammoli ob'ektlar"
                      fill="hsl(221 83% 47%)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={48}
                    >
                      {derived.regionData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={`hsl(221 83% ${47 + index * 3}% / ${1 - index * 0.06})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {overview.totalObjects === 0 && (
          <div className="rounded-xl border border-border bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1.5 text-base font-semibold">Hali ma'lumot yo'q</h3>
            <p className="mx-auto max-w-xs text-sm text-muted-foreground">
              GEOASR ma'lumotlari qayta yuklangandan so'ng bu yerda hududlar
              kesimidagi statistikalar ko'rinadi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border">
        <span className="text-xs font-medium">0</span>
      </div>
      <span className="text-xs text-muted-foreground">Ma'lumot yo'q</span>
    </div>
  );
}
