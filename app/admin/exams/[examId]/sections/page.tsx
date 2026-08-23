"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, Plus, Pencil, Trash2, X, Save, AlertTriangle, Loader2, CheckCircle2, ArrowUp, ArrowDown, ArrowLeft, Layers, MessageSquare } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { exam } from '@/src/api/exam';

interface ExamSection {
  id: string;
  examId: string;
  title: string;
  description: string;
  type: string;
  order: number;
  durationMinutes: number;
  totalQuestions: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminExamSectionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [examData, setExamData] = useState<any>(null);
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Data
  const initialFormState = {
    title: '',
    description: '',
    type: 'mcq',
    durationMinutes: 60,
    totalQuestions: 30,
  };
  const [formData, setFormData] = useState(initialFormState);

  const token = Cookies.get('token');

  const fetchData = useCallback(async () => {
    if (!examId) return;
    try {
      setLoading(true);
      setError('');
      
      const [examRes, sectionsRes] = await Promise.all([
        exam.getExamById(examId, token),
        exam.getSectionsByExamId(examId, token)
      ]);

      setExamData(examRes);
      
      let rawSections = [];
      if (sectionsRes && sectionsRes.data) {
        rawSections = sectionsRes.data;
      } else if (Array.isArray(sectionsRes)) {
        rawSections = sectionsRes;
      }

      // Fetch questions for each section to determine type and totalQuestions dynamically
      const augmentedSections = await Promise.all(
        rawSections.map(async (sec: any) => {
          try {
            const questionsRes = await exam.getQuestionsBySectionId(sec.id, token);
            const questions = Array.isArray(questionsRes) ? questionsRes : (questionsRes?.data || []);
            const totalQuestions = questions.length;
            // Determine type based on the first question, fallback to 'Unknown' if no questions
            const type = totalQuestions > 0 ? (questions[0].questionType || 'mcq') : 'No Questions Yet';
            return { ...sec, totalQuestions, type };
          } catch (err) {
            return { ...sec, totalQuestions: 0, type: 'Unknown' };
          }
        })
      );
      
      setSections(augmentedSections);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load sections.');
    } finally {
      setLoading(false);
    }
  }, [examId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (section: ExamSection) => {
    setIsEditing(true);
    setEditingId(section.id);
    setFormData({
      title: section.title || '',
      description: section.description || '',
      type: section.type || 'mcq',
      durationMinutes: section.durationMinutes || 60,
      totalQuestions: section.totalQuestions || 30,
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
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isEditing && editingId) {
        await exam.updateSection(editingId, formData, token);
        setSuccessMsg('Section updated successfully.');
      } else {
        const newOrder = sections.length;
        await exam.createSection({ ...formData, examId, order: newOrder }, token);
        setSuccessMsg('Section created successfully.');
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save section.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await exam.deleteSection(id, token);
      setSuccessMsg('Section deleted successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete section.');
      setLoading(false);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      setLoading(true);
      await exam.reorderSection(id, direction, token);
      setSuccessMsg(`Section moved ${direction} successfully.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to reorder section.');
      setLoading(false);
    }
  };

  // Sort sections by order, handle null/undefined orders safely
  const sortedSections = [...sections].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/exams" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-2 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Ujian
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Layers size={22} className="text-indigo-600" />
            </div>
            Kelola Bagian
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {examData ? `Mengedit bagian untuk: ${examData.title}` : 'Memuat info ujian...'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          Buat Bagian Baru
        </button>
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

      {/* Sections List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Memuat bagian...</p>
          </div>
        ) : sortedSections.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Layers size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Bagian Tidak Ditemukan</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Ujian ini belum memiliki bagian apapun.
            </p>
            <button onClick={openCreateModal} className="text-indigo-600 font-bold hover:underline">
              + Tambah Bagian Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-20 text-center">Urutan</th>
                  <th className="px-6 py-4">Detail Bagian</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Konfigurasi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSections.map((s, index) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleReorder(s.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <span className="font-bold text-slate-700">{(s.order !== undefined && s.order !== null ? s.order : index) + 1}</span>
                        <button
                          onClick={() => handleReorder(s.id, 'down')}
                          disabled={index === sortedSections.length - 1}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{s.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg uppercase tracking-wider">
                        {s.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        <span>Durasi: <span className="font-bold">{s.durationMinutes}m</span></span>
                        <span>Pertanyaan: <span className="font-bold">{s.totalQuestions}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/exams/${examId}/sections/${s.id}/questions`}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Kelola Pertanyaan"
                        >
                          <MessageSquare size={18} />
                        </Link>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Bagian"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus Bagian"
                        >
                          <Trash2 size={18} />
                        </button>
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
                  {isEditing ? 'Edit Bagian' : 'Buat Bagian Baru'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Konfigurasikan detail bagian untuk ujian ini.
                </p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Bagian <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Reading Comprehension"
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Instruksi atau detail untuk bagian ini..."
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Durasi (Menit) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    min="1"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isEditing ? 'Simpan Perubahan' : 'Buat Bagian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
