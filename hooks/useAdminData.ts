import { useState, useCallback, useMemo } from 'react';
import { createApiService } from '@/lib/api-client';
import { ItemData, CategoryData } from '@/types';

export function useAdminData(slug: string, getIdToken: () => Promise<string | null>) {
  const api = createApiService(slug, getIdToken);

  const [items, setItems] = useState<ItemData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([api.getCategories(), api.getAllItems()]);
      if (catRes.success && catRes.data) setCategories(catRes.data as CategoryData[]);
      else setError(catRes.error || 'Failed to fetch categories');
      if (itemRes.success && itemRes.data) setItems(itemRes.data as ItemData[]);
      else setError(itemRes.error || 'Failed to fetch items');
    } catch { setError('Unexpected error'); }
    finally { setIsLoading(false); }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateOrEdit = useCallback(async (data: Partial<ItemData>, imageFile?: File, editingItemId?: string) => {
    if (editingItemId) {
      await api.updateItem(editingItemId, data);
      if (imageFile) await api.uploadItemImage(editingItemId, imageFile);
    } else {
      const res = await api.createItem(data);
      if (res.success && res.data && imageFile) await api.uploadItemImage(res.data.itemId, imageFile);
    }
    await fetchAll();
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleSoldOut = useCallback(async (item: ItemData) => {
    if (!item.id) return;
    await api.updateItem(String(item.id), { soldOut: !item.soldOut });
    await fetchAll();
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleArchiveItem = useCallback(async (item: ItemData, archived: boolean) => {
    if (!item.id) return;
    await api.setItemArchived(String(item.id), archived);
    await fetchAll();
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleArchiveCategory = useCallback(async (cat: CategoryData, archived: boolean) => {
    await api.setCategoryArchived(cat.name, archived);
    await fetchAll();
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteItem = useCallback(async (item: ItemData) => {
    if (!item.id) return;
    await api.deleteItem(String(item.id));
    await fetchAll();
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteCategory = useCallback(async (cat: CategoryData) => {
    await api.deleteCategory(cat.name);
    await fetchAll();
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddCategory = useCallback(async (name: string) => {
    const res = await api.createCategory(name);
    if (!res.success) throw new Error(res.error || 'Failed to create category');
    await fetchAll();
  }, [fetchAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const derived = useMemo(() => {
    const activeCategories = categories.filter((c) => !c.archived);
    const archivedCategories = categories.filter((c) => c.archived);
    const archivedCategoryNames = new Set(archivedCategories.map((c) => c.name));

    const byCategory = items.reduce((acc, item) => {
      const cat = item.category || '__uncategorized__';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, ItemData[]>);

    const uncategorized = items.filter((i) => {
      const cat = i.category || '__uncategorized__';
      return !activeCategories.some((c) => c.name === cat) && !archivedCategoryNames.has(cat) && !i.archived;
    });

    const individuallyArchivedItems = items.filter(
      (i) => i.archived && !archivedCategoryNames.has(i.category || ''),
    );

    const archiveCount = archivedCategories.length + individuallyArchivedItems.length;

    return { activeCategories, archivedCategories, byCategory, uncategorized, individuallyArchivedItems, archiveCount };
  }, [items, categories]);

  return {
    items,
    categories,
    ...derived,
    isLoading,
    error,
    fetchAll,
    handleCreateOrEdit,
    handleToggleSoldOut,
    handleArchiveItem,
    handleArchiveCategory,
    handleDeleteItem,
    handleDeleteCategory,
    handleAddCategory,
  };
}
