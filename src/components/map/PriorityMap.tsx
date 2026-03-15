import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { LatLngBounds, Layer, LeafletMouseEvent, Path } from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle } from "lucide-react";
import { objectTypeLabels, type ObjectType } from "@/lib/types";
import {
  fetchGeoasrOverview,
  GEOASR_DATASET_LABELS,
  SHAPE_TO_API_REGION,
  type GeoasrOverview,
} from "@/lib/geoasr-api";
import { listFeedbackViews, listLocalObjects, subscribeToLocalBackend } from "@/lib/local-backend";

interface MapObjectPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: ObjectType;
  address: string;
  district: string;
  region: string;
  openCount: number;
}

type RegionLayer = Layer &
  Path & {
    bindTooltip: (content: string, options?: object) => void;
    getBounds: () => LatLngBounds;
    getElement?: () => Element | undefined;
    _map?: {
      fitBounds: (bounds: LatLngBounds, options?: { padding: [number, number] }) => void;
    };
  };

interface PriorityScale {
  attention: number;
  severe: number;
}

function buildPriorityScale(overview: GeoasrOverview | null): PriorityScale {
  const counts = (overview?.regionBreakdown ?? [])
    .map((region) => region.issueObjects)
    .filter((count) => count > 0)
    .sort((left, right) => left - right);

  if (counts.length === 0) {
    return { attention: 1, severe: 2 };
  }

  const max = counts[counts.length - 1];
  if (max <= 6) {
    return { attention: 1, severe: 3 };
  }

  const attention = Math.max(2, Math.ceil(max / 3));
  const severe = Math.max(attention + 1, Math.ceil((max * 2) / 3));
  return { attention, severe };
}

function getPriorityStyle(count: number, scale: PriorityScale) {
  if (count >= scale.severe) {
    return { fill: "#ef4444", hover: "#dc2626", label: "Jiddiy" };
  }
  if (count >= scale.attention) {
    return { fill: "#f59e0b", hover: "#d97706", label: "Diqqat" };
  }
  return { fill: "#22c55e", hover: "#16a34a", label: "Yaxshi" };
}

function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  });
  return null;
}

