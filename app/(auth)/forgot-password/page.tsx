"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { authService } from '@/src/api/auth';

type ApiError = { response?: { data?: { error?: string; message?: string } } };

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (requestError: unknown) {
      const apiError = requestError as ApiError;
      setError(apiError.response?.data?.error || apiError.response?.data?.message || 'Gagal mengirim tautan reset. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Periksa email Anda</h1>
        <p className="mt-3 leading-7 text-slate-500">
          Jika akun dengan email tersebut tersedia, kami telah mengirimkan tautan untuk mengatur ulang password. Tautan berlaku selama 60 menit.
        </p>
        <Link href="/signin" className="mt-8 inline-flex items-center gap-2 font-bold text-blue-500 hover:text-blue-600">
          <ArrowLeft size={17} /> Kembali ke login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Link href="/signin" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
        <ArrowLeft size={17} /> Kembali ke login
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">Lupa password?</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Masukkan email akun Anda. Kami akan mengirimkan tautan untuk membuat password baru.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>}
        <div>
          <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <div className="relative">
            <Mail size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 py-4 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-500 hover:to-blue-600 disabled:opacity-60">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Mengirim...' : 'Kirim tautan reset'}
        </button>
      </form>
    </div>
  );
}
