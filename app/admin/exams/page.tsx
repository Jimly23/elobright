"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Pencil, Trash2, X, AlertTriangle, Loader2, CheckCircle2, Search, ListFilter } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Cookies from 'js-cookie';
import { exam } from '@/src/api/exam';

interface Exam {
  id: string;
  title: string;
  type: string;
  isOnce?: boolean;
  durationMinutes?: number;
  passingScore?: number;
  status?: string;
  category?: string;
  totalSections?: number;
  totalQuestions?: number;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Data - only fields that exist in the DB schema
  const initialFormState = {
    title: '',
    type: '',
    isOnce: false,
  };
  const [formData, setFormData] = useState(initialFormState);

  const token = Cookies.get('token');

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await exam.getAllExams(token);
      let examList: Exam[] = [];
      if (res && res.data) {
        examList = res.data;
      } else if (Array.isArray(res)) {
        examList = res;
      }

      // Fetch detail for each exam to get any extra fields
      const detailedExams = await Promise.all(
        examList.map(async (e: Exam) => {
          try {
            const detail = await exam.getExamById(e.id, token);
            return { ...e, ...detail };
          } catch {
            return e;
          }
        })
      );
      setExams(detailedExams);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load exams.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (examData: Exam) => {
    setIsEditing(true);
    setEditingId(examData.id);
    setFormData({
      title: examData.title || '',
      type: examData.type || '',
      isOnce: examData.isOnce || false,
    });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        title: formData.title || null,
        type: formData.type || null,
        isOnce: formData.isOnce,
      };

      if (isEditing && editingId) {
        await exam.updateExam(editingId, payload, token);
        setSuccessMsg('Exam updated successfully.');
      } else {
        await exam.createExam(payload, token);
        setSuccessMsg('Exam created successfully.');
      }
      closeModal();
      fetchExams();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save exam.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await exam.deleteExam(id, token);
      setSuccessMsg('Exam deleted successfully.');
      fetchExams();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete exam.');
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(e => 
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <FileText size={22} className="text-blue-600" />
            </div>
            Kelola Ujian
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Buat, edit, dan kelola semua paket ujian.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          Buat Ujian Baru
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ujian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm text-slate-900 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Exam List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-blue-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Memuat ujian...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Ujian Tidak Ditemukan</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              {searchQuery ? 'Tidak ada ujian yang cocok dengan pencarian Anda.' : 'Mulai dengan membuat paket ujian pertama Anda.'}
            </p>
            {!searchQuery && (
              <Button variant="ghost" onClick={openCreateModal} className="text-blue-600 font-bold">
                + Buat Ujian
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Judul</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Pengaturan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{e.title || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg uppercase tracking-wider">
                        {e.type || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {e.isOnce ? (
                          <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-md">
                            Satu percobaan
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-md">
                            Banyak percobaan
                          </span>
                        )}
                        {e.durationMinutes && (
                          <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md">
                            {e.durationMinutes} min
                          </span>
                        )}
                        {e.passingScore !== undefined && e.passingScore !== null && (
                          <span className="inline-flex px-2 py-0.5 bg-purple-50 text-purple-600 text-[11px] font-bold rounded-md">
                            Lulus: {e.passingScore}
                          </span>
                        )}
                        {e.status && (
                          <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-md capitalize ${
                            e.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {e.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Link href={`/admin/exams/${e.id}/sections`}>
                            <ListFilter size={18} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(e)}
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(e.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Edit Ujian' : 'Buat Ujian Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Isi detail ujian di bawah ini.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Ujian</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. TOEFL iBT Practice Test"
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tipe</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g. TOEFL, IELTS, CERTIFICATION"
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    name="isOnce"
                    checked={formData.isOnce}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-700">Hanya satu kali percobaan</span>
                </label>
                <p className="text-xs text-slate-400 mt-1 ml-7">Jika dicentang, pengguna hanya dapat mengikuti ujian ini satu kali.</p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {formLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                  ) : isEditing ? 'Simpan Perubahan' : 'Buat Ujian'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
