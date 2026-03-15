export interface RatingTier {
  min: number;
  label: string;
  emoji: string;
  color: string;
}

export const RATING_TIERS: RatingTier[] = [
  { min: 140, label: "Hudud yetakchisi", emoji: "👑", color: "#7c3aed" },
  { min: 90, label: "Ishonchli fuqaro", emoji: "🔥", color: "#dc2626" },
  { min: 45, label: "Faol ishtirokchi", emoji: "⭐", color: "#1d4ed8" },
  { min: 15, label: "Kuzatuvchi", emoji: "👀", color: "#0891b2" },
  { min: 0, label: "Yangi fuqaro", emoji: "🌱", color: "#6b7280" },
  { min: -20, label: "Bahsli profil", emoji: "⚠️", color: "#d97706" },
  { min: Number.NEGATIVE_INFINITY, label: "Ishonchsiz profil", emoji: "🚫", color: "#b91c1c" },
];

export function getRatingTitle(score: number) {
  return RATING_TIERS.find((tier) => score >= tier.min) ?? RATING_TIERS[RATING_TIERS.length - 1];
}

export function formatRatingLabel(score: number) {
  const tier = getRatingTitle(score);
  return `${tier.emoji} ${tier.label}`;
}
