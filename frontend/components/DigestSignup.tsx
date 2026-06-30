'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DigestSignup() {
  const [email, setEmail] = useState('');
  const [geography, setGeography] = useState('GLOBAL');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await api.subscribeToDigest(email.trim(), geography);
      setStatus('success');
      setMessage(res.message || 'Subscribed successfully!');
      setEmail('');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
          Get a clean summary of news, cohorts, and jobs from your preferred region delivered every Sunday. No spam.
        </p>
      </div>

      <div className="w-full md:max-w-md space-y-2">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50 text-sm h-9 flex-grow"
          />
          <div className="w-full sm:w-36 shrink-0">
            <Select value={geography} onValueChange={(val: string | null) => setGeography(val || 'GLOBAL')} disabled={status === 'loading'}>
              <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-205 dark:border-zinc-850 text-xs h-9 w-full">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850">
                <SelectItem value="GLOBAL">Global</SelectItem>
                <SelectItem value="INDIA">India</SelectItem>
                <SelectItem value="US">US / Americas</SelectItem>
                <SelectItem value="EU">Europe</SelectItem>
                <SelectItem value="SEA">Southeast Asia</SelectItem>
                <SelectItem value="LATAM">Latin America</SelectItem>
                <SelectItem value="AFRICA">Africa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={status === 'loading'}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold h-9 shrink-0 px-4 cursor-pointer w-full sm:w-auto"
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
