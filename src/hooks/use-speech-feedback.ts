"use client";

import { useCallback, useEffect, useRef } from "react";

export function useSpeechFeedback() {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech to avoid overlapping
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Find high-quality voices first
    const voices = synthRef.current.getVoices();
    const preferredVoices = voices.filter(
      (v) =>
        v.lang.startsWith("es") &&
        (v.name.includes("Google") ||
          v.name.includes("Natural") ||
          v.name.includes("Neural")),
    );

    // Fallback search
    const spanishVoice =
      preferredVoices[0] ||
      voices.find((v) => v.lang.startsWith("es")) ||
      voices[0];

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.lang = "es-ES";
    utterance.pitch = 1.1; // Slightly more energetic
    utterance.rate = 1;

    synthRef.current.speak(utterance);
  }, []);

  return { speak };
}
