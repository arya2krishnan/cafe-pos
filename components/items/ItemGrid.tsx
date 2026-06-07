'use client';
import { Box, Typography, Divider, Tabs, TabList, Tab, tabClasses } from '@mui/joy';
import { useState, useMemo } from 'react';
import { ItemData } from '@/types';
import ItemCard from './ItemCard';
import ItemOptionsModal from './ItemOptionsModal';
import { useCartStore } from '@/store/cartStore';
import { useCategoryScrollSync } from '@/hooks/useCategoryScrollSync';


interface ItemGridProps {
  items: ItemData[];
}

export default function ItemGrid({ items }: ItemGridProps) {
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const itemsByCategory = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const cat = item.category || 'misc';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      },
      {} as Record<string, ItemData[]>,
    );
  }, [items]);

  const visibleCategories = useMemo(
    () => [...new Set(items.map((i) => i.category || 'misc'))],
    [items],
  );

  const { activeCategory, categoryRefs, handleTabChange } = useCategoryScrollSync(visibleCategories);

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

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      {/* Vertical category tabs — desktop only */}
      <Box
        sx={{
          width: '140px', flexShrink: 0, position: 'sticky', top: '80px', alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', display: { xs: 'none', md: 'block' },
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.1)' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
        }}
      >
        <Tabs
          orientation="vertical"
          value={activeCategory}
          onChange={handleTabChange}
          sx={{ minWidth: '140px', borderRadius: 'lg', boxShadow: 'md', p: 0.5, bgcolor: 'background.surface', height: 'auto' }}
        >
          <TabList
            sx={{
              width: '100%',
              [`&& .${tabClasses.root}`]: {
                flex: 'initial', bgcolor: 'transparent', transition: 'all 0.3s', borderRadius: 'md',
                py: 2, my: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center',
                '&:hover': { bgcolor: 'background.level1', color: 'primary.plainColor' },
                [`&.${tabClasses.selected}`]: {
                  color: 'primary.plainColor', bgcolor: 'primary.softBg', fontWeight: 'lg', boxShadow: 'sm',
                },
              },
            }}
          >
            {visibleCategories.map((cat, idx) => (
              <Tab key={cat} value={idx} sx={{ px: 2, '--Tab-minHeight': '70px', gap: 1 }}>
                <Typography level="title-md" fontWeight="lg">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Typography>
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>

      {/* Item sections */}
      <Box sx={{ flexGrow: 1, pl: { xs: 0, md: 1.5 }, maxWidth: { xs: '100%', md: 'calc(100% - 140px)' } }}>
        {/* Mobile horizontal tabs */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2, position: 'sticky', top: '64px', zIndex: 10, bgcolor: 'background.body', pt: 1 }}>
          <Tabs value={activeCategory} onChange={handleTabChange} sx={{ overflowX: 'auto' }}>
            <TabList sx={{ gap: 0.5 }}>
              {visibleCategories.map((cat, idx) => (
                <Tab key={cat} value={idx} sx={{ fontSize: 'xs', whiteSpace: 'nowrap' }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Box>

        {visibleCategories.map((cat) => (
          <Box
            key={cat}
            ref={(el: HTMLDivElement | null) => { categoryRefs.current[cat] = el; }}
            sx={{ mb: 8, maxWidth: '100%' }}
            data-category={cat}
          >
            <Typography level="h2" sx={{ mb: 2, textAlign: 'center' }}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 3,
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
