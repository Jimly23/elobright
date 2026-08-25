"use client";

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { authService } from '@/src/api/auth';

type ApiError = { response?: { data?: { error?: string; message?: string } } };

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token || expired) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><AlertTriangle size={30} /></div>
        <h1 className="text-3xl font-bold text-slate-900">Tautan tidak valid</h1>
        <p className="mt-3 leading-7 text-slate-500">Tautan reset password tidak valid, sudah digunakan, atau telah kedaluwarsa.</p>
        <Link href="/forgot-password" className="mt-8 inline-flex rounded-xl bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600">Minta tautan baru</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600"><CheckCircle2 size={32} /></div>
        <h1 className="text-3xl font-bold text-slate-900">Password berhasil diubah</h1>
        <p className="mt-3 text-slate-500">Anda akan diarahkan ke halaman login dalam beberapa detik.</p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password baru minimal terdiri dari 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sama dengan password baru.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, new_password: newPassword, confirm_password: confirmPassword });
      setSuccess(true);
      window.setTimeout(() => router.replace('/signin'), 2_000);
    } catch (requestError: unknown) {
      const apiError = requestError as ApiError;
      const message = apiError.response?.data?.error || apiError.response?.data?.message || 'Gagal mengubah password. Silakan coba kembali.';
      if (message.toLowerCase().includes('invalid or expired reset token')) setExpired(true);
      else setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><LockKeyhole size={27} /></div>
      <h1 className="text-3xl font-bold text-slate-900">Buat password baru</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">Gunakan minimal 6 karakter dan pastikan kedua password sama.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">{error}</div>}
        {[
          { id: 'new-password', label: 'Password baru', value: newPassword, setter: setNewPassword },
          { id: 'confirm-password', label: 'Konfirmasi password', value: confirmPassword, setter: setConfirmPassword },
        ].map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</label>
            <div className="relative">
              <input id={field.id} type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete="new-password" value={field.value} onChange={(event) => field.setter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 pr-12 text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
              <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:from-blue-500 hover:to-blue-600 disabled:opacity-60">
          {loading && <Loader2 size={18} className="animate-spin" />}{loading ? 'Menyimpan...' : 'Simpan password baru'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>}><ResetPasswordContent /></Suspense>;
}
