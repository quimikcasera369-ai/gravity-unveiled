import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface NarrationSection {
  text: string;
  sfxPrompt: string;
  sfxDuration: number;
}

const NARRATIONS: NarrationSection[] = [
  {
    text: "What if everything you know about gravity... is wrong? What if spacetime itself is not the stage, but an illusion born from something deeper?",
    sfxPrompt: "deep space ambient drone, mysterious void, low frequency hum",
    sfxDuration: 5,
  },
  {
    text: "Galaxies spin too fast. Stars at the edge should fly apart into the void. But they don't. Something unseen holds them together.",
    sfxPrompt: "cosmic whoosh, swirling galaxy rotation, ethereal wind",
    sfxDuration: 4,
  },
  {
    text: "A distortion ripples through spacetime. The old rules break down. A new force emerges from the quantum fabric itself.",
    sfxPrompt: "digital glitch distortion, electromagnetic pulse, reality tearing",
    sfxDuration: 3,
  },
  {
    text: "Below a critical threshold, gravity transforms. A new regime takes hold. The rules of the universe shift beneath your feet.",
    sfxPrompt: "energy threshold crossing, power surge, deep bass impact",
    sfxDuration: 3,
  },
  {
    text: "Space folds back on itself. Paths that once escaped now loop endlessly. Geometry becomes destiny.",
    sfxPrompt: "warping spacetime, bending dimensions, geometric resonance tone",
    sfxDuration: 4,
  },
  {
    text: "Zoom out. The universe expands. A horizon forms at the edge of all things, where information meets its boundary.",
    sfxPrompt: "vast cosmic expansion, deep space panorama, universe breathing",
    sfxDuration: 5,
  },
  {
    text: "The theory doesn't just explain. It predicts. And the universe is about to tell us if it's right.",
    sfxPrompt: "rising cinematic tension, data stream revelation, triumphant resolution",
    sfxDuration: 4,
  },
];

export function useAudioNarrator() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(-1);
  const [loadingSection, setLoadingSection] = useState<number | null>(null);
  
  const narrationCache = useRef<Map<number, string>>(new Map());
  const sfxCache = useRef<Map<number, string>>(new Map());
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const currentSfx = useRef<HTMLAudioElement | null>(null);
  const lastPlayedSection = useRef(-1);

  const hasShownError = useRef(false);

  const fetchAudio = useCallback(async (
    functionName: string,
    body: Record<string, unknown>,
  ): Promise<string | null> => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if ((response.status === 401 || response.status === 429) && !hasShownError.current) {
          hasShownError.current = true;
          toast({
            variant: 'destructive',
            title: 'Audio unavailable',
            description: response.status === 401
              ? 'ElevenLabs API key issue. Please check your account plan.'
              : 'Too many requests. Please wait and try again.',
          });
        }
        console.error(`${functionName} error:`, response.status);
        return null;
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error(`${functionName} fetch error:`, err);
      return null;
    }
  }, []);

  const stopAll = useCallback(() => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }
    if (currentSfx.current) {
      currentSfx.current.pause();
      currentSfx.current = null;
    }
  }, []);

  const playSection = useCallback(async (sectionIndex: number) => {
    if (!isEnabled || sectionIndex < 0 || sectionIndex >= NARRATIONS.length) return;
    if (sectionIndex === lastPlayedSection.current) return;

    lastPlayedSection.current = sectionIndex;
    stopAll();
    setLoadingSection(sectionIndex);

    const narration = NARRATIONS[sectionIndex];

    // Fetch SFX (play first for atmosphere)
    let sfxUrl = sfxCache.current.get(sectionIndex);
    if (!sfxUrl) {
      sfxUrl = await fetchAudio('elevenlabs-sfx', {
        prompt: narration.sfxPrompt,
        duration: narration.sfxDuration,
      }) ?? undefined;
      if (sfxUrl) sfxCache.current.set(sectionIndex, sfxUrl);
    }

    if (sfxUrl && isEnabled) {
      const sfx = new Audio(sfxUrl);
      sfx.volume = 0.3;
      currentSfx.current = sfx;
      sfx.play().catch(() => {});
    }

    // Fetch narration
    let narrationUrl = narrationCache.current.get(sectionIndex);
    if (!narrationUrl) {
      narrationUrl = await fetchAudio('elevenlabs-tts', {
        text: narration.text,
      }) ?? undefined;
      if (narrationUrl) narrationCache.current.set(sectionIndex, narrationUrl);
    }

    setLoadingSection(null);

    if (narrationUrl && isEnabled) {
      const audio = new Audio(narrationUrl);
      audio.volume = 0.8;
      currentAudio.current = audio;
      // Small delay so SFX plays first
      setTimeout(() => {
        audio.play().catch(() => {});
      }, 800);
    }
  }, [isEnabled, fetchAudio, stopAll]);

  // Preload next section
  const preloadSection = useCallback(async (sectionIndex: number) => {
    if (sectionIndex < 0 || sectionIndex >= NARRATIONS.length) return;
    if (narrationCache.current.has(sectionIndex)) return;

    const narration = NARRATIONS[sectionIndex];
    
    const [ttsUrl, sfxUrl] = await Promise.all([
      fetchAudio('elevenlabs-tts', { text: narration.text }),
      fetchAudio('elevenlabs-sfx', { prompt: narration.sfxPrompt, duration: narration.sfxDuration }),
    ]);

    if (ttsUrl) narrationCache.current.set(sectionIndex, ttsUrl);
    if (sfxUrl) sfxCache.current.set(sectionIndex, sfxUrl);
  }, [fetchAudio]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      if (prev) {
        stopAll();
        lastPlayedSection.current = -1;
      }
      return !prev;
    });
  }, [stopAll]);

  // Update section based on scroll
  const updateSection = useCallback((sectionIndex: number) => {
    setCurrentSection(sectionIndex);
    if (isEnabled && sectionIndex !== lastPlayedSection.current) {
      playSection(sectionIndex);
      // Preload next
      preloadSection(sectionIndex + 1);
    }
  }, [isEnabled, playSection, preloadSection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      narrationCache.current.forEach(url => URL.revokeObjectURL(url));
      sfxCache.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, [stopAll]);

  return {
    isEnabled,
    toggle,
    isLoading,
    loadingSection,
    currentSection,
    updateSection,
  };
}
