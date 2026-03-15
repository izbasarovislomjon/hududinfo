import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { listLocalObjects, submitFeedbackLocal } from "@/lib/local-backend";
import {
  reportValidityLabels,
  type ReportValidationResult,
} from "@/lib/report-validation";
import {
  ArrowLeft,
  GraduationCap,
  Baby,
  Stethoscope,
  Droplets,
  Construction,
  Search,
  MapPin,
  ChevronRight,
  Camera,
  X,
  CheckCircle2,
  Loader2,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import type { ObjectType, IssueType } from "@/lib/types";
import { issueTypeLabels } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Institution {
  id: string;
  name: string;
  type: ObjectType;
  address: string;
  district: string;
  lat: number;
  lng: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ObjectType,
  {
    label: string;
    desc: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }
> = {
  school: {
    label: "Maktab",
    desc: "Umumta'lim maktablari",
    icon: GraduationCap,
    color: "#1A56DB",
    bg: "#EFF4FF",
  },
  kindergarten: {
    label: "Bog'cha",
    desc: "Maktabgacha ta'lim",
    icon: Baby,
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  clinic: {
    label: "Poliklinika",
    desc: "Tibbiy muassasalar",
    icon: Stethoscope,
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  water: {
    label: "Suv ta'minoti",
    desc: "Suv va kanalizatsiya",
    icon: Droplets,
    color: "#0891B2",
    bg: "#ECFEFF",
  },
  road: {
    label: "Yo'llar",
    desc: "Yo'l va ko'priklar",
    icon: Construction,
    color: "#D97706",
    bg: "#FFFBEB",
  },
};

const ISSUE_TYPES: { value: IssueType; label: string }[] = [
  { value: "infrastructure", label: "Infratuzilma muammosi" },
  { value: "water_supply", label: "Suv ta'minoti" },
  { value: "road_condition", label: "Yo'l holati" },
  { value: "heating", label: "Isitish tizimi" },
  { value: "medical_quality", label: "Tibbiy xizmat sifati" },
  { value: "staff_shortage", label: "Xodimlar yetishmasligi" },
  { value: "other", label: "Boshqa muammo" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 px-4 py-2 max-w-2xl mx-auto w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{
            background:
              i < step
                ? "hsl(221 83% 47%)"
                : i === step
                  ? "hsl(221 83% 47% / 0.35)"
                  : "hsl(214 20% 88%)",
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SubmitReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, activateGuestDemo } = useAuth();

  // Wizard state
  const [step, setStep] = useState(0); // 0=category, 1=institution, 2=form, 3=success
  const [selectedType, setSelectedType] = useState<ObjectType | null>(
    (searchParams.get("type") as ObjectType) ?? null,
  );
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);

  // Institution search
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingInst, setLoadingInst] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "nearby">("search");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);

  // Form state
  const [issueType, setIssueType] = useState<IssueType | "">("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedValidation, setSubmittedValidation] =
    useState<ReportValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If type was pre-selected via URL, skip to step 1
  useEffect(() => {
    if (selectedType && step === 0) {
      setStep(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch institutions when type is selected
  useEffect(() => {
    if (selectedType) {
      fetchInstitutions(selectedType);
    }
  }, [selectedType]);

  const fetchInstitutions = async (type: ObjectType) => {
    setLoadingInst(true);
    const data = await listLocalObjects();
    setInstitutions(
      data.filter((item) => item.type === type).map((d) => ({
        ...d,
        lat: Number(d.lat),
        lng: Number(d.lng),
      })),
    );
    setLoadingInst(false);
  };

  const requestLocation = () => {
    setLocating(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Qurilmangiz geolokatsiyani qo'llab-quvvatlamaydi");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError("Joylashuvni aniqlashda xatolik. Qo'lda qidiring.");
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (photos.length + files.length > 3) return;
    const newFiles = [...photos, ...files];
    setPhotos(newFiles);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (idx: number) => {
    const newFiles = photos.filter((_, i) => i !== idx);
    const newPreviews = photoPreviews.filter((_, i) => i !== idx);
    setPhotos(newFiles);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!user) {
      await activateGuestDemo();
      return;
    }
    if (!selectedInstitution || !issueType || description.trim().length < 10) {
      setSubmitError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }
    if (issueType === "road_condition" && photos.length === 0) {
      setSubmitError("Yo'l holati murojaatlari uchun kamida 1 ta foto majburiy.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    setSubmittedValidation(null);

    try {
      const result = await submitFeedbackLocal({
        userId: user.id,
        objectId: selectedInstitution.id,
        issueType,
        description: description.trim(),
        isAnonymous,
        authorName: isAnonymous ? null : user.full_name || user.email,
        authorPhone: isAnonymous ? null : user.phone,
        photosCount: photos.length,
      });
      setSubmittedValidation(result.validation);
    } catch (error) {
      setSubmitError("Xatolik yuz berdi. Qayta urinib ko'ring.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setStep(3);
  };

  // ── Filtered/sorted institution list ────────────────────────────────────────

  const filteredInstitutions = institutions
    .filter((inst) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        inst.name.toLowerCase().includes(q) ||
        inst.address.toLowerCase().includes(q) ||
        inst.district.toLowerCase().includes(q)
      );
    })
    .map((inst) => ({
      ...inst,
      distance: userLocation
        ? getDistanceMeters(
            userLocation.lat,
            userLocation.lng,
            inst.lat,
            inst.lng,
          )
        : null,
    }))
    .sort((a, b) => {
      if (
        activeTab === "nearby" &&
        a.distance !== null &&
        b.distance !== null
      ) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    });

  const nearbyInstitutions = filteredInstitutions.filter(
    (inst) => inst.distance !== null && inst.distance <= 5000,
  );

  const displayList =
    activeTab === "nearby" ? nearbyInstitutions : filteredInstitutions;

  const typeConfig = selectedType ? TYPE_CONFIG[selectedType] : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div
        className="sticky top-0 z-40 bg-white border-b border-border"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center h-14 px-4 gap-3 max-w-2xl mx-auto w-full">
          <button
            onClick={() => {
              if (step === 0) navigate(-1);
              else setStep((s) => s - 1);
            }}
            className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "hsl(220 14% 92%)" }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-none text-foreground">
              {step === 0 && "Muassasa turini tanlang"}
              {step === 1 &&
                (typeConfig
                  ? `${typeConfig.label} tanlang`
                  : "Muassasa tanlang")}
              {step === 2 && "Muammo haqida"}
              {step === 3 && "Yuborildi!"}
            </p>
            {step < 3 && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {step + 1}-qadam / 3
              </p>
            )}
          </div>
        </div>
        {step < 3 && <StepBar step={step} total={3} />}
      </div>

      {/* ── STEP 0: Category selection ─────────────────────────────────────── */}
      {step === 0 && (
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
            Muammoingiz qaysi muassasa bilan bog'liq? Mos turni tanlang.
          </p>
          <div className="flex flex-col gap-3">
            {(
              Object.entries(TYPE_CONFIG) as [
                ObjectType,
                (typeof TYPE_CONFIG)[ObjectType],
              ][]
            ).map(([type, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setStep(1);
                  }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border active:scale-[0.98] transition-all duration-150 hover:shadow-sm text-left"
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg }}
                  >
                    <Icon style={{ width: 24, height: 24, color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">
                      {cfg.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cfg.desc}
                    </p>
                  </div>
                  <ChevronRight
                    style={{
                      width: 18,
                      height: 18,
                      color: "hsl(215 14% 52%)",
                      flexShrink: 0,
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 1: Institution selection ─────────────────────────────────── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          {/* Search bar */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  width: 16,
                  height: 16,
                  color: "hsl(215 14% 52%)",
                }}
              />
              <input
                type="text"
                placeholder="Muassasa nomini qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X
                    style={{ width: 15, height: 15, color: "hsl(215 14% 52%)" }}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pb-2">
            {(["search", "nearby"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "nearby" && !userLocation && !locating) {
                    requestLocation();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                style={{
                  background:
                    activeTab === tab ? "hsl(221 83% 47%)" : "hsl(220 14% 92%)",
                  color: activeTab === tab ? "white" : "hsl(215 14% 40%)",
                }}
              >
                {tab === "search" ? (
                  <>
                    <Search style={{ width: 12, height: 12 }} />
                    Qidirish
                  </>
                ) : (
                  <>
                    <Navigation style={{ width: 12, height: 12 }} />
                    Yaqin atrofda
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Location status */}
          {activeTab === "nearby" && (
            <div className="px-4 pb-2">
              {locating && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2
                    style={{ width: 13, height: 13 }}
                    className="animate-spin"
                  />
                  Joylashuv aniqlanmoqda…
                </div>
              )}
              {locationError && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertTriangle style={{ width: 13, height: 13 }} />
                  {locationError}
                </div>
              )}
              {userLocation && !locating && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <MapPin style={{ width: 13, height: 13 }} />
                  Joylashuv aniqlandi · {nearbyInstitutions.length} ta yaqin
                  muassasa
                </div>
              )}
            </div>
          )}

          {/* Institution list */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {loadingInst ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
                <Loader2
                  className="animate-spin"
                  style={{ width: 18, height: 18 }}
                />
                Yuklanmoqda…
              </div>
            ) : displayList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                {activeTab === "nearby"
                  ? userLocation
                    ? "5 km atrofda muassasa topilmadi"
                    : "Yaqin muassasalarni ko'rish uchun joylashuvga ruxsat bering"
                  : "Muassasa topilmadi"}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {displayList.map((inst) => {
                  const cfg = typeConfig!;
                  const Icon = cfg.icon;
                  const isWarning =
                    inst.distance !== null && inst.distance > 2000;
                  return (
                    <button
                      key={inst.id}
                      onClick={() => {
                        setSelectedInstitution(inst);
                        setStep(2);
                      }}
                      className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-border active:scale-[0.98] transition-all duration-150 hover:shadow-sm text-left w-full"
                    >
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg }}
                      >
                        <Icon
                          style={{ width: 18, height: 18, color: cfg.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-snug line-clamp-1">
                          {inst.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {inst.district} · {inst.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {inst.distance !== null && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{
                              background: isWarning
                                ? "hsl(36 90% 48% / 0.1)"
                                : "hsl(152 60% 38% / 0.1)",
                              color: isWarning
                                ? "hsl(36 90% 38%)"
                                : "hsl(152 60% 30%)",
                            }}
                          >
                            {formatDistance(inst.distance)}
                          </span>
                        )}
                        <ChevronRight
                          style={{
                            width: 15,
                            height: 15,
                            color: "hsl(215 14% 60%)",
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Problem form ───────────────────────────────────────────── */}
      {step === 2 && selectedInstitution && (
        <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
          {/* Selected institution summary */}
          <div
            className="mx-4 mt-3 mb-4 flex items-center gap-3 p-3 rounded-xl border"
            style={{
              background: typeConfig?.bg,
              borderColor: typeConfig?.color + "33",
            }}
          >
            {typeConfig && (
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "white" }}
              >
                <typeConfig.icon
                  style={{
                    width: 18,
                    height: 18,
                    color: typeConfig.color,
                  }}
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p
                className="text-xs font-bold line-clamp-1"
                style={{ color: typeConfig?.color }}
              >
                {selectedInstitution.name}
              </p>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {selectedInstitution.address}
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-[11px] font-semibold shrink-0"
              style={{ color: typeConfig?.color }}
            >
              O'zgartirish
            </button>
          </div>

          <div className="px-4 pb-8 flex flex-col gap-5">
            {/* Issue type */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Muammo turi <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map((it) => (
                  <button
                    key={it.value}
                    onClick={() => setIssueType(it.value)}
                    className="px-3 py-2.5 rounded-xl text-xs font-semibold text-left border transition-all duration-150 active:scale-95"
                    style={{
                      background:
                        issueType === it.value ? "hsl(221 83% 47%)" : "white",
                      color:
                        issueType === it.value ? "white" : "hsl(215 25% 22%)",
                      borderColor:
                        issueType === it.value
                          ? "hsl(221 83% 47%)"
                          : "hsl(214 20% 88%)",
                    }}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Muammo tavsifi <span className="text-destructive">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Muammoni batafsil yozing. Masalan: Maktab hovlisida qulab tushgan panjara ta'mirlanmagan, bolalar uchun xavfli."
                rows={4}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none leading-relaxed"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {description.length} / 500 belgi (kamida 10)
              </p>
            </div>

            {/* Photos */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">
                Fotosuratlar{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  {issueType === "road_condition"
                    ? "(yo'l holati uchun majburiy, maksimal 3 ta)"
                    : "(ixtiyoriy, maksimal 3 ta)"}
                </span>
              </label>
              <p className="text-[11px] text-muted-foreground mb-2.5">
                Muammoni tasvirlovchi surat qo'shish hisobotingizni ishonchli
                qiladi
              </p>

              <div className="flex gap-2 flex-wrap">
                {photoPreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 rounded-xl overflow-hidden border border-border"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <X style={{ width: 11, height: 11, color: "white" }} />
                    </button>
                  </div>
                ))}

                {photos.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Camera
                      style={{
                        width: 20,
                        height: 20,
                        color: "hsl(215 14% 52%)",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Qo'shish
                    </span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoAdd}
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Anonim yuborish
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ismingiz boshqalarga ko'rsatilmaydi
                </p>
              </div>
              <button
                onClick={() => setIsAnonymous((v) => !v)}
                className="relative h-6 w-11 rounded-full transition-colors duration-200 flex items-center"
                style={{
                  background: isAnonymous
                    ? "hsl(221 83% 47%)"
                    : "hsl(214 20% 82%)",
                }}
              >
                <span
                  className="absolute h-5 w-5 rounded-full bg-white shadow transition-all duration-200"
                  style={{ left: isAnonymous ? "calc(100% - 22px)" : "2px" }}
                />
              </button>
            </div>

            {/* Error */}
            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium">
                <AlertTriangle
                  style={{ width: 15, height: 15, flexShrink: 0 }}
                />
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !issueType ||
                description.trim().length < 10 ||
                (issueType === "road_condition" && photos.length === 0)
              }
              className="w-full h-12 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "hsl(221 83% 47%)" }}
            >
              {submitting ? (
                <Loader2
                  className="animate-spin"
                  style={{ width: 18, height: 18 }}
                />
              ) : (
                "Yuborish"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Success ───────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-2xl mx-auto w-full">
          {/* Success icon */}
          <div
            className="h-24 w-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: "hsl(152 60% 38% / 0.12)" }}
          >
            <CheckCircle2
              style={{ width: 48, height: 48, color: "hsl(152 60% 38%)" }}
            />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">
            Murojaat yuborildi!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-3">
            Murojaatingiz qabul qilindi. Mas'ul tashkilot ko'rib chiqadi va
            natija haqida xabardor etilasiz.
          </p>

          {/* Points earned */}
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-2xl mb-8"
            style={{ background: "hsl(36 90% 48% / 0.10)" }}
          >
            <span className="text-2xl">🏆</span>
            <div className="text-left">
                <p className="text-sm font-bold" style={{ color: "hsl(36 90% 38%)" }}>
                  +2 ball qo'shildi!
                </p>
              <p className="text-[11px] text-muted-foreground">
                Faol fuqaro sifatida baholandingiz
              </p>
            </div>
          </div>

          {submittedValidation && (
            <div
              className="w-full rounded-2xl border px-4 py-3 mb-6 text-left"
              style={{
                background:
                  submittedValidation.validity === "likely_valid"
                    ? "hsl(152 65% 46% / 0.08)"
                    : submittedValidation.validity === "needs_review"
                    ? "hsl(39 96% 56% / 0.08)"
                    : "hsl(4 82% 62% / 0.08)",
                borderColor:
                  submittedValidation.validity === "likely_valid"
                    ? "hsl(152 65% 46% / 0.25)"
                    : submittedValidation.validity === "needs_review"
                    ? "hsl(39 96% 56% / 0.25)"
                    : "hsl(4 82% 62% / 0.25)",
              }}
            >
              <p className="text-xs font-bold text-foreground mb-1">AI tekshiruv natijasi</p>
              <p className="text-xs text-foreground leading-relaxed mb-1.5">
                {submittedValidation.summary}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Holat: {reportValidityLabels[submittedValidation.validity]} · Ishonchlilik: {submittedValidation.confidence}% · Manba: {submittedValidation.source}
              </p>
            </div>
          )}

          {/* What happens next */}
          <div className="w-full bg-white rounded-2xl border border-border p-4 mb-6 text-left">
            <p className="text-xs font-bold text-foreground mb-3">
              Keyin nima bo'ladi?
            </p>
            {[
              { emoji: "📋", text: "Murojaat ko'rib chiqishga qabul qilindi" },
              { emoji: "🔍", text: "Mas'ul tashkilot tekshiradi" },
              { emoji: "✅", text: "Hal etilgach sizga bildiriladi" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <span className="text-lg">{item.emoji}</span>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 w-full">
            <button
              onClick={() => {
                setStep(0);
                setSelectedType(null);
                setSelectedInstitution(null);
                setIssueType("");
                 setDescription("");
                 setPhotos([]);
                 setPhotoPreviews([]);
                 setSubmittedValidation(null);
                 setSearchQuery("");
               }}
              className="w-full h-12 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-transform"
              style={{ background: "hsl(221 83% 47%)" }}
            >
              Yangi murojaat yuborish
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full h-12 rounded-2xl font-semibold text-sm border border-border text-foreground active:scale-[0.98] transition-transform"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
