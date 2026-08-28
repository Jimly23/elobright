"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ShieldX,
  KeyRound,
  Mail,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";
import Cookies from "js-cookie";
import Button from "@/src/components/ui/Button";
import {
  userService,
  UserWithStudent,
  GetUsersParams,
} from "@/src/api/user";

type ApiError = {
  response?: { data?: { error?: string; message?: string } };
};

const getErrorMsg = (err: unknown, fallback: string) => {
  const data = (err as ApiError)?.response?.data;
  return data?.error ?? data?.message ?? fallback;
};

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

export default function AdminUsersPage() {
  const token = Cookies.get("token");

  // --- Data state ---
  const [users, setUsers] = useState<UserWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- Pagination ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // --- Filters ---
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all"); // 'all' | 'true' | 'false'

  // --- Password modal ---
  const [passwordModal, setPasswordModal] = useState<UserWithStudent | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // --- Action loading (per-user) ---
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [resetMailingId, setResetMailingId] = useState<number | null>(null);

  // --- Fetch users ---
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: GetUsersParams = {
        page,
        limit,
      };
      if (searchQuery) params.search = searchQuery;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (verifiedFilter !== "all") params.isVerified = verifiedFilter === "true";

      const result = await userService.fetchUsers(token, params);
      setUsers(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      setError(getErrorMsg(err, "Gagal memuat data pengguna."));
    } finally {
      setLoading(false);
    }
  }, [token, page, searchQuery, startDate, endDate, verifiedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-clear success messages
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  // --- Handlers ---

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleToggleVerify = async (user: UserWithStudent) => {
    const newStatus = !user.isVerified;
    const action = newStatus ? "memverifikasi" : "membatalkan verifikasi";
    if (!window.confirm(`Yakin ingin ${action} ${user.fullName || user.email}?`)) return;

    try {
      setVerifyingId(user.id);
      setError("");
      await userService.setVerified(token, user.id, newStatus);
      setSuccess(
        `${user.fullName || user.email} berhasil ${newStatus ? "diverifikasi" : "diunverifikasi"}.`
      );
      // Update locally
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isVerified: newStatus } : u))
      );
    } catch (err) {
      setError(getErrorMsg(err, `Gagal ${action} pengguna.`));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleResetPassword = async (user: UserWithStudent) => {
    if (
      !window.confirm(
        `Kirim email reset password ke ${user.email}?`
      )
    )
      return;

    try {
      setResetMailingId(user.id);
      setError("");
      await userService.triggerResetPassword(token, user.id);
      setSuccess(`Link reset password berhasil dikirim ke ${user.email}.`);
    } catch (err) {
      setError(getErrorMsg(err, "Gagal mengirim email reset password."));
    } finally {
      setResetMailingId(null);
    }
  };

  const openPasswordModal = (user: UserWithStudent) => {
    setPasswordModal(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPw(false);
    setShowConfirmPw(false);
    setError("");
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModal) return;

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    try {
      setPasswordLoading(true);
      setError("");
      await userService.updatePassword(token, passwordModal.id, {
        newPassword,
        confirmPassword: confirmPassword || undefined,
      });
      setSuccess(
        `Password ${passwordModal.fullName || passwordModal.email} berhasil diubah.`
      );
      setPasswordModal(null);
    } catch (err) {
      setError(getErrorMsg(err, "Gagal mengubah password."));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Users size={22} className="text-blue-600" />
            </div>
            Kelola Pengguna
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola pengguna, verifikasi akun, dan atur password.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <Users size={16} className="text-slate-400" />
          {total} pengguna terdaftar
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {/* Filters */}
      <form
        onSubmit={handleFilter}
        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cari Nama / Email
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Ketik nama atau email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              <Calendar size={12} className="inline mr-1" />
              Tanggal Daftar (Dari)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              <Calendar size={12} className="inline mr-1" />
              Tanggal Daftar (Sampai)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>

          {/* Verified filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Status Verifikasi
            </label>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option value="all">Semua</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="px-5 py-2.5 text-sm">
            <Search size={16} />
            Filter
          </Button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">
              Memuat pengguna...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              Pengguna Tidak Ditemukan
            </h3>
            <p className="text-slate-400 text-sm max-w-sm">
              {searchQuery
                ? "Tidak ada pengguna yang cocok dengan pencarian Anda."
                : "Belum ada pengguna terdaftar."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">NIM</th>
                  <th className="px-6 py-4">Prodi</th>
                  <th className="px-6 py-4">No. Telepon</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Terdaftar</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Name + Email */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {user.fullName || "—"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {user.email}
                      </p>
                    </td>

                    {/* NIM */}
                    <td className="px-6 py-4 text-slate-600">
                      {user.student?.studentId || "—"}
                    </td>

                    {/* Prodi */}
                    <td className="px-6 py-4 text-slate-600">
                      {user.student?.degreeProgram || "—"}
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-slate-600">
                      {user.phoneNumber || "—"}
                    </td>

                    {/* Verified badge */}
                    <td className="px-6 py-4 text-center">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg">
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg">
                          <ShieldX size={12} />
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle verify */}
                        <button
                          onClick={() => handleToggleVerify(user)}
                          disabled={verifyingId === user.id}
                          title={
                            user.isVerified
                              ? "Batalkan verifikasi"
                              : "Verifikasi pengguna"
                          }
                          className={`p-2 rounded-lg transition-all text-xs font-bold ${
                            user.isVerified
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          } disabled:opacity-50`}
                        >
                          {verifyingId === user.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : user.isVerified ? (
                            <ShieldX size={16} />
                          ) : (
                            <ShieldCheck size={16} />
                          )}
                        </button>

                        {/* Set password */}
                        <button
                          onClick={() => openPasswordModal(user)}
                          title="Set password"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          <KeyRound size={16} />
                        </button>

                        {/* Send reset email */}
                        <button
                          onClick={() => handleResetPassword(user)}
                          disabled={resetMailingId === user.id}
                          title="Kirim link reset password"
                          className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
                        >
                          {resetMailingId === user.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Mail size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-500 font-medium">
              Halaman {page} dari {totalPages} · {total} pengguna
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Set Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col">
            {/* Modal header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Set Password
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {passwordModal.fullName || passwordModal.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPasswordModal(null)}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSetPassword} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full px-4 pr-10 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-4 pr-10 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPw ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPasswordModal(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
