'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    const res = await fetch('/api/passkey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passkey })
    });

    if (res.ok) {
      router.replace('/');
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
    setLoading(false)
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">🔐 Enter Access Key</h1>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
          placeholder="Your passkey"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm"
        >
          {loading ? '...' : 'Submit'}
        </button>
      </div>
    </main>
  );
}
