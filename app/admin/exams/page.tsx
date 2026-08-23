"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Plus, Pencil, Trash2, X, Save, AlertTriangle, Loader2, CheckCircle2, Search, Layers, ListFilter } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Cookies from 'js-cookie';
import { exam } from '@/src/api/exam';

interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  durationMinutes: number;
  passingScore: number;
  totalSections: number;
  totalQuestions: number;
  createdAt: string;
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

  // Form Data
  const initialFormState = {
    title: '',
    description: '',
    category: '',
    status: 'draft',
    durationMinutes: 90,
    passingScore: 60,
  };
  const [formData, setFormData] = useState(initialFormState);

  const token = Cookies.get('token');

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await exam.getAllExams(token);
      // Backend returns { data: [...], total: ... }
      if (res && res.data) {
        setExams(res.data);
      } else if (Array.isArray(res)) {
        setExams(res);
      } else {
        setExams([]);
      }
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
      description: examData.description || '',
      category: examData.category || '',
      status: examData.status || 'draft',
      durationMinutes: examData.durationMinutes || 90,
      passingScore: examData.passingScore || 60,
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
        await exam.updateExam(editingId, formData, token);
        setSuccessMsg('Exam updated successfully.');
      } else {
        await exam.createExam(formData, token);
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
    e.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
            Manage Exams
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Create, edit, and manage all examination packages.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          Create New Exam
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
            placeholder="Search exams..."
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
            <p className="text-slate-400 text-sm font-medium">Loading exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Exams Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              {searchQuery ? 'No exams matched your search query.' : 'Get started by creating your first exam package.'}
            </p>
            {!searchQuery && (
              <Button variant="ghost" onClick={openCreateModal} className="text-blue-600 font-bold">
                + Create Exam
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Settings</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{e.title}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">{e.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg uppercase tracking-wider">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        <span>Duration: <span className="font-bold">{e.durationMinutes}m</span></span>
                        <span>Pass Score: <span className="font-bold">{e.passingScore}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 font-bold text-xs rounded-lg uppercase tracking-wider ${
                        e.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {e.status}
                      </span>
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
                  {isEditing ? 'Edit Exam' : 'Create New Exam'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in the exam details below.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Exam Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. TOEFL iBT Practice Test"
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the exam..."
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. TOEFL, IELTS"
                    className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Status <span className="text-red-500">*</span></label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Duration (Minutes) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    min="1"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Passing Score <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="passingScore"
                    required
                    min="0"
                    value={formData.passingScore}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <Button
                  type="button"
                  onClick={closeModal}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {formLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : isEditing ? 'Save Changes' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
