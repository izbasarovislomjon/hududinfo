import type { ObjectType } from "@/lib/types";

export type GeoasrDatasetType = "maktab" | "bogcha" | "ssv";
export type GeoasrIssueKind =
  | "electricity"
  | "water"
  | "internet"
  | "sports_hall"
  | "cafeteria"
  | "repair"
  | "indoor_water";

type Scalar = string | number | null | undefined;

interface GeoasrBaseRecord {
  _uid_?: number;
  id?: number | string;
  code?: number | string;
  parent_code?: number | string | null;
  viloyat?: string | null;
  tuman?: string | null;
  obekt_nomi?: string | null;
  inn?: string | number | null;
  material_sten?: string | null;
  elektr_kun_davomida?: string | null;
  ichimlik_suvi_manbaa?: string | null;
  qurilish_yili?: string | number | null;
  kapital_tamir?: string | null;
  updated?: string | null;
  mahalla_id?: number | null;
}

export interface GeoasrSchoolRecord extends GeoasrBaseRecord {
  smena?: string | number | null;
  sport_zal_holati?: string | null;
  aktiv_zal_holati?: string | null;
  oshhona_holati?: string | null;
  internetga_ulanish_turi?: string | null;
  sigimi?: string | number | null;
  umumiy_uquvchi?: string | number | null;
  obekt_nomi_ru?: string | null;
  obekt_nomi_en?: string | null;
}

export interface GeoasrKindergartenRecord extends GeoasrBaseRecord {
  aktiv_zal_holati?: string | null;
  oshhona_holati?: string | null;
  internetga_ulanish_turi?: string | null;
  sigimi?: string | number | null;
  umumiy_uquvchi?: string | number | null;
}

export interface GeoasrHealthRecord extends GeoasrBaseRecord {
  internet?: string | null;
  bino_ichida_suv?: string | null;
}

type GeoasrRowMap = {
  maktab: GeoasrSchoolRecord;
  bogcha: GeoasrKindergartenRecord;
  ssv: GeoasrHealthRecord;
};

export type GeoasrRow<T extends GeoasrDatasetType = GeoasrDatasetType> =
  GeoasrRowMap[T];

export const GEOASR_DATASET_LABELS: Record<GeoasrDatasetType, string> = {
  maktab: "Maktablar",
  bogcha: "Bog'chalar",
  ssv: "SSV muassasalari",
};

export const GEOASR_DATASET_UI_TYPES: Record<GeoasrDatasetType, ObjectType> = {
  maktab: "school",
  bogcha: "kindergarten",
  ssv: "clinic",
};

export const GEOASR_ISSUE_LABELS: Record<GeoasrIssueKind, string> = {
  electricity: "Elektr ta'minoti",
  water: "Ichimlik suvi",
  internet: "Internet",
  sports_hall: "Sport zal",
  cafeteria: "Oshxona",
  repair: "Kapital ta'mir",
  indoor_water: "Bino ichidagi suv",
};

export const SHAPE_TO_API_REGION: Record<string, string> = {
  "Andijan Region": "Andijon viloyati",
  "Namangan Region": "Namangan viloyati",
  "Fergana Region": "Farg'ona viloyati",
  "Republic of Karakalpakstan": "Qoraqolpog'iston Respublikasi",
  "Xorazm Region": "Xorazm viloyati",
  "Navoiy Region": "Navoiy viloyati",
  "Surxondaryo Region": "Surxondaryo viloyati",
  "Samarqand Region": "Samarqand viloyati",
  "Tashkent Region": "Toshkent viloyati",
  "Sirdaryo Region": "Sirdaryo viloyati",
  "Jizzakh Region": "Jizzax viloyati",
  "Bukhara Region": "Buxoro viloyati",
  "Qashqadaryo Region": "Qashqadaryo viloyati",
  Tashkent: "Toshkent shahar",
};

export const GEOASR_REGIONS = Array.from(
  new Set(Object.values(SHAPE_TO_API_REGION)),
);

const GEOASR_ENDPOINTS: Record<GeoasrDatasetType, string> = {
  maktab: "maktab44",
  bogcha: "bogcha",
  ssv: "ssv",
};

const GEOASR_PAGE_SIZE = 500;

