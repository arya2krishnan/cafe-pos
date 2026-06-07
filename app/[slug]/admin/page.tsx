'use client';
import { Box, Typography, Grid, Card, CardContent, CardOverflow, Button, Chip, CircularProgress, Alert, Divider } from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import { useState, useEffect } from 'react';
import { NavBar } from '@/components/NavBar';
import ItemForm from '@/components/admin/ItemForm';
import AdminItemCard from '@/components/admin/AdminItemCard';
import AddCategoryModal from '@/components/admin/AddCategoryModal';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import { useAdminData } from '@/hooks/useAdminData';
import { ItemData, CategoryData } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { use } from 'react';

export default function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();

  const {
    activeCategories, archivedCategories, byCategory, uncategorized,
    individuallyArchivedItems, archiveCount,
    isLoading, error, fetchAll,
    handleCreateOrEdit, handleToggleSoldOut, handleArchiveItem, handleArchiveCategory,
    handleDeleteItem, handleDeleteCategory, handleAddCategory,
  } = useAdminData(slug, getIdToken);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingItem, setEditingItem] = useState<ItemData | undefined>(undefined);
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>(undefined);

  // Modal state
  const [deletingItem, setDeletingItem] = useState<ItemData | null>(null);
  const [deleteItemLoading, setDeleteItemLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryData | null>(null);
  const [deleteCatLoading, setDeleteCatLoading] = useState(false);
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace(`/login?next=/${slug}/admin`); }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) fetchAll(); }, [fetchAll, user]);

  const openForm = (item?: ItemData, cat?: string) => {
    setEditingItem(item);
    setPreselectedCategory(cat);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const onDeleteItem = async () => {
    if (!deletingItem) return;
    setDeleteItemLoading(true);
    try { await handleDeleteItem(deletingItem); setDeletingItem(null); }
    finally { setDeleteItemLoading(false); }
  };

  const onDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeleteCatLoading(true);
    try { await handleDeleteCategory(deletingCategory); setDeletingCategory(null); }
    finally { setDeleteCatLoading(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;

  return (
    <>
      <NavBar slug={slug} showAdminLinks />
      <Box sx={{ pt: 10, px: { xs: 2, md: 4 }, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h1">Menu Items</Typography>
          <Button size="lg" startDecorator={<AddIcon />} onClick={() => setAddCatOpen(true)}>
            Add Category
          </Button>
        </Box>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}><CircularProgress /></Box>
        ) : activeCategories.length === 0 && items_isEmpty(individuallyArchivedItems, byCategory, activeCategories) ? (
          <Box
            sx={{ textAlign: 'center', py: 8, border: '2px dashed', borderColor: 'divider', borderRadius: 'lg', cursor: 'pointer' }}
            onClick={() => setAddCatOpen(true)}
          >
            <AddIcon sx={{ fontSize: 48, color: 'text.tertiary', mb: 1 }} />
            <Typography level="h3" sx={{ color: 'text.secondary' }}>No categories yet</Typography>
            <Typography level="body-md" sx={{ color: 'text.tertiary', mt: 0.5 }}>Click to add your first category</Typography>
          </Box>
        ) : (
          <>
            {activeCategories.map((cat) => {
              const catItems = (byCategory[cat.name] ?? []).filter((i) => !i.archived);
              return (
                <Box key={cat.name} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography level="h3" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {cat.name}
                      <Typography component="span" level="body-sm" sx={{ ml: 1, color: 'text.tertiary' }}>
                        {catItems.length} item{catItems.length !== 1 ? 's' : ''}
                      </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="sm" variant="soft" startDecorator={<AddIcon />} onClick={() => openForm(undefined, cat.name)}>
                        Add Item
                      </Button>
                      <TooltipIconButton tooltip={`Archive ${cat.name}`} size="sm" variant="soft" color="neutral" onClick={() => handleArchiveCategory(cat, true)}>
                        <ArchiveIcon fontSize="small" />
                      </TooltipIconButton>
                      <TooltipIconButton tooltip={`Delete ${cat.name}`} size="sm" variant="soft" color="danger" onClick={() => setDeletingCategory(cat)}>
                        <DeleteIcon fontSize="small" />
                      </TooltipIconButton>
                    </Box>
                  </Box>

                  {catItems.length === 0 ? (
                    <Box
                      sx={{
                        py: 4, border: '1px dashed', borderColor: 'divider', borderRadius: 'md',
                        textAlign: 'center', cursor: 'pointer', color: 'text.tertiary',
                        '&:hover': { borderColor: 'primary.400', color: 'primary.400' },
                      }}
                      onClick={() => openForm(undefined, cat.name)}
                    >
                      <Typography level="body-sm">No items yet — click to add one</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {catItems.map((item) => (
                        <Grid key={String(item.id)} xs={12} sm={6} md={4} lg={3}>
                          <AdminItemCard
                            item={item}
                            onEdit={() => openForm(item)}
                            onDelete={() => setDeletingItem(item)}
                            onToggleSoldOut={() => handleToggleSoldOut(item)}
                            onArchive={() => handleArchiveItem(item, true)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              );
            })}

            {uncategorized.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Typography level="h3" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Uncategorized</Typography>
                  <Chip size="sm" color="warning" variant="soft">Legacy</Chip>
                </Box>
                <Grid container spacing={2}>
                  {uncategorized.map((item) => (
                    <Grid key={String(item.id)} xs={12} sm={6} md={4} lg={3}>
                      <AdminItemCard
                        item={item}
                        onEdit={() => openForm(item)}
                        onDelete={() => setDeletingItem(item)}
                        onToggleSoldOut={() => handleToggleSoldOut(item)}
                        onArchive={() => handleArchiveItem(item, true)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {archiveCount > 0 && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', mb: showArchive ? 3 : 0 }}
                  onClick={() => setShowArchive((v) => !v)}
                >
                  <ArchiveIcon sx={{ color: 'text.tertiary' }} />
                  <Typography level="h3" sx={{ color: 'text.secondary' }}>Archived</Typography>
                  <Chip size="sm" variant="soft" color="neutral">{archiveCount}</Chip>
                  {showArchive ? <ExpandLessIcon sx={{ color: 'text.tertiary', ml: 'auto' }} /> : <ExpandMoreIcon sx={{ color: 'text.tertiary', ml: 'auto' }} />}
                </Box>

                {showArchive && (
                  <Box>
                    {archivedCategories.map((cat) => {
                      const catItems = byCategory[cat.name] ?? [];
                      return (
                        <Box key={cat.name} sx={{ mb: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, opacity: 0.7 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography level="h3" sx={{ fontWeight: 'bold', textTransform: 'capitalize', textDecoration: 'line-through' }}>
                                {cat.name}
                              </Typography>
                              <Chip size="sm" color="neutral" variant="soft">Category • {catItems.length} item{catItems.length !== 1 ? 's' : ''}</Chip>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button size="sm" variant="soft" color="success" startDecorator={<UnarchiveIcon />} onClick={() => handleArchiveCategory(cat, false)}>
                                Unarchive
                              </Button>
                              <TooltipIconButton tooltip={`Delete ${cat.name}`} size="sm" variant="soft" color="danger" onClick={() => setDeletingCategory(cat)}>
                                <DeleteIcon fontSize="small" />
                              </TooltipIconButton>
                            </Box>
                          </Box>
                          {catItems.length > 0 && (
                            <Grid container spacing={2} sx={{ opacity: 0.6 }}>
                              {catItems.map((item) => (
                                <Grid key={String(item.id)} xs={12} sm={6} md={4} lg={3}>
                                  <Card variant="outlined" sx={{ height: '100%' }}>
                                    {item.imageUrl && (
                                      <CardOverflow>
                                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                      </CardOverflow>
                                    )}
                                    <CardContent>
                                      <Typography level="title-sm">{item.name}</Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          )}
                        </Box>
                      );
                    })}

                    {individuallyArchivedItems.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        {archivedCategories.length > 0 && (
                          <Typography level="title-sm" sx={{ color: 'text.tertiary', mb: 2 }}>Individual items</Typography>
                        )}
                        <Grid container spacing={2}>
                          {individuallyArchivedItems.map((item) => (
                            <Grid key={String(item.id)} xs={12} sm={6} md={4} lg={3}>
                              <AdminItemCard
                                item={item}
                                onEdit={() => openForm(item)}
                                onDelete={() => setDeletingItem(item)}
                                onToggleSoldOut={() => handleToggleSoldOut(item)}
                                onUnarchive={() => handleArchiveItem(item, false)}
                                isArchived
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      <ItemForm
        key={formKey}
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(undefined); setPreselectedCategory(undefined); }}
        onSubmit={(data, imageFile) => handleCreateOrEdit(data, imageFile, editingItem?.id ? String(editingItem.id) : undefined)}
        initialData={editingItem}
        categories={activeCategories}
        preselectedCategory={preselectedCategory}
        slug={slug}
        getIdToken={getIdToken}
        onCategoryCreated={() => fetchAll()}
      />

      <AddCategoryModal
        open={addCatOpen}
        onClose={() => setAddCatOpen(false)}
        onAdd={async (name) => { await handleAddCategory(name); setAddCatOpen(false); }}
      />

      <DeleteConfirmModal
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={onDeleteItem}
        loading={deleteItemLoading}
        title="Delete Item"
        description={<>Delete <strong>{deletingItem?.name}</strong>? This cannot be undone.</>}
      />

      <DeleteConfirmModal
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={onDeleteCategory}
        loading={deleteCatLoading}
        title="Delete Category"
        description={(() => {
          const count = deletingCategory ? (byCategory[deletingCategory.name] ?? []).length : 0;
          return (
            <>
              Delete <strong style={{ textTransform: 'capitalize' }}>{deletingCategory?.name}</strong>?{' '}
              {count > 0 ? <>This will permanently delete all <strong>{count} item{count !== 1 ? 's' : ''}</strong> in this category.</> : 'This category is empty.'}{' '}
              This cannot be undone.
            </>
          );
        })()}
      />
    </>
  );
}

function items_isEmpty(
  individuallyArchivedItems: any[],
  byCategory: Record<string, any[]>,
  activeCategories: any[],
): boolean {
  const activeItemCount = activeCategories.reduce((sum, c) => sum + (byCategory[c.name] ?? []).filter((i: any) => !i.archived).length, 0);
  return activeItemCount === 0 && individuallyArchivedItems.length === 0;
}
