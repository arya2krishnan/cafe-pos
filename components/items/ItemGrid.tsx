'use client';
import { Box, Typography, Tabs, TabList, Tab, tabClasses } from '@mui/joy';
import { useState, useMemo, useRef, useEffect, SyntheticEvent } from 'react';
import { ItemData } from '@/types';
import ItemCard from './ItemCard';
import ItemOptionsModal from './ItemOptionsModal';
import { useCartStore } from '@/store/cartStore';

const categoryNames: Record<string, string> = {
  e: 'Espresso',
  cb: 'Cold Brew',
  m: 'Matcha',
  sp: 'Specialty Coffee',
  st: 'Standard',
  t: 'Specialty Tea',
  misc: 'Misc.',
};

const categoryOrder = ['sp', 't', 'st', 'e', 'cb', 'm', 'misc'];

interface ItemGridProps {
  items: ItemData[];
}

export default function ItemGrid({ items }: ItemGridProps) {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const addItem = useCartStore((state) => state.addItem);

  const itemsByCategory = useMemo(() => {
    const grouped = items.reduce(
      (acc, item) => {
        const cat = item.category || 'misc';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, ItemData[]>,
    );
    categoryOrder.forEach((cat) => { if (!grouped[cat]) grouped[cat] = []; });
    return grouped;
  }, [items]);

  const visibleCategories = categoryOrder.filter((cat) => (itemsByCategory[cat]?.length || 0) > 0);

  const handleItemClick = (item: ItemData) => {
    if (item.soldOut) return;
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleAddToCart = (item: ItemData, selectedOptions: Record<string, string[]>, quantity: number) => {
    addItem(item, selectedOptions, quantity);
    setIsModalOpen(false);
    setSelectedItem(null);
  };

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

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      {/* Vertical category tabs — desktop only */}
      <Box
        sx={{
          width: '140px', flexShrink: 0, position: 'sticky', top: '80px', alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', display: { xs: 'none', md: 'block' },
        }}
      >
        <Tabs orientation="vertical" value={activeCategory} onChange={handleTabChange} sx={{ borderRadius: 'lg', boxShadow: 'sm', overflow: 'auto' }}>
          <TabList
            disableUnderline
            sx={{
              p: 0.5, gap: 0.5, borderRadius: 'xl', bgcolor: 'background.level1',
              [`& .${tabClasses.root}[aria-selected="true"]`]: { boxShadow: 'sm', bgcolor: 'background.surface' },
            }}
          >
            {visibleCategories.map((cat, idx) => (
              <Tab key={cat} disableIndicator value={idx} sx={{ borderRadius: 'lg', fontSize: 'sm', py: 1 }}>
                {categoryNames[cat] || cat}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>

      {/* Item sections */}
      <Box sx={{ flex: 1, ml: { xs: 0, md: 2 } }}>
        {/* Mobile horizontal tabs */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2, position: 'sticky', top: '64px', zIndex: 10, bgcolor: 'background.body', pt: 1 }}>
          <Tabs value={activeCategory} onChange={handleTabChange} sx={{ overflowX: 'auto' }}>
            <TabList sx={{ gap: 0.5 }}>
              {visibleCategories.map((cat, idx) => (
                <Tab key={cat} value={idx} sx={{ fontSize: 'xs', whiteSpace: 'nowrap' }}>
                  {categoryNames[cat] || cat}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>

        {visibleCategories.map((cat) => (
          <Box key={cat} ref={(el: HTMLDivElement | null) => { categoryRefs.current[cat] = el; }} sx={{ mb: 4, scrollMarginTop: '80px' }}>
            <Typography level="h3" sx={{ mb: 2, fontWeight: 'bold' }}>{categoryNames[cat] || cat}</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 2,
              }}
            >
              {itemsByCategory[cat].map((item) => (
                <ItemCard
                  key={item.id?.toString()}
                  url={item.imageUrl || ''}
                  title={item.name}
                  description={item.description || ''}
                  soldOut={item.soldOut}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {selectedItem && (
        <ItemOptionsModal
          item={selectedItem.name}
          description={selectedItem.description || ''}
          imageUrl={selectedItem.imageUrl}
          options={
            Array.isArray(selectedItem.options)
              ? selectedItem.options.map((opt: any) => ({
                  option: opt.name,
                  options: opt.values,
                  isMultiple: opt.isMultiple ?? false,
                  onChange: () => {},
                }))
              : []
          }
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
          onSubmit={(selectedOptions, quantity) => handleAddToCart(selectedItem, selectedOptions, quantity)}
        />
      )}
    </Box>
  );
}