const DIRECT_API_BASE = "https://duasr.uz/api4";
const GEOASR_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoid2ViX3VzZXIiLCJleHAiOjE3Nzk4Mzk0ODV9.WCy4ooIDvL0o8G5udEuba4POyJMMH2CnjM2FcgybG10";

const REGION_ALIASES: Record<string, string> = {
  andijon: "Andijon viloyati",
  "andijan region": "Andijon viloyati",
  buxoro: "Buxoro viloyati",
  "bukhara region": "Buxoro viloyati",
  fargona: "Farg'ona viloyati",
  "fargona viloyati": "Farg'ona viloyati",
  "fergana region": "Farg'ona viloyati",
  jizzax: "Jizzax viloyati",
  "jizzakh region": "Jizzax viloyati",
  namangan: "Namangan viloyati",
  navoiy: "Navoiy viloyati",
  qashqadaryo: "Qashqadaryo viloyati",
  qr: "Qoraqolpog'iston Respublikasi",
  qoraqalpogiston: "Qoraqolpog'iston Respublikasi",
  qoraqolpogiston: "Qoraqolpog'iston Respublikasi",
  "qoraqalpogiston respublikasi": "Qoraqolpog'iston Respublikasi",
  "qoraqolpogiston respublikasi": "Qoraqolpog'iston Respublikasi",
  "republic of karakalpakstan": "Qoraqolpog'iston Respublikasi",
  samarqand: "Samarqand viloyati",
  sirdaryo: "Sirdaryo viloyati",
  surhondaryo: "Surxondaryo viloyati",
  surxondaryo: "Surxondaryo viloyati",
  toshkent: "Toshkent viloyati",
  "toshkent viloyati": "Toshkent viloyati",
  "toshkent sh": "Toshkent shahar",
  "toshkent shahar": "Toshkent shahar",
  tashkent: "Toshkent shahar",
  "tashkent region": "Toshkent viloyati",
  xorazm: "Xorazm viloyati",
  "xorazm region": "Xorazm viloyati",
};

const VALUE_LABELS: Record<string, string> = {
  beton: "Beton",
  elektr_bor: "Bor",
  elektr_qisman: "Qisman ishlaydi",
  gisht: "G'isht",
  ha_joriy: "Joriy ta'mir qilingan",
  ichimlik_suvi_manbaa_lokal: "Mahalliy manba",
  ichimlik_suvi_manbaa_olib_kelinadi: "Tashib kelinadi",
  ichimlik_suvi_yuq: "Yo'q",
  internet_mobil: "Mobil internet",
  internet_optika: "Optik internet",
  kran_orqali: "Kran orqali",
  oshhona_bor_ishlamaydi: "Bor, ishlamaydi",
  oshhona_umuman_yuq: "Yo'q",
  quvur_yuq_suv_yuq: "Yo'q",
  shisha_tola: "Optik tolali",
  sport_zal_umuman_yuq: "Yo'q",
  umuman_yuq: "Yo'q",
  vodoprovod_suvi: "Vodoprovod",
  yuq: "Yo'q",
  yuq_remont: "Ta'mirtalab",
};

let cachedCollections: GeoasrCollections | null = null;
let inflightCollectionsPromise: Promise<GeoasrCollections> | null = null;

export interface GeoasrUnifiedObject {
  id: string;
  sourceType: GeoasrDatasetType;
  uiType: ObjectType;
  name: string;
  region: string;
  district: string;
  address: string;
  issueCount: number;
  issues: GeoasrIssueKind[];
  builtYear?: number;
  capacity?: number;
  peopleCount?: number;
  shiftCount?: number;
  wallMaterial?: string | null;
  electricity?: string | null;
  waterSource?: string | null;
  internet?: string | null;
  sportsHall?: string | null;
  assemblyHall?: string | null;
  cafeteria?: string | null;
  repairStatus?: string | null;
  indoorWater?: string | null;
  raw: GeoasrRow;
}

export interface GeoasrCollections {
  datasets: {
    maktab: GeoasrSchoolRecord[];
    bogcha: GeoasrKindergartenRecord[];
    ssv: GeoasrHealthRecord[];
  };
  allObjects: GeoasrUnifiedObject[];
  errors: Partial<Record<GeoasrDatasetType, string>>;
}

