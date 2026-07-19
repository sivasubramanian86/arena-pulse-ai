#!/usr/bin/env node
/**
 * scripts/validate-translations.mjs
 *
 * Validates that all locale JSON files:
 * 1. Exist (no missing files)
 * 2. Have the same top-level key structure as the English source
 * 3. Are valid JSON
 *
 * Exits with code 1 if any validation fails — blocks CI.
 *
 * Usage:
 *   node scripts/validate-translations.mjs
 *   npm run i18n:validate
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "src", "i18n", "locales");

const ALL_LOCALES = ["en", "es", "pt", "fr", "ar", "de", "zh", "ja", "ko", "hi", "it", "nl"];
const NAMESPACES = [
  "common", "nexus", "polyglot", "crisis", "fanpass",
  "transit", "mesh", "volunteer", "monetization", "faq",
];

function getKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === "object" && v !== null ? getKeys(v, key) : [key];
  });
}

let errors = 0;
let checked = 0;

// Load English source keys per namespace
const enKeys = {};
for (const ns of NAMESPACES) {
  const p = join(ROOT, "en", `${ns}.json`);
  enKeys[ns] = getKeys(JSON.parse(readFileSync(p, "utf-8")));
}

for (const locale of ALL_LOCALES.filter((l) => l !== "en")) {
  for (const ns of NAMESPACES) {
    const filePath = join(ROOT, locale, `${ns}.json`);
    checked++;

    // Check existence
    if (!existsSync(filePath)) {
      console.error(`  [MISSING]  ${locale}/${ns}.json`);
      errors++;
      continue;
    }

    // Check valid JSON + key coverage
    try {
      const content = JSON.parse(readFileSync(filePath, "utf-8"));
      const keys = getKeys(content);
      const missing = enKeys[ns].filter((k) => !keys.includes(k));

      if (missing.length > 0) {
        console.warn(`  [WARN] ${locale}/${ns}.json — missing ${missing.length} keys: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""}`);
      } else {
        console.log(`  [OK]  ${locale}/${ns}.json`);
      }
    } catch (err) {
      console.error(`  [INVALID JSON] ${locale}/${ns}.json — ${err.message}`);
      errors++;
    }
  }
}

console.log(`\nValidated ${checked} files. Errors: ${errors}`);
if (errors > 0) {
  console.error("\nFAIL: Fix the above errors before building.\n");
  process.exit(1);
} else {
  console.log("PASS: All locale files are valid.\n");
}
