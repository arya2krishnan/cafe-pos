'use client';
import { useState, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box, Button, Input, Typography, Select, Option, IconButton,
  Chip, FormLabel,
} from '@mui/joy';
import TooltipIconButton from '@/components/common/TooltipIconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import CheckIcon from '@mui/icons-material/Check';
import { OptionTemplate } from '@/types';

export interface OptionGroup {
  name: string;
  values: string[];
  isMultiple: boolean;
  defaultValue?: string;
}

// ─── Sortable value row within a group ──────────────────────────────────────

interface SortableValueProps {
  id: string;
  value: string;
  isDefault: boolean;
  onRemove: () => void;
  onToggleDefault: () => void;
  onRename: (newValue: string) => void;
}

function SortableValue({ id, value, isDefault, onRemove, onToggleDefault, onRename }: SortableValueProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onRename(trimmed);
    else setDraft(value);
    setEditing(false);
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: 'grab', color: 'text.tertiary', display: 'flex', alignItems: 'center', touchAction: 'none' }}
      >
        <DragIndicatorIcon sx={{ fontSize: 18 }} />
      </Box>
      {editing ? (
        <Input
          size="sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
          autoFocus
          sx={{ flex: 1 }}
        />
      ) : (
        <Typography
          level="body-sm"
          onClick={() => { setDraft(value); setEditing(true); }}
          sx={{ flex: 1, cursor: 'text', '&:hover': { color: 'text.primary' } }}
        >
          {value}
        </Typography>
      )}
      <IconButton
        size="sm"
        variant="plain"
        onClick={onToggleDefault}
        title={isDefault ? 'Remove default' : 'Set as default'}
        sx={{ color: isDefault ? 'warning.400' : 'neutral.400', minWidth: 28 }}
      >
        {isDefault ? <StarIcon sx={{ fontSize: 16 }} /> : <StarBorderIcon sx={{ fontSize: 16 }} />}
      </IconButton>
      <IconButton size="sm" variant="plain" color="neutral" onClick={onRemove} title="Remove value">
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

// ─── Sortable option group ───────────────────────────────────────────────────

interface SortableOptionGroupProps {
  group: OptionGroup;
  gIdx: number;
  newValue: string;
  savedIndicator: boolean;
  sensors: ReturnType<typeof useSensors>;
  onNewValueChange: (v: string) => void;
  onAddValue: () => void;
  onRemoveValue: (vIdx: number) => void;
  onRenameValue: (vIdx: number, newVal: string) => void;
  onToggleDefault: (value: string) => void;
  onToggleMultiple: () => void;
  onRemoveGroup: () => void;
  onRenameGroup: (newName: string) => void;
  onSaveTemplate: () => void;
  onValueDragEnd: (event: DragEndEvent) => void;
}

