"use client";

/**
 * @file PolyglotKiosk.tsx
 * @description Real-time language translation simulator for MetLife smart kiosks supporting multi-lingual operations.
 */

import React, { useState, useCallback } from "react";
import { Languages, Mic, Volume2, ArrowRightLeft, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export const PolyglotKiosk: React.FC = React.memo(() => {
  const t = useTranslations("polyglot");
  const [leftLang, setLeftLang] = useState("English");
  const [rightLang, setRightLang] = useState("Spanish");
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const swapLanguages = useCallback(() => {
    setLeftLang(rightLang);
    setRightLang(leftLang);
    setLeftText(rightText);
    setRightText(leftText);
  }, [leftLang, rightLang, leftText, rightText]);

  const handleTranslate = useCallback(() => {
    if (!leftText) return;
    setIsTranslating(true);
    // Simulated real-time translation loop
    setTimeout(() => {
      let translation = "";
      if (rightLang === "Spanish") translation = "Hola, bienvenido al estadio MetLife. ¿Cómo puedo ayudarte hoy?";
      else if (rightLang === "Arabic") translation = "مرحباً بك في ملعب ميتلايف. كيف يمكنني مساعدتك اليوم؟";
      else if (rightLang === "Japanese") translation = "メットライフ・スタジアムへようこそ。どのようなご用件でしょうか？";
      else translation = `[Translation to ${rightLang}]: ${leftText}`;
      
      setRightText(translation);
      setIsTranslating(false);
    }, 800);
  }, [leftText, rightLang]);

  return (
    <div className="flex flex-col gap-6 w-full" role="region" aria-label={t("aria.region")}>
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur border border-zinc-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Languages className="text-blue-500 w-5 h-5" aria-hidden="true" />
            {t("title")}
          </h2>
          <p className="text-xs text-zinc-400">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={swapLanguages}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg p-2 transition-colors active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
          aria-label={t("aria.swap")}>
          <ArrowRightLeft className="w-4 h-4" />
          {t("buttons.swap")}
        </button>
      </div>

      {/* Container query target wrapper */}
      <div className="kiosk-grid-container w-full" style={{ containerType: "inline-size" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Speaker A (Left Panel) */}
          <div className="flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl relative shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t("speakerA")}</span>
              <select
                value={leftLang}
                onChange={(e) => setLeftLang(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                aria-label={t("aria.selectLangA")}>
                <option value="English">{t("languages.en")}</option>
                <option value="Spanish">{t("languages.es")}</option>
                <option value="French">{t("languages.fr")}</option>
                <option value="Arabic">{t("languages.ar")}</option>
                <option value="Japanese">{t("languages.ja")}</option>
              </select>
            </div>

            <textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder={t("inputPlaceholder")}
              className="w-full bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 min-h-[160px] resize-none"
              aria-label={`${t("aria.selectLangA")} — ${leftLang}`}
            />

            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl p-3 transition-colors active:scale-95"
                aria-label={t("aria.mic")}>
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleTranslate}
                disabled={!leftText || isTranslating}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors active:scale-95"
                aria-label={t("aria.translate")}>
                <Sparkles className="w-3.5 h-3.5" />
                {isTranslating ? t("buttons.translating") : t("buttons.translate")}
              </button>
            </div>
          </div>

          {/* Speaker B (Right Panel) */}
          <div className="flex flex-col gap-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl relative shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t("speakerB")}</span>
              <select
                value={rightLang}
                onChange={(e) => setRightLang(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                aria-label={t("aria.selectLangB")}>
                <option value="Spanish">{t("languages.es")}</option>
                <option value="English">{t("languages.en")}</option>
                <option value="French">{t("languages.fr")}</option>
                <option value="Arabic">{t("languages.ar")}</option>
                <option value="Japanese">{t("languages.ja")}</option>
              </select>
            </div>

            <div className="w-full bg-zinc-950/30 border border-zinc-800/60 rounded-xl p-4 text-sm text-zinc-200 min-h-[160px] flex flex-col justify-between">
              <p className={rightText ? "text-white" : "text-zinc-600 italic"}>
                {rightText || t("outputPlaceholder")}
              </p>
              {isTranslating && (
                <div className="flex items-center gap-1 mt-2 text-xs text-blue-400" aria-live="polite">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  {t("status.translating")}
                </div>
              )}
            </div>

            <div className="flex justify-start items-center mt-2">
              <button
                type="button"
                disabled={!rightText}
                className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-xl p-3 transition-colors active:scale-95"
                aria-label={t("aria.tts")}>
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PolyglotKiosk.displayName = "PolyglotKiosk";
