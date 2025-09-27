'use client';

import { useState } from 'react';
import { MODEL } from '@/config/model';
import { useRouter } from 'next/navigation';

type Reply = {
  type: string;
  text: string;
};

export default function Home() {
  const router=useRouter()

  const [tweet, setTweet] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [model, setModel] = useState<typeof MODEL[number]>(MODEL[0]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setReplies([]);
    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: tweet,
          model,
          contextReplyExample: examples.filter(e => e.trim().length > 0),
        }),
      });

      const data = await res.json();

      // Expecting { replys: [ { type, text }, ... ] }
      if (data.replys && Array.isArray(data.replys)) {
        setReplies(data.replys);
      } else {
        setReplies([{ type: 'error', text: 'No valid replies returned.' }]);
      }
    } catch (e) {
      setReplies([{ type: 'error', text: 'Error while generating reply.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLogout = async() => {
    try {
      await fetch('/api/logout',{method:'POST'})
      router.replace('/passkey')
    }
    catch {
      alert('Unable to Logout')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6 md:px-10 md:py-10">
      <div className="max-w-2xl mx-auto">
        <div className='flex justify-around items-center mb-6'>
          <h1 className="sm:text-2xl  font-semibold text-center">💬 AI Reply Generator</h1>
          <button className='bg-blue-500 px-3 py-1 rounded text-[15px]' onClick={handleLogout}>Logout</button>
        </div>


        {/* Model Selector */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Select Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value as typeof MODEL[number])}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
          >
            {MODEL.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Tweet Content */}
        <label className="block text-sm mb-1">Tweet Content</label>
        <textarea
          className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm mb-4 resize-none"
          rows={4}
          value={tweet}
          onChange={e => setTweet(e.target.value)}
          placeholder="Paste tweet text here"
        />

        {/* Context Examples */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Context Reply Examples (optional)</label>
          {examples.map((ex, idx) => (
            <input
              key={idx}
              className="w-full mb-2 bg-zinc-900 border border-zinc-700 rounded p-2 text-sm"
              value={ex}
              onChange={e => {
                const updated = [...examples];
                updated[idx] = e.target.value;
                setExamples(updated);
              }}
              placeholder={`Example ${idx + 1}`}
            />
          ))}
          <button
            className="text-xs text-blue-400 underline"
            onClick={() => setExamples([...examples, ''])}
          >
            + Add another
          </button>
        </div>

        {/* Submit */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm mb-6 disabled:opacity-50"
          disabled={loading || tweet.trim().length === 0}
          onClick={handleSubmit}
        >
          {loading ? 'Generating reply...' : 'Generate Reply'}
        </button>

        {/* AI Replies Output */}
        {replies.length > 0 && (
          <div className="bg-zinc-800 border border-zinc-700 p-4 rounded space-y-4">
            <label className="block text-sm font-medium mb-2">AI-Generated Replies:</label>
            {replies.map((r, i) => (
              <div key={i} className="relative bg-zinc-900 p-3 rounded border border-zinc-700">
                <div className="text-xs text-zinc-400 mb-1">{r.type}</div>
                <p className="text-sm whitespace-pre-wrap">{r.text}</p>
                <button
                  className="absolute top-3 right-3 text-xs text-blue-400 hover:underline"
                  onClick={() => handleCopy(r.text, i)}
                >
                  {copiedIndex === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
