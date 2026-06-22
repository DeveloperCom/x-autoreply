'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
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

interface Tone {
  id: string;
  name: string;
  description: string;
  goal: string;
}

interface GoalTextProps {
  goal: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function GoalText({ goal, isExpanded, onToggle }: GoalTextProps) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (isExpanded) return;

    const el = textRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });
    resizeObserver.observe(el);

    // Initial check via requestAnimationFrame to ensure layout is complete
    const frameId = requestAnimationFrame(checkOverflow);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [goal, isExpanded]);

  return (
    <div className="space-y-1">
      <p
        ref={textRef}
        onClick={isOverflowing ? onToggle : undefined}
        className={`text-xs md:text-sm text-neutral-400 leading-normal font-sans transition-colors duration-150 ${
          isOverflowing ? 'cursor-pointer hover:text-neutral-300' : ''
        } ${isExpanded ? '' : 'line-clamp-1'}`}
      >
        <span className="font-semibold text-neutral-500 uppercase text-[9px] mr-1 select-none">Goal:</span>
        {goal}
      </p>
      {isOverflowing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-semibold focus:outline-none block select-none cursor-pointer"
        >
          {isExpanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  );
}

interface TonesConfigProps {
  tones: Tone[];
  onRefresh: () => void;
}

export default function TonesConfig({ tones, onRefresh }: TonesConfigProps) {
  // Add tone states
  const [showAddTone, setShowAddTone] = useState(false);
  const [newToneName, setNewToneName] = useState('');
  const [newToneDesc, setNewToneDesc] = useState('');
  const [newToneGoal, setNewToneGoal] = useState('');
  const [addingTone, setAddingTone] = useState(false);

  // Edit tone states
  const [editingToneId, setEditingToneId] = useState<string | null>(null);
  const [editToneName, setEditToneName] = useState('');
  const [editToneDesc, setEditToneDesc] = useState('');
  const [editToneGoal, setEditToneGoal] = useState('');
  const [savingTone, setSavingTone] = useState(false);
  const [expandedTones, setExpandedTones] = useState<Record<string, boolean>>({});

  // Delete states
  const [deleteToneId, setDeleteToneId] = useState<string | null>(null);
  const [deleteToneName, setDeleteToneName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleToneExpand = (id: string) => {
    setExpandedTones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddTone = async () => {
    if (!newToneName.trim() || !newToneGoal.trim()) return;
    setAddingTone(true);
    try {
      const res = await fetch('/api/tones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newToneName.trim(),
          description: newToneDesc.trim(),
          goal: newToneGoal.trim(),
        }),
      });
      if (res.ok) {
        setNewToneName('');
        setNewToneDesc('');
        setNewToneGoal('');
        setShowAddTone(false);
        onRefresh();
        toast.success('Style created successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add tone');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to add tone');
    } finally {
      setAddingTone(false);
    }
  };

  const handleStartEditTone = (tone: Tone) => {
    setEditingToneId(tone.id);
    setEditToneName(tone.name);
    setEditToneDesc(tone.description);
    setEditToneGoal(tone.goal);
  };

  const handleSaveEditTone = async (id: string) => {
    if (!editToneName.trim() || !editToneGoal.trim()) return;
    setSavingTone(true);
    try {
      const res = await fetch('/api/tones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editToneName.trim(),
          description: editToneDesc.trim(),
          goal: editToneGoal.trim(),
        }),
      });
      if (res.ok) {
        setEditingToneId(null);
        onRefresh();
        toast.success('Style updated successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update tone');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update tone');
    } finally {
      setSavingTone(false);
    }
  };

  const handleDeleteToneClick = (id: string, name: string) => {
    setDeleteToneId(id);
    setDeleteToneName(name);
  };

  const executeDeleteTone = async () => {
    if (!deleteToneId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/tones?id=${deleteToneId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onRefresh();
        toast.success('Style deleted successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete reply style');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete reply style');
    } finally {
      setIsDeleting(false);
      setDeleteToneId(null);
    }
  };

  return (
    <div className="bg-[#18181b]/30 border border-[#27272a]/40 rounded-xl p-4.5 space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-[#27272a]/30">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Reply Tones / Styles</h4>
          <p className="text-xs text-neutral-400 mt-1">Configure parameters used to direct reply generation.</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddTone(!showAddTone)}
          className="h-8 text-xs px-3 border-[#27272a]"
        >
          {showAddTone ? 'Close' : 'New Style'}
        </Button>
      </div>

      {/* Collapsible Add Tone Form */}
      {showAddTone && (
        <div className="bg-[#09090b] p-4 rounded-xl border border-[#27272a] space-y-3.5 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-300">Style Name</Label>
              <Input
                placeholder="e.g. Sarcastic"
                value={newToneName}
                onChange={(e) => setNewToneName(e.target.value)}
                className="bg-[#18181b] border-[#27272a] h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-neutral-300">Description</Label>
              <Input
                placeholder="e.g. Sarcastic Dev tone"
                value={newToneDesc}
                onChange={(e) => setNewToneDesc(e.target.value)}
                className="bg-[#18181b] border-[#27272a] h-9 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-neutral-300">AI Goal instructions</Label>
            <Textarea
              placeholder="e.g. Be highly sarcastic and make jokes about javascript dependencies."
              value={newToneGoal}
              onChange={(e) => setNewToneGoal(e.target.value)}
              className="bg-[#18181b] border-[#27272a] min-h-[60px] text-sm"
            />
          </div>
          <Button
            size="sm"
            onClick={handleAddTone}
            disabled={addingTone || !newToneName.trim() || !newToneGoal.trim()}
            className="w-full h-9 text-sm"
          >
            {addingTone ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Create Style
          </Button>
        </div>
      )}

      {/* Tones List */}
      <div className="space-y-2.5">
        {tones.map((tone) => {
          const isEditing = editingToneId === tone.id;
          return (
            <div key={tone.id} className="border border-[#27272a]/60 bg-[#09090b] rounded-lg p-3 space-y-2">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-neutral-300">Name</Label>
                      <Input
                        value={editToneName}
                        onChange={(e) => setEditToneName(e.target.value)}
                        className="bg-[#18181b] border-[#27272a] h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-neutral-300">Description</Label>
                      <Input
                        value={editToneDesc}
                        onChange={(e) => setEditToneDesc(e.target.value)}
                        className="bg-[#18181b] border-[#27272a] h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-neutral-300">Goal</Label>
                    <Textarea
                      value={editToneGoal}
                      onChange={(e) => setEditToneGoal(e.target.value)}
                      className="bg-[#18181b] border-[#27272a] text-sm min-h-[60px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]/40">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingToneId(null)}
                      className="h-8 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEditTone(tone.id)}
                      disabled={savingTone || !editToneName.trim() || !editToneGoal.trim()}
                      className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3"
                    >
                      {savingTone ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-between items-start">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{tone.name}</span>
                      {tone.description && (
                        <span className="text-[10px] text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-[#27272a]">
                          {tone.description}
                        </span>
                      )}
                    </div>
                    <GoalText
                      goal={tone.goal}
                      isExpanded={!!expandedTones[tone.id]}
                      onToggle={() => toggleToneExpand(tone.id)}
                    />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEditTone(tone)}
                      className="text-neutral-500 hover:text-blue-400 hover:bg-neutral-800/40 h-8 w-8 rounded-lg"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteToneClick(tone.id, tone.name)}
                      className="text-neutral-500 hover:text-red-400 hover:bg-red-950/20 h-8 w-8 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={deleteToneId !== null} onOpenChange={(open) => { if (!open && !isDeleting) setDeleteToneId(null); }}>
        <AlertDialogContent className="bg-[#18181b] border border-[#27272a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Reply Style</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete the reply tone style &quot;{deleteToneName}&quot;? This cannot be undone.
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
              onClick={executeDeleteTone}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
