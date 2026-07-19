#!/usr/bin/env node
/**
 * scripts/generate-translations.mjs
 *
 * Build-time script that reads all English locale JSON files and generates
 * translated equivalents for the 11 other FIFA fan languages using the
 * Google Gen AI JS SDK (Vertex AI mode via ADC).
 *
 * Usage:
 *   node scripts/generate-translations.mjs
 *
 * Requires:
 *   - GOOGLE_CLOUD_PROJECT in .env
 *   - Active gcloud ADC: `gcloud auth application-default login`
 */

import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Load .env from project root (two levels up from frontend/)
config({ path: join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".env") });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "src", "i18n", "locales");

const TARGET_LOCALES = ["es", "pt", "fr", "ar", "de", "zh", "ja", "ko", "hi", "it", "nl"];
const NAMESPACES = [
  "common", "nexus", "polyglot", "crisis", "fanpass",
  "transit", "mesh", "volunteer", "monetization", "faq",
];

const LANGUAGE_NAMES = {
  es: "Spanish", pt: "Brazilian Portuguese", fr: "French", ar: "Arabic",
  de: "German", zh: "Simplified Chinese", ja: "Japanese", ko: "Korean",
  hi: "Hindi", it: "Italian", nl: "Dutch",
};

async function translateJSON(ai, sourceObj, targetLang) {
  const prompt = `You are a professional translator for a FIFA World Cup 2026 stadium management app.
Translate ALL string values in the following JSON object from English to ${targetLang}.
Rules:
- Do NOT translate JSON keys (only string values).
- Do NOT translate proper nouns: "ArenaPulseAI", "FIFA", "NOC", "MetLife", "AR", "CO₂", "Gemini", "AI", "ETA".
- Keep placeholder syntax like {count} or {name} exactly as-is.
- For Arabic, use Modern Standard Arabic (MSA).
- Return ONLY valid JSON with no markdown fences and no extra explanation.

JSON to translate:
${JSON.stringify(sourceObj, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text.trim();
  const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned);
}

async function main() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  if (!project) {
    console.error("ERROR: GOOGLE_CLOUD_PROJECT not set.");
    process.exit(1);
  }

  // Use Vertex AI mode (ADC-based, no API key required)
  const ai = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  console.log(`Project: ${project} | Location: ${location}`);
  console.log(`Starting translation for ${TARGET_LOCALES.length} locales × ${NAMESPACES.length} namespaces...\n`);

  for (const locale of TARGET_LOCALES) {
    const localeDir = join(ROOT, locale);
    if (!existsSync(localeDir)) mkdirSync(localeDir, { recursive: true });

    for (const ns of NAMESPACES) {
      const outPath = join(localeDir, `${ns}.json`);
      if (existsSync(outPath)) {
        console.log(`  [SKIP] ${locale}/${ns}.json already exists`);
        continue;
      }

      const sourcePath = join(ROOT, "en", `${ns}.json`);
      const sourceObj = JSON.parse(readFileSync(sourcePath, "utf-8"));

      try {
        console.log(`  Translating ${locale}/${ns}.json → ${LANGUAGE_NAMES[locale]}...`);
        const translated = await translateJSON(ai, sourceObj, LANGUAGE_NAMES[locale]);
        writeFileSync(outPath, JSON.stringify(translated, null, 2) + "\n", "utf-8");
        console.log(`  [OK] ${locale}/${ns}.json`);
        await new Promise((r) => setTimeout(r, 300));
      } catch (err) {
        console.error(`  [ERROR] ${locale}/${ns}.json — ${err.message}`);
        // English fallback so build never breaks
        writeFileSync(outPath, JSON.stringify(sourceObj, null, 2) + "\n", "utf-8");
        console.log(`  [FALLBACK] Wrote English copy for ${locale}/${ns}.json`);
      }
    }
  }

  console.log("\nTranslation complete.");
}

main().catch(console.error);