function DistrictLayer({ objects }: { objects: MapObjectPoint[] }) {
  const districts = useMemo(() => {
    const grouped = new Map<string, { lat: number; lng: number; count: number; open: number }>();
    objects.forEach((object) => {
      const key = `${object.region}::${object.district}`;
      if (!grouped.has(key)) {
        grouped.set(key, { lat: 0, lng: 0, count: 0, open: 0 });
      }
      const entry = grouped.get(key)!;
      entry.lat += object.lat;
      entry.lng += object.lng;
      entry.count += 1;
      entry.open += object.openCount;
    });
    return Array.from(grouped.entries()).map(([key, value]) => {
      const [, district] = key.split("::");
      return {
        name: district,
        lat: value.lat / value.count,
        lng: value.lng / value.count,
        open: value.open,
      };
    });
  }, [objects]);

  return (
    <>
      {districts.map((district) => {
        const style = getPriorityStyle(district.open, { attention: 1, severe: 3 });
        return (
          <CircleMarker
            key={district.name}
            center={[district.lat, district.lng]}
            radius={10 + Math.min(district.open * 2, 16)}
            pathOptions={{ fillColor: style.fill, fillOpacity: 0.8, color: style.hover, weight: 2 }}
          >
            <Popup>
              <strong>{district.name}</strong>
              <br />
              <span style={{ color: style.fill }}>{style.label}</span>
              {district.open > 0 && <> · {district.open} ta ochiq murojaat</>}
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

function ObjectLayer({ objects }: { objects: MapObjectPoint[] }) {
  return (
    <>
      {objects.map((object) => {
        const style = getPriorityStyle(object.openCount, { attention: 1, severe: 3 });
        return (
          <CircleMarker
            key={object.id}
            center={[object.lat, object.lng]}
            radius={8}
            pathOptions={{ fillColor: style.fill, fillOpacity: 0.9, color: style.hover, weight: 2 }}
          >
            <Popup minWidth={200}>
              <p className="font-semibold text-sm mb-0.5">{object.name}</p>
              <p className="text-xs text-muted-foreground mb-1">
                {objectTypeLabels[object.type]} · {object.district}
              </p>
              <p className="text-xs" style={{ color: style.fill }}>
                {object.openCount === 0 ? "Ochiq murojaat yo'q" : `${object.openCount} ta ochiq murojaat`}
              </p>
              <a href={`/object/${object.id}`} className="text-xs text-blue-600 hover:underline">
                Batafsil →
              </a>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export function PriorityMap() {
  const [overview, setOverview] = useState<GeoasrOverview | null>(null);
  const [regionGeoJson, setRegionGeoJson] = useState<FeatureCollection<Geometry> | null>(null);
  const [localObjects, setLocalObjects] = useState<MapObjectPoint[]>([]);
  const [zoom, setZoom] = useState(6);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, geojsonResponse, objects, feedbacks] = await Promise.all([
        fetchGeoasrOverview(),
        fetch("/uzbekistan-regions.geojson"),
        listLocalObjects(),
        listFeedbackViews(),
      ]);

      const openCounts = new Map<string, number>();
      feedbacks
        .filter((feedback) => !["completed", "rejected"].includes(feedback.status))
        .forEach((feedback) => {
          openCounts.set(feedback.object_id, (openCounts.get(feedback.object_id) ?? 0) + 1);
        });

      setOverview(overviewData);
      setRegionGeoJson(await geojsonResponse.json());
      setLocalObjects(
        objects.map((object) => ({
          id: object.id,
          name: object.name,
          lat: Number(object.lat),
          lng: Number(object.lng),
          type: object.type,
          address: object.address,
          district: object.district,
          region: object.region,
          openCount: openCounts.get(object.id) ?? 0,
        })),
      );
    } catch (error) {
      console.error("Priority map load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    const unsubscribe = subscribeToLocalBackend(() => {
      void loadData();
    });
    return unsubscribe;
  }, []);

  const regionStats = useMemo(
    () => new Map((overview?.regionBreakdown ?? []).map((region) => [region.region, region])),
    [overview],
  );
  const scale = useMemo(() => buildPriorityScale(overview), [overview]);

  const regionStyle = (feature?: Feature<Geometry, { shapeName?: string }>) => {
    const shapeName = feature?.properties?.shapeName ?? "";
    const regionName = SHAPE_TO_API_REGION[shapeName] ?? shapeName;
    const issueObjects = regionStats.get(regionName)?.issueObjects ?? 0;
    const style = getPriorityStyle(issueObjects, scale);
    return { fillColor: style.fill, fillOpacity: 0.68, color: "#ffffff", weight: 1.4, opacity: 1 };
  };

  const onEachRegion = (feature: Feature<Geometry, { shapeName?: string }>, layer: Layer) => {
    const regionLayer = layer as unknown as RegionLayer;
    const shapeName = feature.properties?.shapeName ?? "";
    const regionName = SHAPE_TO_API_REGION[shapeName] ?? shapeName;
    const stats = regionStats.get(regionName);
    const issueObjects = stats?.issueObjects ?? 0;
    const totalObjects = stats?.totalObjects ?? 0;
    const style = getPriorityStyle(issueObjects, scale);
    const datasetSummary = stats
      ? [
          `${GEOASR_DATASET_LABELS.maktab}: ${stats.datasets.maktab.issues}/${stats.datasets.maktab.total}`,
          `${GEOASR_DATASET_LABELS.bogcha}: ${stats.datasets.bogcha.issues}/${stats.datasets.bogcha.total}`,
          `${GEOASR_DATASET_LABELS.ssv}: ${stats.datasets.ssv.issues}/${stats.datasets.ssv.total}`,
        ].join("<br/>")
      : "Ma'lumot yo'q";

    regionLayer.bindTooltip(
      `<div style="font-family:sans-serif;min-width:180px;padding:2px 0">
        <strong style="font-size:13px">${regionName}</strong><br/>
        <span style="color:${style.fill};font-weight:700">${style.label}</span>
        <span style="color:#475569"> · ${issueObjects} ta muammoli ob'ekt</span><br/>
        <span style="color:#64748b">Jami: ${totalObjects} · Ulush: ${stats?.issueRate ?? 0}%</span><br/>
        <div style="margin-top:6px;color:#334155;font-size:11px;line-height:1.45">${datasetSummary}</div>
      </div>`,
      { sticky: true, opacity: 0.97 },
    );

    regionLayer.on({
      add: () => {
        regionLayer.getElement?.()?.setAttribute("tabindex", "-1");
      },
      click: () => {
        const map = regionLayer._map;
        if (map && regionLayer.getBounds) {
          map.fitBounds(regionLayer.getBounds(), { padding: [24, 24] });
        }
      },
      mouseover: (event: LeafletMouseEvent) => (event.target as Path).setStyle({ fillOpacity: 0.85 }),
      mouseout: (event: LeafletMouseEvent) => (event.target as Path).setStyle({ fillOpacity: 0.68 }),
    });
  };

  const regionKey = Array.from(regionStats.entries()).map(([key, value]) => `${key}:${value.issueObjects}`).join(",");

  if (loading) {
    return <div className="h-[480px] w-full rounded-xl bg-muted animate-pulse" />;
  }

  if (!regionGeoJson || !overview) {
    return (
      <div className="h-[480px] w-full rounded-xl border border-border bg-muted/30 px-6 text-center text-sm text-muted-foreground flex items-center justify-center">
        Xarita ma'lumotini yuklab bo'lmadi.
      </div>
    );
  }

  return (
    <div className="relative space-y-3">
      {Object.keys(overview.errors).length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Ayrim GEOASR manbalari vaqtincha javob bermadi. Xarita mavjud ma'lumotlar bilan chizildi.</span>
        </div>
      )}

      <div style={{ height: 480 }} className="rounded-xl overflow-hidden border border-border">
        <MapContainer center={[41.35, 63.2]} zoom={6} className="h-full w-full" scrollWheelZoom minZoom={5} maxZoom={16}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />

          <ZoomTracker onZoom={setZoom} />

          {regionGeoJson && zoom < 8 && (
            <GeoJSON key={`regions-${regionKey}`} data={regionGeoJson} style={regionStyle} onEachFeature={onEachRegion} />
          )}

          {regionGeoJson && zoom >= 8 && zoom < 12 && (
            <GeoJSON
              key={`regions-bg-${regionKey}`}
              data={regionGeoJson}
              style={(feature?: Feature<Geometry, { shapeName?: string }>) => {
                const shapeName = feature?.properties?.shapeName ?? "";
                const regionName = SHAPE_TO_API_REGION[shapeName] ?? shapeName;
                const style = getPriorityStyle(regionStats.get(regionName)?.issueObjects ?? 0, scale);
                return { fillColor: style.fill, fillOpacity: 0.28, color: "#fff", weight: 1, opacity: 0.6 };
              }}
            />
          )}

          {zoom >= 8 && zoom < 12 && <DistrictLayer objects={localObjects} />}
          {zoom >= 12 && <ObjectLayer objects={localObjects} />}

          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.9} />
        </MapContainer>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-border bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-1.5">
          {[
            { color: "#ef4444", label: `Jiddiy - ${scale.severe}+ muammoli ob'ekt` },
            { color: "#f59e0b", label: `Diqqat - ${scale.attention}-${Math.max(scale.severe - 1, scale.attention)} ta` },
            { color: "#22c55e", label: "Yaxshi - past yuklama" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div style={{ width: 14, height: 14, borderRadius: 3, background: color, opacity: 0.85 }} />
              <span className="text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
          <div className="mt-1 border-t border-border/60 pt-1.5 text-[10px] text-muted-foreground">
            <p className="font-semibold text-primary">
              {zoom < 8 ? "Viloyat ko'rinishi" : zoom < 12 ? "Tuman ko'rinishi" : "Ob'ekt ko'rinishi"}
            </p>
            <p>
              {zoom < 8
                ? "Viloyat ustiga bosib yoki zoom qilib chuqurroq ko'ring."
                : zoom < 12
                ? "Tuman doiralaridan ob'ekt darajasiga o'tish uchun yaqinlashtiring."
                : "Ob'ekt popupida batafsil sahifaga o'tish mumkin."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
