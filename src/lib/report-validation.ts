import type { IssueType, ObjectType } from "@/lib/types";

export type ReportValidity = "likely_valid" | "needs_review" | "likely_invalid";

export interface ReportValidationInput {
  objectName: string;
  objectType: ObjectType;
  issueType: IssueType;
  description: string;
  address?: string;
  district?: string;
  region?: string;
  photosCount?: number;
}

export interface ReportValidationResult {
  validity: ReportValidity;
  confidence: number;
  summary: string;
  flags: string[];
  source: "backend-ai" | "backend-heuristic" | "client-fallback";
}

export const reportValidityLabels: Record<ReportValidity, string> = {
  likely_valid: "Ishonchli",
  needs_review: "Ko'rib chiqilsin",
  likely_invalid: "Shubhali",
};

const SHORT_TEXT_RE = /^(test|salom|hello|ok|yoq|yo'q|problem|muammo)$/i;
const SPAM_RE = /(asdf|qwerty|test123|lorem|random|1111|aaaa)/i;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function runHeuristicValidation(input: ReportValidationInput): ReportValidationResult {
  const description = input.description.trim();
  const normalized = description.toLowerCase();
  const flags: string[] = [];
  let score = 55;

  if (description.length < 20) {
    score -= 35;
    flags.push("Tavsif juda qisqa");
  } else if (description.length >= 80) {
    score += 15;
  } else if (description.length >= 40) {
    score += 8;
  }

  if (SHORT_TEXT_RE.test(description) || SPAM_RE.test(description)) {
    score -= 35;
    flags.push("Spam yoki testga o'xshash matn");
  }

  if (!/[0-9]/.test(description) && !/(kun|oy|hafta|sinf|qavat|xona|bekat|yo'l|quvur|zal|bog'cha|maktab|poliklinika)/i.test(description)) {
    score -= 12;
    flags.push("Aniq detal yetarli emas");
  } else {
    score += 10;
  }

  if (input.photosCount && input.photosCount > 0) {
    score += 10;
  }

  if (
    (input.issueType === "road_condition" && input.objectType !== "road") ||
    (input.issueType === "medical_quality" && input.objectType !== "clinic")
  ) {
    score -= 15;
    flags.push("Muammo turi va ob'ekt turi to'liq mos emas");
  }

  if (/(tez|darhol|shoshilinch|xavf|bolalar|qulab|portlab|sizib)/i.test(normalized)) {
    score += 6;
  }

  const confidence = clamp(score, 8, 96);
  const validity: ReportValidity =
    confidence >= 72 ? "likely_valid" : confidence >= 40 ? "needs_review" : "likely_invalid";

  return {
    validity,
    confidence,
    flags,
    source: "client-fallback",
    summary:
      validity === "likely_valid"
        ? "Tavsif aniq va demo uchun ishonchli murojaatga o'xshaydi."
        : validity === "needs_review"
        ? "Murojaat foydali ko'rinadi, lekin ayrim tafsilotlar qo'lda ko'rib chiqilishi kerak."
        : "Murojaat test, spam yoki juda noaniq yozuvga o'xshaydi.",
  };
}

export async function validateSubmittedReport(
  input: ReportValidationInput,
): Promise<ReportValidationResult> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const response = await fetch("/api/report-validation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    window.clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Validation failed: ${response.status}`);
    }

    const result = (await response.json()) as ReportValidationResult;
    return result;
  } catch {
    return runHeuristicValidation(input);
  }
}
