'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus, X } from 'lucide-react';
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

interface TargetModel {
  id: string;
  name: string;
  value: string;
}

interface ModelsConfigProps {
  models: TargetModel[];
  onRefresh: () => void;
}

export default function ModelsConfig({ models, onRefresh }: ModelsConfigProps) {
  const [newModelName, setNewModelName] = useState('');
  const [newModelValue, setNewModelValue] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete states
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null);
  const [deleteModelName, setDeleteModelName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = async () => {
    if (!newModelName.trim() || !newModelValue.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newModelName.trim(),
          value: newModelValue.trim(),
        }),
      });
      if (res.ok) {
        setNewModelName('');
        setNewModelValue('');
        onRefresh();
        toast.success('Model added successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add model');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to add model');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModelId(id);
    setDeleteModelName(name);
  };

  const executeDelete = async () => {
    if (!deleteModelId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/models?id=${deleteModelId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onRefresh();
        toast.success('Model deleted successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete model');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete model');
    } finally {
      setIsDeleting(false);
      setDeleteModelId(null);
    }
  };

  return (
    <div className="bg-[#18181b]/30 border border-[#27272a]/40 rounded-xl p-4.5 space-y-4">
      <div className="space-y-3.5">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Target LLM Models</h4>
          <p className="text-xs text-neutral-400 mt-1">Manage custom LLM identifier strings used in routing selectors.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-neutral-300">Display Name</Label>
            <Input
              placeholder="e.g. GPT-4o Mini"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              className="bg-[#09090b] border-[#27272a] focus:border-blue-500 h-10 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-neutral-300">Model Identifier / Value</Label>
            <Input
              placeholder="e.g. gpt-4o-mini"
              value={newModelValue}
              onChange={(e) => setNewModelValue(e.target.value)}
              className="bg-[#09090b] border-[#27272a] focus:border-blue-500 h-10 text-sm font-mono"
            />
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleAdd}
          disabled={adding || !newModelName.trim() || !newModelValue.trim()}
          className="w-full h-10 text-sm shrink-0"
        >
          {adding ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
          Add Model
        </Button>
      </div>

      {/* Horizontal Wrapping Tag Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {models.map((model) => (
          <div key={model.id} className="flex items-center gap-1.5 bg-[#09090b] px-3 py-1.5 rounded-lg border border-[#27272a] text-xs select-none">
            <span className="text-neutral-300 font-semibold">{model.name}</span>
            <span className="text-[10px] text-neutral-500 font-mono">({model.value})</span>
            <button
              onClick={() => handleDeleteClick(model.id, model.name)}
              className="text-neutral-500 hover:text-red-400 transition-colors ml-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteModelId !== null} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteModelId(null); }}>
        <AlertDialogContent className="bg-[#18181b] border border-[#27272a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Target Model</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete the model &quot;{deleteModelName}&quot;? This will remove it from the available options in the generators.
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
