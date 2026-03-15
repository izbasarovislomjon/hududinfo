# HududInfo Implementation Plan

## Status: Completed In This Workspace
- Task 1 done: `src/components/map/PriorityMap.tsx` now uses real `shapeName` mapping and live GEOASR issue counts.
- Task 2 done: `src/lib/geoasr-api.ts` now fetches, normalizes, retries, and aggregates GEOASR data.
- Task 4a/4b/4c/4e done: `src/pages/Statistics.tsx`, `src/pages/Index.tsx`, and `src/pages/ObjectDetail.tsx` now use real GEOASR-backed summaries and detail views.
- Task 4d remains optional: `src/pages/Feedbacks.tsx` still shows platform citizen reports.
- Task 5 is blocked locally: `cloudflared tunnel list` currently fails because this machine has no Cloudflare origin cert configured for named tunnels.

## Status: What's Already Done
- Real GeoJSON for Uzbekistan regions downloaded to `public/uzbekistan-regions.geojson` (14 proper region polygons from geoBoundaries)
- Dev server running on port 5173
- cloudflared found at: `C:\Users\Based\scoop\shims\cloudflared`

---

## Task 1: Fix Map with Real GeoJSON Shapes

**Problem**: Map shows crude rectangles instead of actual Uzbekistan region boundaries.

**Solution**: The real GeoJSON is already downloaded to `public/uzbekistan-regions.geojson`. It has 14 features with `shapeName` property. You need to update `PriorityMap.tsx` to map `shapeName` to API viloyat names.

**GeoJSON shapeName → API viloyat mapping**:
```
"Andijan Region"                → "Andijon viloyati"
"Namangan Region"               → "Namangan viloyati"
"Fergana Region"                → "Farg'ona viloyati"
"Republic of Karakalpakstan"    → "Qoraqolpog'iston Respublikasi"
"Xorazm Region"                → "Xorazm viloyati"
"Navoiy Region"                 → "Navoiy viloyati"
"Surxondaryo Region"            → "Surxondaryo viloyati"
"Samarqand Region"              → "Samarqand viloyati"
"Tashkent Region"               → "Toshkent viloyati"
"Sirdaryo Region"               → "Sirdaryo viloyati"
"Jizzakh Region"                → "Jizzakh viloyati" (note: API spells it "Jizzax")
"Bukhara Region"                → "Buxoro viloyati"
"Qashqadaryo Region"            → "Qashqadaryo viloyati"
"Tashkent"                      → "Toshkent shahar"
```

**Code change in `PriorityMap.tsx`**:
- Change `regionStyleFn` to use `feature.properties.shapeName` instead of `feature.properties.key`
- Add a `SHAPE_TO_API` mapping object using the table above
- Priority color should come from real API issue counts, not `MOCK_OPEN`

---

## Task 2: Connect to Real GEOASR API

