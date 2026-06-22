'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check } from 'lucide-react';

interface ProfileSettingsProps {
  xUsername: string;
  onRefresh: () => void;
}

export default function ProfileSettings({ xUsername, onRefresh }: ProfileSettingsProps) {
  const [usernameInput, setUsernameInput] = useState(xUsername);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setUsernameInput(xUsername);
  }, [xUsername]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xUsername: usernameInput }),
      });
      if (res.ok) {
        setSuccess(true);
        onRefresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const isChanged = usernameInput !== xUsername;

  return (
    <div className="bg-[#18181b]/30 border border-[#27272a]/40 rounded-xl p-4.5 space-y-4">
      <div>
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">X Account Settings</h4>
        <p className="text-xs text-neutral-400 mt-1">Configure target X username to display verification layouts correctly.</p>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3 text-neutral-500 text-sm">@</span>
            <Input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.replace('@', '').trim())}
              placeholder="username"
              className="bg-[#09090b] border-[#27272a] pl-8 focus:border-blue-500 h-10 text-sm"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !isChanged}
            className="h-10 px-4 text-sm shrink-0"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Handle'}
          </Button>
        </div>
        {success && (
          <p className="text-xs text-green-400 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Username handle updated!
          </p>
        )}
      </div>
    </div>
  );
}
