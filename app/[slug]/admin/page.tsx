'use client';
import { Box, Typography, Grid, Card, CardContent, CardOverflow, Button, Chip, IconButton, CircularProgress, Alert, Switch, Divider } from '@mui/joy';
import { useState, useEffect, useCallback } from 'react';
import { createApiService } from '@/lib/api-client';
import { NavBar } from '@/components/NavBar';
import ItemForm from '@/components/admin/ItemForm';
import { ItemData } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { use } from 'react';


export default function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const api = createApiService(slug, getIdToken);

  const [items, setItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemData | undefined>(undefined);

  useEffect(() => { if (!loading && !user) router.replace(`/login?next=/${slug}/admin`); }, [user, loading]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getItems();
      if (res.success && res.data) setItems(res.data as ItemData[]);
      else setError(res.error || 'Failed to fetch items');
    } catch { setError('Unexpected error'); }
    finally { setIsLoading(false); }
  }, [slug]);

  useEffect(() => { if (user) fetchItems(); }, [fetchItems, user]);

  const handleCreateOrEdit = async (data: Partial<ItemData>, imageFile?: File) => {
    if (editingItem?.id) {
      // Edit existing
      await api.updateItem(String(editingItem.id), data);
      if (imageFile) {
        await api.uploadItemImage(String(editingItem.id), imageFile);
      }
    } else {
      // Create new
      const res = await api.createItem(data);
      if (res.success && res.data && imageFile) {
        await api.uploadItemImage(res.data.itemId, imageFile);
      }
    }
    setEditingItem(undefined);
    await fetchItems();
  };

  const handleToggleSoldOut = async (item: ItemData) => {
    if (!item.id) return;
    await api.updateItem(String(item.id), { soldOut: !item.soldOut });
    await fetchItems();
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    await api.deleteItem(itemId);
    await fetchItems();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;

  // Group by category
  const byCategory = items.reduce((acc, item) => {
    const cat = item.category || 'misc';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, ItemData[]>);

  return (
    <>
      <NavBar slug={slug} showAdminLinks />
      <Box sx={{ pt: 10, px: { xs: 2, md: 4 }, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h1">Menu Items</Typography>
          <Button
            size="lg"
            startDecorator={<AddIcon />}
            onClick={() => { setEditingItem(undefined); setFormOpen(true); }}
          >
            Add Item
          </Button>
        </Box>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box
            sx={{ textAlign: 'center', py: 8, border: '2px dashed', borderColor: 'divider', borderRadius: 'lg', cursor: 'pointer' }}
            onClick={() => { setEditingItem(undefined); setFormOpen(true); }}
          >
            <AddIcon sx={{ fontSize: 48, color: 'text.tertiary', mb: 1 }} />
            <Typography level="h3" sx={{ color: 'text.secondary' }}>No items yet</Typography>
            <Typography level="body-md" sx={{ color: 'text.tertiary', mt: 0.5 }}>Click to add your first menu item</Typography>
          </Box>
        ) : (
          Object.entries(byCategory).map(([cat, catItems]) => (
            <Box key={cat} sx={{ mb: 4 }}>
              <Typography level="h3" sx={{ mb: 2, fontWeight: 'bold' }}>{cat}</Typography>
              <Grid container spacing={2}>
                {catItems.map((item) => (
                  <Grid key={String(item.id)} xs={12} sm={6} md={4} lg={3}>
                    <Card variant="outlined" sx={{ height: '100%', opacity: item.soldOut ? 0.6 : 1 }}>
                      {item.imageUrl && (
                        <CardOverflow>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                          />
                        </CardOverflow>
                      )}
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography level="title-md">{item.name}</Typography>
                            {item.description && (
                              <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                {item.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {Array.isArray(item.options) && item.options.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(item.options as any[]).map((opt: any) => (
                              <Chip key={opt.name} size="sm" variant="soft">{opt.name}</Chip>
                            ))}
                          </Box>
                        )}
                      </CardContent>

                      <Divider />

                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            size="sm"
                            checked={item.soldOut ?? false}
                            onChange={() => handleToggleSoldOut(item)}
                          />
                          <Typography level="body-xs">{item.soldOut ? 'Sold out' : 'Available'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="primary"
                            onClick={() => { setEditingItem(item); setFormOpen(true); }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="plain"
                            color="danger"
                            onClick={() => handleDelete(String(item.id))}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Box>

      <ItemForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(undefined); }}
        onSubmit={handleCreateOrEdit}
        initialData={editingItem}
        existingCategories={[...new Set(items.map((i) => i.category).filter(Boolean) as string[])]}
      />
    </>
  );
}
