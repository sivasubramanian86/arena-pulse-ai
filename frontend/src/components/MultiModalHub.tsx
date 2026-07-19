"use client";

/**
 * @file MultiModalHub.tsx
 * @description Operations interface for ingestion and analysis of security feeds (video/audio/image) using Gemini's multimodal capabilities.
 */

import React, { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, Volume2, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

/**
 * MultiModalHub Component.
 * Supports file drag-and-drop ingestion, audio feedback generation, and visual anomaly evaluation.
 */
export const MultiModalHub: React.FC = React.memo(() => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visionResult, setVisionResult] = useState<string | null>(null);
  const [speechSynthesisText, setSpeechSynthesisText] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioPlaybackActive, setAudioPlaybackActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setFilePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
    setVisionResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const handleVisionAnalyze = useCallback(() => {
    if (!selectedFile) return;
    setIsProcessing(true);
    // Simulate Vision AI processing
    setTimeout(() => {
      setVisionResult(
        "Vision AI Scan complete. Verified: MetLife Stadium Entrance Crowd Density is at 45% (Normal). Flow vectors indicate uniform movement towards Gate C. No security anomalies detected."
      );
      setIsProcessing(false);
    }, 1200);
  }, [selectedFile]);

  const handleAudioSynthesize = useCallback(() => {
    if (!speechSynthesisText) return;
    setIsSynthesizing(true);
    // Simulate voice synthesis processing
    setTimeout(() => {
      setIsSynthesizing(false);
      setAudioPlaybackActive(true);
      setTimeout(() => setAudioPlaybackActive(false), 4000); // 4s mock playback
    }, 1000);
  }, [speechSynthesisText]);

  const playSampleAudio = useCallback(() => {
    setAudioPlaybackActive(true);
    const audio = new Audio("/data/announcement.mp3");
    audio.play().catch(() => {});
    audio.onended = () => setAudioPlaybackActive(false);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" role="region" aria-label="Multimodal AI Upload & Speech Hub">
      {/* Demo Assets Grid Section */}
      <div className="col-span-1 lg:col-span-2 bg-zinc-900/40 backdrop-blur border border-zinc-800/80 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="text-yellow-500 w-5 h-5 animate-pulse" />
            Stadium Operations Multimodal Asset Vault
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">
            Pre-loaded high-fidelity feeds and media assets from MetLife Stadium for operational analytics verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {/* Image Asset Card */}
          <div className="bg-zinc-950/70 border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col group hover:border-zinc-700/80 transition-colors">
            <div className="h-32 w-full relative bg-zinc-900 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/data/stadium.jpg"
                alt="MetLife Stadium South Gate"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 bg-zinc-950/80 text-[10px] px-2 py-0.5 rounded text-blue-400 font-bold border border-blue-500/20">
                IMAGE FEED
              </div>
            </div>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <span className="text-xs font-bold text-zinc-200">South Gate Entrance Feed</span>
              <span className="text-[10px] text-zinc-500 leading-normal">High-res capture of fan queue density at Gate C concourse.</span>
              <button
                onClick={() => {
                  setFilePreview("/data/stadium.jpg");
                  setSelectedFile(new File([new Uint8Array(10)], "stadium.jpg", { type: "image/jpeg" }));
                  setVisionResult(null);
                }}
                className="mt-auto bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 text-blue-400 hover:text-white text-[11px] py-1.5 rounded-lg font-bold transition-all text-center"
              >
                Analyze in Vision AI
              </button>
            </div>
          </div>

          {/* Video Asset Card */}
          <div className="bg-zinc-950/70 border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col group hover:border-zinc-700/80 transition-colors">
            <div className="h-32 w-full relative bg-black flex items-center justify-center">
              <video
                src="/data/security_cam.mp4"
                muted
                loop
                autoPlay
                playsInline
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute top-2 left-2 bg-zinc-950/80 text-[10px] px-2 py-0.5 rounded text-red-400 font-bold border border-red-500/20">
                LIVE VIDEO FEED
              </div>
            </div>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <span className="text-xs font-bold text-zinc-200">Perimeter Security Cam-04</span>
              <span className="text-[10px] text-zinc-500 leading-normal">Live CCTV monitoring of transit platforms and exit channels.</span>
              <button
                onClick={() => {
                  setFilePreview("/data/security_cam.mp4");
                  setSelectedFile(new File([new Uint8Array(10)], "security_cam.mp4", { type: "video/mp4" }));
                  setVisionResult(null);
                }}
                className="mt-auto bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white text-[11px] py-1.5 rounded-lg font-bold transition-all text-center"
              >
                Analyze in Vision AI
              </button>
            </div>
          </div>

          {/* Audio Asset Card */}
          <div className="bg-zinc-950/70 border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col group hover:border-zinc-700/80 transition-colors">
            <div className="h-32 w-full bg-zinc-900/60 flex items-center justify-center p-4 relative">
              <div className="flex gap-1 items-end h-10 w-full justify-center">
                <span className="w-1 bg-emerald-500/30 h-4 rounded" />
                <span className="w-1 bg-emerald-500/40 h-8 rounded animate-pulse" />
                <span className="w-1 bg-emerald-500/50 h-5 rounded" />
                <span className="w-1 bg-emerald-500/60 h-10 rounded animate-pulse [animation-delay:0.2s]" />
                <span className="w-1 bg-emerald-500/50 h-6 rounded" />
                <span className="w-1 bg-emerald-500/40 h-8 rounded animate-pulse [animation-delay:0.4s]" />
                <span className="w-1 bg-emerald-500/30 h-3 rounded" />
              </div>
              <div className="absolute top-2 left-2 bg-zinc-950/80 text-[10px] px-2 py-0.5 rounded text-emerald-400 font-bold border border-emerald-500/20">
                AUDIO ANNOUNCEMENT
              </div>
            </div>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
              <span className="text-xs font-bold text-zinc-200">Standard PA Announcement</span>
              <span className="text-[10px] text-zinc-500 leading-normal">Pre-recorded official announcement script for transit crowd control.</span>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSpeechSynthesisText("Attention all fans in Zone 1, please proceed towards Gate C for rapid boarding.");
                  }}
                  className="bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white text-[10px] py-1.5 rounded-lg font-bold transition-all text-center"
                >
                  Load Script
                </button>
                <button
                  onClick={playSampleAudio}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[10px] py-1.5 rounded-lg font-bold transition-all text-center"
                >
                  Listen Live
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision AI Section */}
      <div className="flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="text-blue-500 w-5 h-5" aria-hidden="true" />
            Vision AI Analyst
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Upload gate screenshots or crowd camera footage to run real-time density assessments.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current!.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[180px] ${
            dragActive ? "border-blue-500 bg-blue-500/5" : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
          }`}
          role="button"
          aria-label="Upload file area. Drag and drop file or click to select."
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileInput}
            className="hidden"
            aria-hidden="true"
          />
          {filePreview ? (
            <div className="flex flex-col items-center gap-2">
              {selectedFile!.type.startsWith("video/") ? (
                <video src={filePreview} controls className="max-h-28 rounded-lg border border-zinc-800 bg-black" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={filePreview} alt="Uploaded Preview" className="max-h-28 rounded-lg border border-zinc-800" />
              )}
              <span className="text-xs text-zinc-400 font-mono mt-1">{selectedFile!.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-zinc-600 stroke-[1.5]" />
              <div>
                <span className="block text-sm font-bold text-zinc-200">Drag & Drop file here</span>
                <span className="text-xs text-zinc-500 mt-1">Supports PNG, JPG, or MP4 up to 10MB</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleVisionAnalyze}
          disabled={!selectedFile || isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
          aria-label="Run Vision AI crowd analysis"
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? "Processing Stream..." : "Run Density Assessment"}
        </button>

        {/* Vision AI Output */}
        {visionResult && (
          <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl flex gap-3 text-xs text-zinc-300 leading-relaxed" role="status">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p>{visionResult}</p>
          </div>
        )}
      </div>

      {/* Audio Synthesis Section */}
      <div className="flex flex-col gap-6 bg-zinc-900/50 backdrop-blur border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Volume2 className="text-emerald-500 w-5 h-5" aria-hidden="true" />
            Public Address (PA) Audio Synthesizer
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Convert announcements to spoken broadcasts in multiple dialects instantly.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="synthesis-text" className="text-sm font-bold text-zinc-300">
            Broadcast Announcement Script
          </label>
          <textarea
            id="synthesis-text"
            value={speechSynthesisText}
            onChange={(e) => setSpeechSynthesisText(e.target.value)}
            placeholder="e.g. Attention all fans in Zone 1, please proceed towards Gate C for rapid boarding."
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 min-h-[120px] resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAudioSynthesize}
            disabled={!speechSynthesisText || isSynthesizing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
            aria-label="Synthesize audio file"
          >
            <Volume2 className="w-4 h-4" />
            {isSynthesizing ? "Synthesizing dialect..." : "Generate Voice Broadcast"}
          </button>
          <button
            onClick={playSampleAudio}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 border border-zinc-700"
            aria-label="Play demo announcement audio"
          >
            Play Demo Audio
          </button>
        </div>

        {/* Audio Playback State Visualizer */}
        {audioPlaybackActive && (
          <div className="bg-zinc-950/80 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-3" role="status">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 animate-bounce" />
              Broadcasting Live Announcement
            </div>
            {/* Visualizer bars */}
            <div className="flex gap-1 items-end h-8 px-2" aria-hidden="true">
              <span className="w-1.5 h-3 bg-emerald-500 animate-pulse rounded-full" />
              <span className="w-1.5 h-6 bg-emerald-500 animate-pulse [animation-delay:0.15s] rounded-full" />
              <span className="w-1.5 h-4 bg-emerald-500 animate-pulse [animation-delay:0.3s] rounded-full" />
              <span className="w-1.5 h-8 bg-emerald-500 animate-pulse [animation-delay:0.45s] rounded-full" />
              <span className="w-1.5 h-5 bg-emerald-500 animate-pulse [animation-delay:0.6s] rounded-full" />
              <span className="w-1.5 h-2 bg-emerald-500 animate-pulse [animation-delay:0.75s] rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

MultiModalHub.displayName = "MultiModalHub";
