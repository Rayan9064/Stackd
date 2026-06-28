'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DigestSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await api.subscribeToDigest(email.trim());
      setStatus('success');
      setMessage(res.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-1 md:max-w-md">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Mail className="text-zinc-400" size={18} />
          Weekly Startup Digest
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Get a clean summary of Indian startup news, cohorts, and jobs delivered every Sunday morning. No spam.
        </p>
      </div>

      <div className="w-full md:max-w-xs space-y-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50 text-sm h-9"
          />
          <Button
            type="submit"
            disabled={status === 'loading'}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold h-9 shrink-0 px-4 cursor-pointer"
          >
            {status === 'loading' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>

        {status === 'success' && (
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>{message}</span>
          </div>
        )}
        {status === 'error' && (
          <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={13} />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
