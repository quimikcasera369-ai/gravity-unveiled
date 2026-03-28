import { useState, useEffect, useCallback } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return progress;
}

export function useSectionProgress(sectionIndex: number, totalSections: number) {
  const progress = useScrollProgress();
  const sectionSize = 1 / totalSections;
  const sectionStart = sectionIndex * sectionSize;
  const sectionEnd = sectionStart + sectionSize;
  const local = Math.max(0, Math.min(1, (progress - sectionStart) / sectionSize));
  const isActive = progress >= sectionStart && progress < sectionEnd;
  return { local, isActive, globalProgress: progress };
}
