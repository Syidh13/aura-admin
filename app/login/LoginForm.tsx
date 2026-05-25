'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-only login form. Reads ?error=not_admin from the URL when the
 * proxy bounces a logged-in non-admin back here. Wrapped in Suspense by
 * the parent server component since useSearchParams() requires it under
 * Next 16's stricter prerender rules.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    initialError === 'not_admin'
      ? 'Akun ini bukan super admin. Login dengan akun super_admin.'
      : null,
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Inline validation — button is always clickable, so we tell the user
    // clearly what's missing instead of silently disabling it.
    if (!email.trim()) {
      setErrorMsg('Email belum diisi');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password belum diisi');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message ?? 'Login gagal');
      setSubmitting(false);
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-4"
    >
      {errorMsg ? (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 leading-snug">{errorMsg}</p>
        </div>
      ) : null}

      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1.5">Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@aura.id"
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 mb-1.5">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-medium transition cursor-pointer disabled:bg-purple-400 disabled:cursor-wait"
        disabled={submitting}
      >
        {submitting ? 'Memproses…' : 'Masuk'}
      </button>

      <p className="text-[11px] text-zinc-400 text-center pt-2">
        Hanya untuk akun super admin Aura.
      </p>

      {/* DEV demo box — remove sebelum prod deploy. Memo akun sementara
          biar gak lupa kredensial waktu masih iterasi. */}
      <div className="mt-2 p-3 rounded-lg bg-purple-50 border border-purple-100 space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-purple-700">
          Akun demo (dev only)
        </p>
        <p className="text-[11px] text-purple-900 font-mono">
          aurabyqlue@gmail.com
        </p>
        <p className="text-[11px] text-purple-900 font-mono">
          superadmin1234
        </p>
      </div>
    </form>
  );
}
