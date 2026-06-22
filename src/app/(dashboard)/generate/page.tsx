'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Sparkles, Copy, ExternalLink, RefreshCw, Check, Info } from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  id: string;
  name: string;
};

export default function PostGenerator() {
  const [topic, setTopic] = useState('');
  
  // Dynamic selectors states
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Array<{ id: string; name: string; value: string }>>([]);
  const [category, setCategory] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const [useHistory, setUseHistory] = useState(true);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [directGen, setDirectGen] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [manualResultText, setManualResultText] = useState('');
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch posts, categories, and models in parallel
        const [postsRes, catRes, modelsRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/categories'),
          fetch('/api/models'),
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPostsCount(Array.isArray(postsData) ? postsData.length : 0);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
          if (catData.length > 0) {
            setCategory(catData[0].name);
          }
        }

        if (modelsRes.ok) {
          const modelsData = await modelsRes.json();
          setModels(modelsData);
          if (modelsData.length > 0) {
            setSelectedModel(modelsData[0].value);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

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

  const handleGeneratePost = async () => {
    if (!topic.trim() || !category || !selectedModel) return;
    setLoadingGen(true);
    setGeneratedText('');
    setGeneratedPrompt('');
    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          category,
          useHistory,
          model: selectedModel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDirectGen(data.directGen);
        setGeneratedPrompt(data.prompt);
        if (data.directGen) {
          setGeneratedText(data.text);
          setManualResultText(data.text);
        } else {
          setGeneratedText('');
          setManualResultText('');
        }
        toast.success('Prompt built successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to generate post');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate post');
    } finally {
      setLoadingGen(false);
    }
  };

  const getXIntentUrl = (text: string) => {
    return `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">AI Post Generator</h2>
        <p className="text-sm text-neutral-400">Draft high-performing X posts with context-aware writing templates.</p>
      </div>

      <Card className="bg-[#18181b] border-[#27272a] text-white">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Topic or Idea</Label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Behind the scenes building an internal analytics dashboard for Next.js, optimized database queries by 80%."
              className="bg-[#09090b] border-[#27272a] focus:border-blue-500 placeholder:text-neutral-600 h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full bg-[#09090b] border-[#27272a] h-10 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-[#27272a] text-white">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
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

          <div className="flex items-center gap-3 py-2 border-y border-[#27272a]/60">
            <input
              type="checkbox"
              id="useHistory"
              checked={useHistory}
              onChange={(e) => setUseHistory(e.target.checked)}
              className="rounded bg-[#09090b] border-[#27272a] text-blue-600 focus:ring-0 focus:ring-offset-0 h-4 w-4"
            />
            <Label htmlFor="useHistory" className="text-sm text-neutral-300 cursor-pointer select-none">
              Match writing style from history <span className="text-xs text-neutral-500">({postsCount} posts saved)</span>
            </Label>
          </div>

          <Button
            onClick={handleGeneratePost}
            disabled={loadingGen || !topic.trim() || !category || !selectedModel}
            className="w-full flex items-center justify-center gap-2"
          >
            {loadingGen ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing history & building prompt...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Build Growth Prompt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Output */}
      {generatedPrompt && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Prompt Panel */}
          <Card className="bg-[#18181b] border-[#27272a] text-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#27272a] bg-neutral-900/40">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Style-Matched Prompt for LLM Web</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generatedPrompt, 'Prompt', () => {
                  setPromptCopied(true);
                  setTimeout(() => setPromptCopied(false), 2000);
                })}
                className="flex items-center gap-1.5 text-xs"
              >
                {promptCopied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {promptCopied ? 'Copied!' : 'Copy Prompt'}
              </Button>
            </div>
            <CardContent className="p-4 bg-[#09090b]">
              <pre className="text-xs text-neutral-300 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto leading-relaxed">{generatedPrompt}</pre>
            </CardContent>
          </Card>
 
          {/* Response / Posting Panel */}
          <Card className="bg-[#18181b] border-[#27272a] text-white">
            <CardHeader className="pb-3 border-b border-[#27272a]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
                  {directGen ? 'AI Generated Draft' : 'Step 2: Paste Generated Tweet Back'}
                </CardTitle>
                {directGen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedText, 'Draft', () => {
                      setTextCopied(true);
                      setTimeout(() => setTextCopied(false), 2000);
                    })}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    {textCopied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                    {textCopied ? 'Copied!' : 'Copy Draft'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {directGen ? (
                <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {generatedText}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-400">
                    Paste the result generated by your browser&apos;s session here to trigger the safe compose redirect.
                  </p>
                  <Textarea
                    value={manualResultText}
                    onChange={(e) => setManualResultText(e.target.value)}
                    placeholder="Paste the tweet response here..."
                    className="bg-[#09090b] border-[#27272a] focus:border-blue-500 h-24 placeholder:text-neutral-600"
                  />
                </div>
              )}

              {(directGen ? generatedText : manualResultText) && (
                <Button
                  asChild
                  className="w-full flex items-center justify-center gap-2"
                >
                  <a
                    href={getXIntentUrl(directGen ? generatedText : manualResultText)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open & Post on X
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
