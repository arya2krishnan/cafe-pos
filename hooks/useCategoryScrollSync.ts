import { useState, useRef, useEffect, SyntheticEvent } from 'react';

export function useCategoryScrollSync(visibleCategories: string[]) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleTabChange = (_: SyntheticEvent | null, value: string | number | null) => {
    if (value === null) return;
    const idx = typeof value === 'string' ? parseInt(value, 10) : value;
    setActiveCategory(idx);
    setIsManualNavigation(true);
    const catKey = visibleCategories[idx];
    if (catKey) {
      categoryRefs.current[catKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => setIsManualNavigation(false), 1000);
  };

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (isManualNavigation) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        let selectedCat = '';
        let bestScore = 0;
        visibleCategories.forEach((cat) => {
          const el = categoryRefs.current[cat];
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const elTop = rect.top + scrollTop;
          const vis = Math.max(0, Math.min(rect.height, scrollTop + windowHeight - elTop) - Math.max(0, scrollTop - elTop));
          const score = (vis / rect.height) * (1 - Math.abs(rect.top) / windowHeight);
          if (score > bestScore && vis / rect.height > 0.3) { bestScore = score; selectedCat = cat; }
        });
        if (selectedCat) {
          const idx = visibleCategories.indexOf(selectedCat);
          if (idx !== -1 && idx !== activeCategory) setActiveCategory(idx);
        }
      }, 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(scrollTimeout); };
  }, [visibleCategories, isManualNavigation, activeCategory]);

  return { activeCategory, categoryRefs, handleTabChange };
}