function SortableOptionGroup({
  group, gIdx, newValue, savedIndicator, sensors,
  onNewValueChange, onAddValue, onRemoveValue, onRenameValue, onToggleDefault,
  onToggleMultiple, onRemoveGroup, onRenameGroup, onSaveTemplate, onValueDragEnd,
}: SortableOptionGroupProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.name });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== group.name) onRenameGroup(trimmed);
    else setNameDraft(group.name);
    setEditingName(false);
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 2, p: 1.5, bgcolor: 'background.level1', borderRadius: 'md' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            {...attributes}
            {...listeners}
            sx={{ cursor: 'grab', color: 'text.tertiary', display: 'flex', alignItems: 'center', touchAction: 'none', '&:hover': { color: 'text.primary' } }}
          >
            <DragIndicatorIcon sx={{ fontSize: 18 }} />
          </Box>
          {editingName ? (
            <Input
              size="sm"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveName(); } if (e.key === 'Escape') { setNameDraft(group.name); setEditingName(false); } }}
              autoFocus
              sx={{ fontWeight: 'bold', maxWidth: '180px' }}
            />
          ) : (
            <Typography
              level="title-sm"
              onClick={() => { setNameDraft(group.name); setEditingName(true); }}
              sx={{ cursor: 'text', '&:hover': { color: 'text.primary' } }}
            >
              {group.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Chip
            size="sm"
            variant={group.isMultiple ? 'solid' : 'outlined'}
            color="neutral"
            onClick={onToggleMultiple}
            sx={{ cursor: 'pointer' }}
          >
            {group.isMultiple ? 'Multi-select' : 'Single-select'}
          </Chip>
          <TooltipIconButton
            tooltip={savedIndicator ? 'Saved!' : 'Save as template'}
            size="sm"
            variant="plain"
            color={savedIndicator ? 'success' : 'neutral'}
            onClick={onSaveTemplate}
          >
            {savedIndicator ? <CheckIcon sx={{ fontSize: 16 }} /> : <BookmarkAddIcon sx={{ fontSize: 16 }} />}
          </TooltipIconButton>
          <TooltipIconButton tooltip="Remove option group" size="sm" variant="plain" color="danger" onClick={onRemoveGroup}>
            <CloseIcon fontSize="small" />
          </TooltipIconButton>
        </Box>
      </Box>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onValueDragEnd}>
        <SortableContext items={group.values} strategy={verticalListSortingStrategy}>
          {group.values.map((v, vIdx) => (
            <SortableValue
              key={`${v}-${vIdx}`}
              id={v}
              value={v}
              isDefault={group.defaultValue === v}
              onRemove={() => onRemoveValue(vIdx)}
              onToggleDefault={() => onToggleDefault(v)}
              onRename={(newVal) => onRenameValue(vIdx, newVal)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Input
          size="sm"
          placeholder="Add value (e.g. Small)"
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddValue(); } }}
          sx={{ flex: 1 }}
        />
        <TooltipIconButton tooltip="Add value" size="sm" variant="outlined" onClick={onAddValue}>
          <AddIcon />
        </TooltipIconButton>
      </Box>
    </Box>
  );
}

// ─── Main builder ────────────────────────────────────────────────────────────

interface OptionGroupBuilderProps {
  options: OptionGroup[];
  onOptionsChange: (options: OptionGroup[]) => void;
  slug: string;
  getIdToken: () => Promise<string | null>;
}

