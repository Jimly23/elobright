"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ListChecks, Plus, Pencil, Trash2, X, Save, AlertTriangle, Loader2, CheckCircle2, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { exam } from '@/src/api/exam';

interface Option {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface QuestionData {
  id: string;
  questionText?: string;
  text?: string;
  type: string;
}

export default function AdminOptionsPage() {
  const params = useParams();
  const examId = params.examId as string;
  const sectionId = params.sectionId as string;
  const questionId = params.questionId as string;

  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [text, setText] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const token = Cookies.get('token');

  const fetchData = useCallback(async () => {
    if (!questionId) return;
    try {
      setLoading(true);
      setError('');

      const [questionRes, optionsRes] = await Promise.all([
        exam.getQuestionById(questionId, token),
        exam.getOptionsByQuestionId(questionId, token)
      ]);

      setQuestionData(questionRes);

      if (optionsRes && optionsRes.data) {
        setOptions(optionsRes.data);
      } else if (Array.isArray(optionsRes)) {
        setOptions(optionsRes);
      } else {
        setOptions([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load options.');
    } finally {
      setLoading(false);
    }
  }, [questionId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setText('');
    setIsCorrect(false);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (opt: Option) => {
    setIsEditing(true);
    setEditingId(opt.id);
    setText(opt.optionText || '');
    setIsCorrect(opt.isCorrect || false);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isEditing && editingId) {
        await exam.updateOption(editingId, { optionText: text, isCorrect }, token);
        setSuccessMsg('Option updated successfully.');
      } else {
        const order = options.length;
        await exam.createOption({ questionId, optionText: text, isCorrect, order }, token);
        setSuccessMsg('Option created successfully.');
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save option.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this option?')) {
      return;
    }
    try {
      setLoading(true);
      await exam.deleteOption(id, token);
      setSuccessMsg('Option deleted successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete option.');
      setLoading(false);
    }
  };

  // Sort by order safely
  const sortedOptions = [...options].sort((a, b) => {
    const oA = a.order ?? 0;
    const oB = b.order ?? 0;
    return oA - oB;
  });

  const questionDisplayText = questionData?.questionText || questionData?.text || 'Loading...';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href={`/admin/exams/${examId}/sections/${sectionId}/questions`} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-amber-600 mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Questions
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <ListChecks size={22} className="text-amber-600" />
            </div>
            Manage Options
          </h1>
          <p className="text-slate-500 mt-1 text-sm max-w-2xl truncate">
            {questionData ? `Options for: ${questionDisplayText}` : 'Loading question info...'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          Add Option
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

      {/* Options List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-amber-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading options...</p>
          </div>
        ) : sortedOptions.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <ListChecks size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Options Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              This question doesn't have any answer options yet.
            </p>
            <button onClick={openCreateModal} className="text-amber-600 font-bold hover:underline">
              + Add First Option
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-20 text-center">Order</th>
                  <th className="px-6 py-4 min-w-[300px]">Option Text</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedOptions.map((opt, index) => (
                  <tr key={opt.id} className={`transition-colors ${opt.isCorrect ? 'bg-green-50/30 hover:bg-green-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-700">{(opt.order !== undefined && opt.order !== null ? opt.order : index) + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${opt.isCorrect ? 'text-green-900' : 'text-slate-900'}`}>{opt.optionText}</p>
                    </td>
                    <td className="px-6 py-4">
                      {opt.isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-lg uppercase tracking-wider">
                          <CheckCircle2 size={14} /> Correct Answer
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-lg uppercase tracking-wider">
                          Distractor
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(opt)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Option"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(opt.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Option"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Edit Option' : 'Add New Option'}
                </h3>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Option Text <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Technology is harmful to society"
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isCorrect}
                    onChange={(e) => setIsCorrect(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-700">Mark as Correct Answer</span>
                    <span className="block text-xs text-slate-500 mt-0.5">Check this box if this is the correct answer for the question.</span>
                  </div>
                </label>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isEditing ? 'Save Changes' : 'Create Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