### API Endpoints
All use the same Bearer token:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoid2ViX3VzZXIiLCJleHAiOjE3Nzk4Mzk0ODV9.WCy4ooIDvL0o8G5udEuba4POyJMMH2CnjM2FcgybG10
```

| Endpoint | Type | Count |
|----------|------|-------|
| `https://duasr.uz/api4/maktab44` | Schools (Maktablar) | 800 |
| `https://duasr.uz/api4/bogcha` | Kindergartens (Bog'chalar) | 400 |
| `https://duasr.uz/api4/ssv` | Health facilities (SSV) | 400 |

### API Query Syntax (PostgREST style)
- Filter: `?viloyat=eq.Toshkent viloyati`
- Multiple filters: `?viloyat=eq.Toshkent viloyati&tuman=eq.Chilonzor`
- Range: `?sigimi=gt.500`
- Null check: `?material_sten=is.null`
- Select cols: `?select=viloyat,tuman,obekt_nomi`
- Limit: `?limit=100`
- Count header: `-H "Prefer: count=exact"`

### Schema per endpoint

**maktab44 (schools)**:
```json
{
  "_uid_": 681,
  "viloyat": "Qashqadaryo viloyati",
  "tuman": "Qamashi tumani",
  "obekt_nomi": "30-sonli umumiy o'rta ta'lim maktab filiali",
  "inn": "203569573",
  "smena": "1",              // shifts
  "material_sten": "gisht",  // wall material: gisht, beton, etc.
  "sport_zal_holati": "sport_zal_umuman_yuq",  // no sports hall
  "aktiv_zal_holati": "aktiv_zal_umuman_yuq",  // no assembly hall
  "oshhona_holati": "oshhona_umuman_yuq",       // no cafeteria
  "elektr_kun_davomida": "elektr_bor",  // electricity status
  "ichimlik_suvi_manbaa": "ichimlik_suvi_manbaa_olib_kelinadi", // water source
  "internetga_ulanish_turi": "internet_mobil",  // internet type
  "sigimi": "60",            // capacity
  "umumiy_uquvchi": "55",    // total students
  "qurilish_yili": "2015",   // construction year
  "parent_code": 1710,
  "code": 1710220,
  "kapital_tamir": "",       // capital repair status
  "id": 12018,
  "obekt_nomi_ru": "30-филиал школы",
  "obekt_nomi_en": "30-secondary school branch"
}
```

**bogcha (kindergartens)**: Same fields minus `smena`, `sport_zal_holati`, `obekt_nomi_ru/en`

**ssv (health facilities)**:
```json
{
  "viloyat": "...",
  "tuman": "...",
  "obekt_nomi": "...",
  "inn": "...",
  "internet": "shisha_tola",  // NOTE: different field name than maktab
  "material_sten": "gisht",
  "elektr_kun_davomida": "elektr_bor",
  "ichimlik_suvi_manbaa": "vodoprovod_suvi",
  "bino_ichida_suv": "kran_orqali",  // unique to ssv
  "qurilish_yili": "2005",
  "kapital_tamir": "ha_joriy"  // repair status
}
```

### "Issue" Detection Logic
An object has an issue (muammo) if any of these are true:
- `elektr_kun_davomida` = `"elektr_qisman"` or null (partial/no electricity)
- `ichimlik_suvi_manbaa` = `"ichimlik_suvi_yuq"` or `"yuq"` or null (no water)
- `internetga_ulanish_turi` = `"umuman_yuq"` or null (no internet)
- `sport_zal_holati` = `"sport_zal_umuman_yuq"` (no sports hall) — schools only
- `oshhona_holati` = `"oshhona_umuman_yuq"` or `"oshhona_bor_ishlamaydi"` (cafeteria missing/broken)
- `kapital_tamir` = `"yuq_remont"` (needs repair)
- `bino_ichida_suv` = `"quvur_yuq_suv_yuq"` (no indoor water) — ssv only

### Region distribution from maktab44:
```
 59 | Andijon viloyati
 20 | Buxoro viloyati
 47 | Farg'ona viloyati
 93 | Jizzax viloyati
 28 | Namangan viloyati
 16 | Navoiy viloyati
104 | Qashqadaryo viloyati
111 | Qoraqolpog'iston Respublikasi
133 | Samarqand viloyati
 35 | Sirdaryo viloyati
105 | Surxondaryo viloyati
  6 | Toshkent shahar
 37 | Toshkent viloyati
  6 | Xorazm viloyati
```

---

## Task 3: Create API Service Module

Create `src/lib/geoasr-api.ts`:

```typescript
const API_BASE = "https://duasr.uz/api4";
const AUTH_HEADER = {
  Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoid2ViX3VzZXIiLCJleHAiOjE3Nzk4Mzk0ODV9.WCy4ooIDvL0o8G5udEuba4POyJMMH2CnjM2FcgybG10",
};

export type ObjectType = "maktab" | "bogcha" | "ssv";

export async function fetchObjects(type: ObjectType, params?: string) {
  const endpoint = type === "maktab" ? "maktab44" : type;
  const url = `${API_BASE}/${endpoint}${params ? "?" + params : ""}`;
  const res = await fetch(url, { headers: AUTH_HEADER });
  return res.json();
}

// Fetch all 3 types in parallel
export async function fetchAllObjects() {
  const [schools, kindergartens, health] = await Promise.all([
    fetchObjects("maktab"),
    fetchObjects("bogcha"),
    fetchObjects("ssv"),
  ]);
  return { schools, kindergartens, health };
}
```

---

## Task 4: Pages to Update with Real Data

### 4a. Statistics page (`src/pages/Statistics.tsx`)
- Replace hardcoded chart data with real aggregations from the 3 APIs
- Show real counts per viloyat, per issue type
- Region breakdown from actual API data

### 4b. PriorityMap (`src/components/map/PriorityMap.tsx`)
- Remove `MOCK_OPEN` constant
- Fetch all 3 APIs, count issues per viloyat using the issue detection logic
- Map `shapeName` from GeoJSON → API viloyat name
- Color each region based on real issue counts

### 4c. Index/Home page (`src/pages/Index.tsx`)
- Replace hardcoded hero stats (e.g., "10,000+ objects") with real counts
- Show recent API data in any overview sections

### 4d. Feedbacks page (`src/pages/Feedbacks.tsx`)
- If currently showing Supabase mock data, could show the actual infrastructure issues from the API

### 4e. ObjectDetail page (`src/pages/ObjectDetail.tsx`)
- Show real object data from the API instead of Supabase mock

---

## Task 5: Cloudflared Tunnel Setup

cloudflared is at: `C:\Users\Based\scoop\shims\cloudflared`

**To expose dev server at hududinfo.yall.uz:**

```bash
cloudflared tunnel --hostname hududinfo.yall.uz --url http://localhost:5173
```

NOTE: This requires that yall.uz DNS is already configured with a Cloudflare tunnel. If the tunnel is already named/configured, the command might be:
```bash
cloudflared tunnel run --url http://localhost:5173 hududinfo
```

Or if using quick tunnel (temporary public URL):
```bash
cloudflared tunnel --url http://localhost:5173
```

Check existing tunnel config:
```bash
cloudflared tunnel list
cloudflared tunnel info hududinfo
```

---

## Task 6: Fix Tashkent Color Issue

**Problem**: Tashkent shahri shows red but real data shows only 6 schools there — should probably be green/orange.

**Root cause**: `MOCK_OPEN["Toshkent shahri"] = 7` was hardcoded. Once connected to real API, the color will be based on actual issue counts from the 6 Tashkent shahar objects.

---

## Priority Order
1. **Map fix** — Already have real GeoJSON, just need to update shapeName mapping in PriorityMap.tsx
2. **API service module** — Create geoasr-api.ts
3. **PriorityMap real data** — Replace MOCK_OPEN with real API issue counts
4. **Statistics real data** — Show real aggregations
5. **Cloudflared** — Run the tunnel command
6. **Other pages** — Update remaining pages as needed

---

## Files to Modify
```
src/lib/geoasr-api.ts                  (NEW - API service)
src/components/map/PriorityMap.tsx      (update shapeName mapping + real API data)
src/pages/Statistics.tsx                (real stats from API)
src/pages/Index.tsx                     (real hero numbers)
src/pages/Feedbacks.tsx                 (possibly integrate API data)
src/pages/ObjectDetail.tsx              (show real object from API)
public/uzbekistan-regions.geojson       (DONE - real geoBoundaries data)
```