export default function OptionGroupBuilder({ options, onOptionsChange, slug, getIdToken }: OptionGroupBuilderProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newOptionValue, setNewOptionValue] = useState<Record<number, string>>({});
  const [templates, setTemplates] = useState<OptionTemplate[]>([]);
  const [savedGroupIdx, setSavedGroupIdx] = useState<Record<number, boolean>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let cancelled = false;
    getIdToken().then((token) => {
      if (!token || cancelled) return;
      fetch(`/api/${slug}/option-templates`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data) => { if (!cancelled && Array.isArray(data)) setTemplates(data); })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [slug, getIdToken]);

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    onOptionsChange([...options, { name: newGroupName.trim(), values: [], isMultiple: false }]);
    setNewGroupName('');
  };

  const addValue = (groupIdx: number) => {
    const val = (newOptionValue[groupIdx] || '').trim();
    if (!val) return;
    onOptionsChange(options.map((g, i) => i === groupIdx ? { ...g, values: [...g.values, val] } : g));
    setNewOptionValue((prev) => ({ ...prev, [groupIdx]: '' }));
  };

  const removeValue = (groupIdx: number, valIdx: number) => {
    onOptionsChange(options.map((g, i) => {
      if (i !== groupIdx) return g;
      const newValues = g.values.filter((_, vi) => vi !== valIdx);
      return g.values[valIdx] === g.defaultValue
        ? { ...g, values: newValues, defaultValue: undefined }
        : { ...g, values: newValues };
    }));
  };

  const removeGroup = (groupIdx: number) => {
    onOptionsChange(options.filter((_, i) => i !== groupIdx));
  };

  const toggleMultiple = (groupIdx: number) => {
    onOptionsChange(options.map((g, i) => i === groupIdx ? { ...g, isMultiple: !g.isMultiple } : g));
  };

  const renameGroup = (groupIdx: number, newName: string) => {
    onOptionsChange(options.map((g, i) => i === groupIdx ? { ...g, name: newName } : g));
  };

  const renameValue = (groupIdx: number, valIdx: number, newVal: string) => {
    onOptionsChange(options.map((g, i) => {
      if (i !== groupIdx) return g;
      const newValues = g.values.map((v, vi) => vi === valIdx ? newVal : v);
      const defaultValue = g.defaultValue === g.values[valIdx] ? newVal : g.defaultValue;
      return { ...g, values: newValues, defaultValue };
    }));
  };

  const toggleDefault = (groupIdx: number, value: string) => {
    onOptionsChange(options.map((g, i) => {
      if (i !== groupIdx) return g;
      return { ...g, defaultValue: g.defaultValue === value ? undefined : value };
    }));
  };

  const handleValueDragEnd = (groupIdx: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const group = options[groupIdx];
    const oldIdx = group.values.indexOf(active.id as string);
    const newIdx = group.values.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    onOptionsChange(options.map((g, i) => i === groupIdx ? { ...g, values: arrayMove(g.values, oldIdx, newIdx) } : g));
  };

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = options.findIndex((g) => g.name === active.id);
    const newIdx = options.findIndex((g) => g.name === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onOptionsChange(arrayMove(options, oldIdx, newIdx));
  };

  const saveAsTemplate = async (groupIdx: number) => {
    const group = options[groupIdx];
    const token = await getIdToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/${slug}/option-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: group.name, values: group.values, isMultiple: group.isMultiple }),
      });
      if (res.ok) {
        const saved = await res.json();
        setTemplates((prev) => [...prev, saved]);
        setSavedGroupIdx((prev) => ({ ...prev, [groupIdx]: true }));
        setTimeout(() => setSavedGroupIdx((prev) => ({ ...prev, [groupIdx]: false })), 1500);
      }
    } catch {}
  };

  const loadTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    onOptionsChange([...options, { name: tpl.name, values: tpl.values, isMultiple: tpl.isMultiple }]);
  };

  return (
    <Box>
      <FormLabel sx={{ mb: 1 }}>Options (e.g. Size, Milk type)</FormLabel>

      {templates.length > 0 && (
        <Select
          size="sm"
          placeholder="Load a saved group..."
          onChange={(_, val) => { if (val) loadTemplate(val as string); }}
          sx={{ mb: 1.5 }}
          value={null}
        >
          {templates.map((t) => (
            <Option key={t.id} value={t.id}>{t.name} ({t.values.join(', ')})</Option>
          ))}
        </Select>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
        <SortableContext items={options.map((g) => g.name)} strategy={verticalListSortingStrategy}>
          {options.map((group, gIdx) => (
            <SortableOptionGroup
              key={`${group.name}-${gIdx}`}
              group={group}
              gIdx={gIdx}
              newValue={newOptionValue[gIdx] || ''}
              savedIndicator={!!savedGroupIdx[gIdx]}
              sensors={sensors}
              onNewValueChange={(v) => setNewOptionValue((prev) => ({ ...prev, [gIdx]: v }))}
              onAddValue={() => addValue(gIdx)}
              onRemoveValue={(vIdx) => removeValue(gIdx, vIdx)}
              onRenameValue={(vIdx, newVal) => renameValue(gIdx, vIdx, newVal)}
              onToggleDefault={(value) => toggleDefault(gIdx, value)}
              onToggleMultiple={() => toggleMultiple(gIdx)}
              onRemoveGroup={() => removeGroup(gIdx)}
              onRenameGroup={(newName) => renameGroup(gIdx, newName)}
              onSaveTemplate={() => saveAsTemplate(gIdx)}
              onValueDragEnd={(e) => handleValueDragEnd(gIdx, e)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Input
          size="sm"
          placeholder="New option group (e.g. Size)"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGroup(); } }}
          sx={{ flex: 1 }}
        />
        <Button size="sm" variant="outlined" startDecorator={<AddIcon />} onClick={addGroup}>
          Add option
        </Button>
      </Box>
    </Box>
  );
}
