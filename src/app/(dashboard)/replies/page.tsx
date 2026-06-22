'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  RefreshCw,
  Check,
  Info,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

type Reply = {
  type: string;
  text: string;
};

type Tone = {
  id: string;
  name: string;
  description: string;
  goal: string;
};

export default function SmartReplies() {
  const [replyTweetContent, setReplyTweetContent] = useState('');
  const [refReplies, setRefReplies] = useState<string[]>([]);
  
  // Dynamic selectors states
  const [tones, setTones] = useState<Tone[]>([]);
  const [models, setModels] = useState<Array<{ id: string; name: string; value: string }>>([]);
  const [replyStyle, setReplyStyle] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [repliesList, setRepliesList] = useState<Reply[]>([]);
  const [replyPrompt, setReplyPrompt] = useState('');
  const [replyDirectGen, setReplyDirectGen] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [replyPromptCopied, setReplyPromptCopied] = useState(false);
  const [copiedReplyIndex, setCopiedReplyIndex] = useState<number | null>(null);

  // Load settings for selectors
  useEffect(() => {
    loadSettingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettingsData = async () => {
    try {
      // Fetch tones and models in parallel
      const [tonesRes, modelsRes] = await Promise.all([
        fetch('/api/tones'),
        fetch('/api/models'),
      ]);

      if (tonesRes.ok) {
        const tonesData = await tonesRes.json();
        setTones(tonesData);
        if (tonesData.length > 0 && !replyStyle) {
          setReplyStyle(tonesData[0].name);
        }
      }

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setModels(modelsData);
        if (modelsData.length > 0 && !selectedModel) {
          setSelectedModel(modelsData[0].value);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateReplies = async () => {
    if (!replyTweetContent.trim() || !replyStyle || !selectedModel) return;
    setLoadingReply(true);
    setRepliesList([]);
    setReplyPrompt('');
    try {
      const filteredRefReplies = refReplies.map(r => r.trim()).filter(Boolean);
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyTweetContent,
          replyStyle,
          model: selectedModel,
          ...(filteredRefReplies.length > 0 ? { contextReplyExample: filteredRefReplies } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReplyDirectGen(data.directGen);
        setReplyPrompt(data.prompt);
        if (data.directGen) {
          setRepliesList(data.replys);
        }
        toast.success('Replies generated successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to generate replies');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate replies');
    } finally {
      setLoadingReply(false);
    }
  };

  const copyToClipboard = async (text: string, label: string, callback: () => void) => {
    try {
      await navigator.clipboard.writeText(text);
      callback();
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy', err);
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const getXIntentUrl = (text: string) => {
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Smart Reply Hub</h2>
        <p className="text-sm text-neutral-400">Create scroll-stopping comments to grow authority and capture profile clicks.</p>
      </div>

      <Card className="bg-[#18181b] border-[#27272a] text-white">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Target Tweet Content</Label>
            <Textarea
              value={replyTweetContent}
              onChange={(e) => setReplyTweetContent(e.target.value)}
              placeholder="Paste the full text of the tweet you want to reply to..."
              className="bg-[#09090b] border-[#27272a] focus:border-blue-500 h-24 placeholder:text-neutral-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Reply Tone / Style</Label>
              <Select value={replyStyle} onValueChange={setReplyStyle}>
                <SelectTrigger className="w-full bg-[#09090b] border-[#27272a] h-10 text-white">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
                  {tones.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.description || t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Target Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full bg-[#09090b] border-[#27272a] h-10 text-white">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.value}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reference Replies Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Reference Replies (Optional)</Label>
                <p className="text-[11px] text-neutral-500">Provide example replies to guide the style or tone.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRefReplies([...refReplies, ''])}
                className="h-7 px-2 text-xs flex items-center gap-1 bg-[#18181b] border-[#27272a] text-neutral-300 hover:text-white hover:bg-[#27272a]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Example
              </Button>
            </div>

            {refReplies.length > 0 && (
              <div className="space-y-2">
                {refReplies.map((reply, index) => (
                  <div key={index} className="flex gap-2 items-start animate-in slide-in-from-top-1 duration-200">
                    <Textarea
                      value={reply}
                      onChange={(e) => {
                        const updated = [...refReplies];
                        updated[index] = e.target.value;
                        setRefReplies(updated);
                      }}
                      placeholder={`Example reply ${index + 1}...`}
                      className="bg-[#09090b] border-[#27272a] focus:border-blue-500 h-16 placeholder:text-neutral-600 text-sm flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setRefReplies(refReplies.filter((_, i) => i !== index))}
                      className="h-9 w-9 shrink-0 bg-[#09090b] border-[#27272a] text-neutral-400 hover:text-red-400 hover:bg-[#18181b] hover:border-red-900/50 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleGenerateReplies}
            disabled={loadingReply || !replyTweetContent.trim() || !replyStyle || !selectedModel}
            className="w-full flex items-center justify-center gap-2"
          >
            {loadingReply ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Formulating replies...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Build & Generate Replies
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Output */}
      {replyPrompt && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="bg-[#18181b] border-[#27272a] text-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#27272a] bg-neutral-900/40">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Reply Prompt for LLM</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(replyPrompt, 'Prompt', () => {
                  setReplyPromptCopied(true);
                  setTimeout(() => setReplyPromptCopied(false), 2000);
                })}
                className="flex items-center gap-1.5 text-xs"
              >
                {replyPromptCopied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {replyPromptCopied ? 'Copied!' : 'Copy Prompt'}
              </Button>
            </div>
            <CardContent className="p-4 bg-[#09090b]">
              <pre className="text-xs text-neutral-300 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto leading-relaxed">{replyPrompt}</pre>
            </CardContent>
          </Card>
 
          {/* Direct Gen Responses */}
          {replyDirectGen && repliesList.length > 0 && (
            <div className="space-y-3">
              <Label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">Generated Reply Suggestions</Label>
              <div className="space-y-3">
                {repliesList.map((rep, idx) => (
                  <Card key={idx} className="bg-[#18181b] border-[#27272a] text-white hover:border-[#3f3f46] transition-all">
                    <CardHeader className="pb-2 pt-4 px-4 border-b border-[#27272a]/60">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{rep.type}</span>
                        <div className="flex gap-3">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => copyToClipboard(rep.text, 'Reply', () => {
                              setCopiedReplyIndex(idx);
                              setTimeout(() => setCopiedReplyIndex(null), 2000);
                            })}
                            className="text-xs p-0 h-auto"
                          >
                            {copiedReplyIndex === idx ? 'Copied!' : 'Copy'}
                          </Button>
                          <a
                            href={getXIntentUrl(rep.text)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-neutral-300 hover:text-white flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            X.com
                          </a>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-200 leading-relaxed font-sans">{rep.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
