import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 8787);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  response.end(JSON.stringify(payload));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function heuristic(input, source = "backend-heuristic") {
  const description = String(input.description || "").trim();
  const normalized = description.toLowerCase();
  const flags = [];
  let score = 55;

  if (description.length < 20) {
    score -= 35;
    flags.push("Tavsif juda qisqa");
  } else if (description.length >= 80) {
    score += 15;
  } else if (description.length >= 40) {
    score += 8;
  }

  if (/^(test|salom|hello|ok|yoq|yo'q|problem|muammo)$/i.test(description) || /(asdf|qwerty|test123|lorem|random|1111|aaaa)/i.test(description)) {
    score -= 35;
    flags.push("Spam yoki testga o'xshash matn");
  }

  if (!/[0-9]/.test(description) && !/(kun|oy|hafta|sinf|qavat|xona|bekat|yo'l|quvur|zal|bog'cha|maktab|poliklinika)/i.test(normalized)) {
    score -= 12;
    flags.push("Aniq detal yetarli emas");
  } else {
    score += 10;
  }

  if (Number(input.photosCount || 0) > 0) {
    score += 10;
  }

  if ((input.issueType === "road_condition" && input.objectType !== "road") || (input.issueType === "medical_quality" && input.objectType !== "clinic")) {
    score -= 15;
    flags.push("Muammo turi va ob'ekt turi to'liq mos emas");
  }

  if (/(tez|darhol|shoshilinch|xavf|bolalar|qulab|portlab|sizib)/i.test(normalized)) {
    score += 6;
  }

  const confidence = clamp(score, 8, 96);
  const validity = confidence >= 72 ? "likely_valid" : confidence >= 40 ? "needs_review" : "likely_invalid";

  return {
    validity,
    confidence,
    flags,
    source,
    summary:
      validity === "likely_valid"
        ? "Tavsif aniq va demo uchun ishonchli murojaatga o'xshaydi."
        : validity === "needs_review"
        ? "Murojaat foydali ko'rinadi, lekin ayrim tafsilotlar qo'lda ko'rib chiqilishi kerak."
        : "Murojaat test, spam yoki juda noaniq yozuvga o'xshaydi.",
  };
}

function extractJsonBlock(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function validateWithGemini(input) {
  if (!GEMINI_API_KEY) {
    return heuristic(input, "backend-heuristic");
  }

  const prompt = `You are validating a civic issue report for a demo app in Uzbekistan. Analyze whether the report sounds plausible, specific, and relevant to the selected facility. Return ONLY JSON with keys validity, confidence, summary, flags.\n\nAllowed validity values: likely_valid, needs_review, likely_invalid.\nConfidence must be 0-100 integer.\nFlags must be short Uzbek phrases.\n\nInput:\n${JSON.stringify(input, null, 2)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini error ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
    const parsed = extractJsonBlock(text);
    if (!parsed) {
      throw new Error("Gemini JSON parse failed");
    }

    const validity = ["likely_valid", "needs_review", "likely_invalid"].includes(parsed.validity)
      ? parsed.validity
      : "needs_review";

    return {
      validity,
      confidence: clamp(Number(parsed.confidence) || 50, 0, 100),
      summary: String(parsed.summary || "AI xulosasi tayyorlandi."),
      flags: Array.isArray(parsed.flags) ? parsed.flags.map((flag) => String(flag)) : [],
      source: "backend-ai",
    };
  } catch (error) {
    console.error("Gemini validation fallback:", error.message);
    return heuristic(input, "backend-heuristic");
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true, gemini: Boolean(GEMINI_API_KEY), model: GEMINI_MODEL });
    return;
  }

  if (request.method === "POST" && request.url === "/api/report-validation") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 64 * 1024) {
        request.destroy();
      }
    });

    request.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const result = await validateWithGemini(payload);
        sendJson(response, 200, result);
      } catch (error) {
        sendJson(response, 400, {
          validity: "needs_review",
          confidence: 0,
          summary: "Validatsiya so'rovi noto'g'ri formatda yuborildi.",
          flags: [String(error.message || error)],
          source: "backend-heuristic",
        });
      }
    });
    return;
  }

  sendJson(response, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Report validation server listening on http://127.0.0.1:${PORT}`);
  console.log(`Gemini configured: ${Boolean(GEMINI_API_KEY)}`);
});
