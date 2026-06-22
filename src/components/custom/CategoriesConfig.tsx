'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, X, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface CategoriesConfigProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoriesConfig({ categories, onRefresh }: CategoriesConfigProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete states
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (res.ok) {
        setNewCategoryName('');
        onRefresh();
        toast.success('Category added successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add category');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    if (editingCategoryName.trim().toLowerCase() === 'general') {
      toast.error('Cannot rename a category to "General".');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingCategoryName.trim() }),
      });
      if (res.ok) {
        setEditingCategoryId(null);
        onRefresh();
        toast.success('Category updated successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update category');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (name === 'General') {
      toast.error('Cannot delete the default General category.');
      return;
    }
    setDeleteCategoryId(id);
    setDeleteCategoryName(name);
  };

  const executeDelete = async () => {
    if (!deleteCategoryId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories?id=${deleteCategoryId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onRefresh();
        toast.success('Category deleted successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete category');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete category');
    } finally {
      setIsDeleting(false);
      setDeleteCategoryId(null);
    }
  };

  return (
    <div className="bg-[#18181b]/30 border border-[#27272a]/40 rounded-xl p-4.5 space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#27272a]/30">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Post Categories</h4>
            <p className="text-xs text-neutral-400 mt-1">Configure classification categories used for style memory grouping.</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Dev Jokes"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="bg-[#09090b] border-[#27272a] focus:border-blue-500 h-10 text-sm flex-1"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={adding || !newCategoryName.trim()}
            className="h-10 px-4 text-sm shrink-0"
          >
            {adding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Add
          </Button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((c) => {
          const isEditing = editingCategoryId === c.id;
          return (
            <div
              key={c.id}
              className={`flex items-center justify-between bg-[#09090b] px-3 py-2 rounded-lg border transition-all duration-150 min-h-[46px] ${
                isEditing ? 'border-blue-500/70' : 'border-[#27272a]/60 hover:border-[#27272a]'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-2 w-full p-0.5">
                  <Input
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(c.id);
                      if (e.key === 'Escape') setEditingCategoryId(null);
                    }}
                    className="bg-[#18181b] border-[#27272a] h-9 text-sm text-white focus:border-blue-500 flex-1 w-full"
                    autoFocus
                    disabled={saving}
                  />
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={saving || !editingCategoryName.trim()}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 font-semibold"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCategoryId(null)}
                      disabled={saving}
                      className="h-8 text-xs text-neutral-400 hover:text-white px-3 font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-white font-medium text-sm pl-1">{c.name}</span>
                  <div className="flex gap-1 shrink-0 items-center">
                    {c.name !== 'General' ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(c)}
                          className="text-neutral-500 hover:text-blue-400 hover:bg-neutral-800/40 h-8 w-8 rounded-lg"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(c.id, c.name)}
                          className="text-neutral-500 hover:text-red-400 hover:bg-red-950/20 h-8 w-8 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-[9px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-[#27272a] select-none font-bold uppercase tracking-wider">
                        System Default
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={deleteCategoryId !== null} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteCategoryId(null); }}>
        <AlertDialogContent className="bg-[#18181b] border border-[#27272a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete the category &quot;{deleteCategoryName}&quot;? Note that you cannot delete a category if it is currently in use by any posts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-neutral-850 border-[#27272a] text-white hover:bg-neutral-800"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={executeDelete}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