export interface GeoasrDatasetSummary {
  type: GeoasrDatasetType;
  label: string;
  uiType: ObjectType;
  total: number;
  issueObjects: number;
  healthyObjects: number;
  issueRate: number;
}

export interface GeoasrRegionSummary {
  region: string;
  totalObjects: number;
  issueObjects: number;
  issueOccurrences: number;
  issueRate: number;
  datasets: Record<GeoasrDatasetType, { total: number; issues: number }>;
  issueTypes: Record<GeoasrIssueKind, number>;
}

export interface GeoasrOverview {
  totalObjects: number;
  issueObjects: number;
  healthyObjects: number;
  issueOccurrences: number;
  affectedRegions: number;
  datasetSummary: GeoasrDatasetSummary[];
  regionBreakdown: GeoasrRegionSummary[];
  issueTypeBreakdown: Array<{
    type: GeoasrIssueKind;
    label: string;
    value: number;
  }>;
  topIssueObjects: GeoasrUnifiedObject[];
  errors: Partial<Record<GeoasrDatasetType, string>>;
}

function getBaseCandidates(): string[] {
  const env = import.meta.env as ImportMetaEnv & {
    VITE_GEOASR_API_BASE?: string;
  };
  const customBase = env.VITE_GEOASR_API_BASE?.trim();

  if (customBase) {
    return [customBase.replace(/\/$/, "")];
  }

  return ["/api/geoasr", DIRECT_API_BASE];
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeScalar(value: Scalar): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function toNumber(value: Scalar): number | undefined {
  const text = normalizeScalar(value);
  if (!text) {
    return undefined;
  }

  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function slugifyRegion(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’`']/g, "")
    .replace(/[\s_-]+/g, " ")
    .trim();
}

function buildParams(
  _type: GeoasrDatasetType,
  params?: string | URLSearchParams,
): URLSearchParams {
  const searchParams =
    typeof params === "string"
      ? new URLSearchParams(params.replace(/^\?/, ""))
      : new URLSearchParams(params);

  return searchParams;
}

function parseJsonPayload(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    throw new Error(
      `Unexpected response payload: ${trimmed.slice(0, 120) || "empty response"}`,
    );
  }

  return JSON.parse(trimmed);
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function parseContentRangeTotal(contentRange: string | null): number | null {
  if (!contentRange) {
    return null;
  }

  const match = contentRange.match(/\/(\d+|\*)$/);
  if (!match || match[1] === "*") {
    return null;
  }

  return Number(match[1]);
}

async function requestWithFallback<T>(
  endpoint: string,
  params: URLSearchParams,
): Promise<{ rows: T[]; total: number | null }> {
  const query = params.toString();
  let lastError: Error | null = null;

  for (const base of getBaseCandidates()) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(`${base}/${endpoint}${query ? `?${query}` : ""}`, {
          headers: {
            Authorization: `Bearer ${GEOASR_TOKEN}`,
            Prefer: "count=exact",
          },
        });

        const text = await response.text();
        if (!response.ok) {
          throw new Error(
            `GEOASR ${endpoint} so'rovi muvaffaqiyatsiz (${response.status}): ${text
              .replace(/\s+/g, " ")
              .slice(0, 160)}`,
          );
        }

        const payload = parseJsonPayload(text);
        if (!Array.isArray(payload)) {
          throw new Error(`GEOASR ${endpoint} masssiv emas`);
        }

        return {
          rows: payload as T[],
          total: parseContentRangeTotal(response.headers.get("content-range")),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < 2) {
          await wait(400 * (attempt + 1));
        }
      }
    }
  }

  throw lastError ?? new Error(`GEOASR ${endpoint} so'rovi bajarilmadi`);
}

function getInternetField(
  type: GeoasrDatasetType,
  object: GeoasrRow,
): string | null {
  if (type === "ssv") {
    return normalizeScalar((object as GeoasrHealthRecord).internet);
  }

  return normalizeScalar(
    (object as GeoasrSchoolRecord | GeoasrKindergartenRecord)
      .internetga_ulanish_turi,
  );
}

function getObjectIdentity(type: GeoasrDatasetType, object: GeoasrRow): string {
  const value = object.id ?? object.code ?? object._uid_ ?? object.obekt_nomi;
  return `geoasr:${type}:${String(value)}`;
}

function createIssueCounter(): Record<GeoasrIssueKind, number> {
  return {
    electricity: 0,
    water: 0,
    internet: 0,
    sports_hall: 0,
    cafeteria: 0,
    repair: 0,
    indoor_water: 0,
  };
}

function createRegionSummary(region: string): GeoasrRegionSummary {
  return {
    region,
    totalObjects: 0,
    issueObjects: 0,
    issueOccurrences: 0,
    issueRate: 0,
    datasets: {
      maktab: { total: 0, issues: 0 },
      bogcha: { total: 0, issues: 0 },
      ssv: { total: 0, issues: 0 },
    },
    issueTypes: createIssueCounter(),
  };
}

export function normalizeRegionName(value: string | null | undefined): string {
  const region = normalizeScalar(value);
  if (!region) {
    return "Noma'lum";
  }

  if (SHAPE_TO_API_REGION[region]) {
    return SHAPE_TO_API_REGION[region];
  }

  const alias = REGION_ALIASES[slugifyRegion(region)];
  return alias ?? region;
}

export function formatGeoasrValue(value: Scalar): string {
  const text = normalizeScalar(value);
  if (!text) {
    return "Noma'lum";
  }

  return (
    VALUE_LABELS[text] ??
    text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function getGeoasrIssuesForObject<T extends GeoasrDatasetType>(
  type: T,
  object: GeoasrRow<T>,
): GeoasrIssueKind[] {
  const issues: GeoasrIssueKind[] = [];
  const electricity = normalizeScalar(object.elektr_kun_davomida);
  const water = normalizeScalar(object.ichimlik_suvi_manbaa);
  const internet = getInternetField(type, object);
  const repair = normalizeScalar(object.kapital_tamir);

  if (electricity === null || electricity === "elektr_qisman") {
    issues.push("electricity");
  }

  if (water === null || water === "ichimlik_suvi_yuq" || water === "yuq") {
    issues.push("water");
  }

  if (internet === null || internet === "umuman_yuq") {
    issues.push("internet");
  }

  if (
    type === "maktab" &&
    normalizeScalar((object as GeoasrSchoolRecord).sport_zal_holati) ===
      "sport_zal_umuman_yuq"
  ) {
    issues.push("sports_hall");
  }

  const cafeteria = normalizeScalar(
    (object as GeoasrSchoolRecord | GeoasrKindergartenRecord).oshhona_holati,
  );
  if (
    cafeteria === "oshhona_umuman_yuq" ||
    cafeteria === "oshhona_bor_ishlamaydi"
  ) {
    issues.push("cafeteria");
  }

  if (repair === "yuq_remont") {
    issues.push("repair");
  }

  if (
    type === "ssv" &&
    normalizeScalar((object as GeoasrHealthRecord).bino_ichida_suv) ===
      "quvur_yuq_suv_yuq"
  ) {
    issues.push("indoor_water");
  }

  return issues;
}

export function hasInfrastructureIssue<T extends GeoasrDatasetType>(
  type: T,
  object: GeoasrRow<T>,
) {
  return getGeoasrIssuesForObject(type, object).length > 0;
}

export function toGeoasrUnifiedObject<T extends GeoasrDatasetType>(
  type: T,
  object: GeoasrRow<T>,
): GeoasrUnifiedObject {
  const region = normalizeRegionName(object.viloyat);
  const district = normalizeScalar(object.tuman) ?? "Noma'lum tuman";
  const issues = getGeoasrIssuesForObject(type, object);

  return {
    id: getObjectIdentity(type, object),
    sourceType: type,
    uiType: GEOASR_DATASET_UI_TYPES[type],
    name: normalizeScalar(object.obekt_nomi) ?? "Noma'lum ob'ekt",
    region,
    district,
    address: `${district}, ${region}`,
    issueCount: issues.length,
    issues,
    builtYear: toNumber(object.qurilish_yili),
    capacity:
      type === "ssv"
        ? undefined
        : toNumber(
            (object as GeoasrSchoolRecord | GeoasrKindergartenRecord).sigimi,
          ),
    peopleCount:
      type === "ssv"
        ? undefined
        : toNumber(
            (object as GeoasrSchoolRecord | GeoasrKindergartenRecord)
              .umumiy_uquvchi,
          ),
    shiftCount:
      type === "maktab"
        ? toNumber((object as GeoasrSchoolRecord).smena)
        : undefined,
    wallMaterial: normalizeScalar(object.material_sten),
    electricity: normalizeScalar(object.elektr_kun_davomida),
    waterSource: normalizeScalar(object.ichimlik_suvi_manbaa),
    internet: getInternetField(type, object),
    sportsHall:
      type === "maktab"
        ? normalizeScalar((object as GeoasrSchoolRecord).sport_zal_holati)
        : null,
    assemblyHall:
      type === "ssv"
        ? null
        : normalizeScalar(
            (object as GeoasrSchoolRecord | GeoasrKindergartenRecord)
              .aktiv_zal_holati,
          ),
    cafeteria:
      type === "ssv"
        ? null
        : normalizeScalar(
            (object as GeoasrSchoolRecord | GeoasrKindergartenRecord)
              .oshhona_holati,
          ),
    repairStatus: normalizeScalar(object.kapital_tamir),
    indoorWater:
      type === "ssv"
        ? normalizeScalar((object as GeoasrHealthRecord).bino_ichida_suv)
        : null,
    raw: object,
  };
}

export async function fetchObjects<T extends GeoasrDatasetType>(
  type: T,
  params?: string | URLSearchParams,
): Promise<GeoasrRow<T>[]> {
  const searchParams = buildParams(type, params);

  if (searchParams.has("limit")) {
    const result = await requestWithFallback<GeoasrRow<T>>(
      GEOASR_ENDPOINTS[type],
      searchParams,
    );
    return result.rows;
  }

  const firstPageParams = new URLSearchParams(searchParams);
  firstPageParams.set("limit", String(GEOASR_PAGE_SIZE));
  firstPageParams.set("offset", "0");

  const firstPage = await requestWithFallback<GeoasrRow<T>>(
    GEOASR_ENDPOINTS[type],
    firstPageParams,
  );

  const total = firstPage.total ?? firstPage.rows.length;
  if (total <= firstPage.rows.length) {
    return firstPage.rows;
  }

  const remainingRequests: Array<Promise<{ rows: GeoasrRow<T>[]; total: number | null }>> = [];
  for (let offset = firstPage.rows.length; offset < total; offset += GEOASR_PAGE_SIZE) {
    const pageParams = new URLSearchParams(searchParams);
    pageParams.set("limit", String(GEOASR_PAGE_SIZE));
    pageParams.set("offset", String(offset));
    remainingRequests.push(
      requestWithFallback<GeoasrRow<T>>(GEOASR_ENDPOINTS[type], pageParams),
    );
  }

  const remainingPages = await Promise.all(remainingRequests);
  return [
    ...firstPage.rows,
    ...remainingPages.flatMap((page) => page.rows),
  ].slice(0, total);
}

async function loadAllObjects(): Promise<GeoasrCollections> {
  const result = await Promise.allSettled([
    fetchObjects("maktab"),
    fetchObjects("bogcha"),
    fetchObjects("ssv"),
  ]);

  const datasets: GeoasrCollections["datasets"] = {
    maktab: result[0].status === "fulfilled" ? result[0].value : [],
    bogcha: result[1].status === "fulfilled" ? result[1].value : [],
    ssv: result[2].status === "fulfilled" ? result[2].value : [],
  };

  const errors: Partial<Record<GeoasrDatasetType, string>> = {};
  if (result[0].status === "rejected") {
    errors.maktab = describeError(result[0].reason);
  }
  if (result[1].status === "rejected") {
    errors.bogcha = describeError(result[1].reason);
  }
  if (result[2].status === "rejected") {
    errors.ssv = describeError(result[2].reason);
  }

  const allObjects = [
    ...datasets.maktab.map((item) => toGeoasrUnifiedObject("maktab", item)),
    ...datasets.bogcha.map((item) => toGeoasrUnifiedObject("bogcha", item)),
    ...datasets.ssv.map((item) => toGeoasrUnifiedObject("ssv", item)),
  ];

  return {
    datasets,
    allObjects,
    errors,
  };
}

export async function fetchAllObjects(options?: {
  force?: boolean;
}): Promise<GeoasrCollections> {
  const force = options?.force ?? false;

  if (!force && cachedCollections) {
    return cachedCollections;
  }

  if (!force && inflightCollectionsPromise) {
    return inflightCollectionsPromise;
  }

  inflightCollectionsPromise = loadAllObjects();
  const collections = await inflightCollectionsPromise.finally(() => {
    inflightCollectionsPromise = null;
  });

  if (Object.keys(collections.errors).length === 0) {
    cachedCollections = collections;
  }

  return collections;
}

export function buildGeoasrOverview(
  collections: GeoasrCollections,
): GeoasrOverview {
  const issueTypeCounts = createIssueCounter();
  const regionMap = new Map<string, GeoasrRegionSummary>(
    GEOASR_REGIONS.map((region) => [region, createRegionSummary(region)]),
  );

  let issueObjects = 0;
  let issueOccurrences = 0;

  for (const object of collections.allObjects) {
    const regionKey = object.region;
    if (!regionMap.has(regionKey)) {
      regionMap.set(regionKey, createRegionSummary(regionKey));
    }

    const region = regionMap.get(regionKey)!;
    region.totalObjects += 1;
    region.datasets[object.sourceType].total += 1;

    if (object.issueCount > 0) {
      issueObjects += 1;
      issueOccurrences += object.issueCount;
      region.issueObjects += 1;
      region.issueOccurrences += object.issueCount;
      region.datasets[object.sourceType].issues += 1;

      for (const issue of object.issues) {
        issueTypeCounts[issue] += 1;
        region.issueTypes[issue] += 1;
      }
    }
  }

  const totalObjects = collections.allObjects.length;
  const healthyObjects = Math.max(totalObjects - issueObjects, 0);

  const datasetSummary: GeoasrDatasetSummary[] = (
    Object.keys(GEOASR_DATASET_LABELS) as GeoasrDatasetType[]
  ).map((type) => {
    const total = collections.allObjects.filter(
      (object) => object.sourceType === type,
    ).length;
    const issueCount = collections.allObjects.filter(
      (object) => object.sourceType === type && object.issueCount > 0,
    ).length;

    return {
      type,
      label: GEOASR_DATASET_LABELS[type],
      uiType: GEOASR_DATASET_UI_TYPES[type],
      total,
      issueObjects: issueCount,
      healthyObjects: Math.max(total - issueCount, 0),
      issueRate: total > 0 ? Math.round((issueCount / total) * 100) : 0,
    };
  });

  const regionBreakdown = Array.from(regionMap.values())
    .map((region) => ({
      ...region,
      issueRate:
        region.totalObjects > 0
          ? Math.round((region.issueObjects / region.totalObjects) * 100)
          : 0,
    }))
    .sort((left, right) => {
      if (right.issueObjects !== left.issueObjects) {
        return right.issueObjects - left.issueObjects;
      }
      return right.totalObjects - left.totalObjects;
    });

  const issueTypeBreakdown = (
    Object.keys(GEOASR_ISSUE_LABELS) as GeoasrIssueKind[]
  )
    .map((type) => ({
      type,
      label: GEOASR_ISSUE_LABELS[type],
      value: issueTypeCounts[type],
    }))
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value);

  const topIssueObjects = collections.allObjects
    .filter((object) => object.issueCount > 0)
    .sort((left, right) => {
      if (right.issueCount !== left.issueCount) {
        return right.issueCount - left.issueCount;
      }
      return left.name.localeCompare(right.name);
    });

  return {
    totalObjects,
    issueObjects,
    healthyObjects,
    issueOccurrences,
    affectedRegions: regionBreakdown.filter((region) => region.issueObjects > 0)
      .length,
    datasetSummary,
    regionBreakdown,
    issueTypeBreakdown,
    topIssueObjects,
    errors: collections.errors,
  };
}

export async function fetchGeoasrOverview(options?: {
  force?: boolean;
}): Promise<GeoasrOverview> {
  const collections = await fetchAllObjects(options);
  return buildGeoasrOverview(collections);
}

export async function getGeoasrObjectById(objectId: string) {
  const collections = await fetchAllObjects();
  return collections.allObjects.find((object) => object.id === objectId) ?? null;
}
