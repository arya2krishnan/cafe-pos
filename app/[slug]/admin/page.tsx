'use client';
import { Box, Typography, Grid, Card, CardContent, CardOverflow, Button, Chip, CircularProgress, Alert, Divider, Input } from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import { useState, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { use } from 'react';

// ─── Inline category name editor ───────────────────────────────────────────

function CategoryNameEditor({
  cat,
  onRename,
}: {
  cat: CategoryData;
  onRename: (newName: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(cat.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(cat.name); }, [cat.name]);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === cat.name) { setEditing(false); setValue(cat.name); return; }
    setSaving(true);
    try { await onRename(trimmed); }
    catch { setValue(cat.name); }
    finally { setSaving(false); setEditing(false); }
  };

  if (editing) {
    return (
      <Input
        value={value}
        size="sm"
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); save(); }
          if (e.key === 'Escape') { setEditing(false); setValue(cat.name); }
        }}
        autoFocus
        endDecorator={saving ? <CircularProgress size="sm" /> : null}
        sx={{ fontWeight: 'bold', fontSize: 'xl', maxWidth: '280px', textTransform: 'capitalize' }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'text',
        '&:hover .edit-pencil': { opacity: 1 },
      }}
      onClick={() => setEditing(true)}
    >
      <Typography level="h3" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
        {cat.name}
      </Typography>
      <EditIcon className="edit-pencil" sx={{ fontSize: 16, color: 'text.tertiary', opacity: 0, transition: 'opacity 0.15s' }} />
    </Box>
  );
}

// ─── Sortable item card wrapper ─────────────────────────────────────────────

function SortableItemCard({ item, ...props }: { item: ItemData } & React.ComponentProps<typeof AdminItemCard>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(item.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <Grid xs={12} sm={6} md={4} lg={3}>
      <Box ref={setNodeRef} style={style} sx={{ height: '100%' }}>
        <AdminItemCard item={item} dragListeners={listeners} dragAttributes={attributes} {...props} />
      </Box>
    </Grid>
  );
}

// ─── Main admin page ────────────────────────────────────────────────────────

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
    handleSaveItemInline, handleRenameCategory, handleReorderCategories, handleReorderItems,
  } = useAdminData(slug, getIdToken);

  // Local state for optimistic D&D reordering
  const [localCategories, setLocalCategories] = useState<CategoryData[]>([]);
  const [localByCategory, setLocalByCategory] = useState<Record<string, ItemData[]>>({});

  useEffect(() => { setLocalCategories(activeCategories); }, [activeCategories]);
  useEffect(() => { setLocalByCategory(byCategory); }, [byCategory]);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = localCategories.findIndex((c) => c.name === active.id);
    const newIdx = localCategories.findIndex((c) => c.name === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(localCategories, oldIdx, newIdx);
    setLocalCategories(reordered);
    handleReorderCategories(reordered.map((c) => c.name));
  };

  const handleItemDragEnd = (catName: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const catItems = localByCategory[catName] ?? [];
    const oldIdx = catItems.findIndex((i) => String(i.id) === active.id);
    const newIdx = catItems.findIndex((i) => String(i.id) === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(catItems, oldIdx, newIdx);
    setLocalByCategory((prev) => ({ ...prev, [catName]: reordered }));
    handleReorderItems(reordered);
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
        ) : localCategories.length === 0 && items_isEmpty(individuallyArchivedItems, byCategory, activeCategories) ? (
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
              <SortableContext items={localCategories.map((c) => c.name)} strategy={verticalListSortingStrategy}>
                {localCategories.map((cat) => {
                  const catItems = (localByCategory[cat.name] ?? []).filter((i) => !i.archived);
                  return (
                    <SortableCategoryBlock
                      key={cat.name}
                      cat={cat}
                      catItems={catItems}
                      sensors={sensors}
                      onItemDragEnd={(e) => handleItemDragEnd(cat.name, e)}
                      onRename={(newName) => handleRenameCategory(cat, newName)}
                      onAddItem={() => openForm(undefined, cat.name)}
                      onArchiveCategory={() => handleArchiveCategory(cat, true)}
                      onDeleteCategory={() => setDeletingCategory(cat)}
                      onEditItem={(item) => openForm(item)}
                      onDeleteItem={(item) => setDeletingItem(item)}
                      onToggleSoldOut={(item) => handleToggleSoldOut(item)}
                      onArchiveItem={(item) => handleArchiveItem(item, true)}
                      onSaveItemInline={(item, updates) => handleSaveItemInline(item, updates)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>

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

// ─── Sortable category block ────────────────────────────────────────────────

interface SortableCategoryBlockProps {
  cat: CategoryData;
  catItems: ItemData[];
  sensors: ReturnType<typeof useSensors>;
  onItemDragEnd: (event: DragEndEvent) => void;
  onRename: (newName: string) => Promise<void>;
  onAddItem: () => void;
  onArchiveCategory: () => void;
  onDeleteCategory: () => void;
  onEditItem: (item: ItemData) => void;
  onDeleteItem: (item: ItemData) => void;
  onToggleSoldOut: (item: ItemData) => void;
  onArchiveItem: (item: ItemData) => void;
  onSaveItemInline: (item: ItemData, updates: { name?: string; description?: string }) => void;
}

function SortableCategoryBlock({
  cat, catItems, sensors, onItemDragEnd, onRename,
  onAddItem, onArchiveCategory, onDeleteCategory,
  onEditItem, onDeleteItem, onToggleSoldOut, onArchiveItem, onSaveItemInline,
}: SortableCategoryBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.name });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2, pb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            {...attributes}
            {...listeners}
            sx={{ cursor: 'grab', color: 'text.tertiary', display: 'flex', alignItems: 'center', touchAction: 'none', '&:hover': { color: 'text.primary' } }}
          >
            <DragIndicatorIcon />
          </Box>
          <CategoryNameEditor cat={cat} onRename={onRename} />
          <Typography component="span" level="body-sm" sx={{ color: 'text.tertiary' }}>
            {catItems.length} item{catItems.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="sm" variant="soft" startDecorator={<AddIcon />} onClick={onAddItem}>
            Add Item
          </Button>
          <TooltipIconButton tooltip={`Archive ${cat.name}`} size="sm" variant="soft" color="neutral" onClick={onArchiveCategory}>
            <ArchiveIcon fontSize="small" />
          </TooltipIconButton>
          <TooltipIconButton tooltip={`Delete ${cat.name}`} size="sm" variant="soft" color="danger" onClick={onDeleteCategory}>
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
          onClick={onAddItem}
        >
          <Typography level="body-sm">No items yet — click to add one</Typography>
        </Box>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onItemDragEnd}>
          <SortableContext items={catItems.map((i) => String(i.id))} strategy={rectSortingStrategy}>
            <Grid container spacing={2}>
              {catItems.map((item) => (
                <SortableItemCard
                  key={String(item.id)}
                  item={item}
                  onEdit={() => onEditItem(item)}
                  onDelete={() => onDeleteItem(item)}
                  onToggleSoldOut={() => onToggleSoldOut(item)}
                  onArchive={() => onArchiveItem(item)}
                  onSaveInline={(updates) => onSaveItemInline(item, updates)}
                />
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
      )}
    </Box>
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
