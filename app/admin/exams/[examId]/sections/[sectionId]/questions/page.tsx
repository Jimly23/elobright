"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageSquare, Plus, Pencil, Trash2, X, Save, AlertTriangle, Loader2, CheckCircle2, ArrowUp, ArrowDown, ArrowLeft, Image as ImageIcon, Volume2, ListChecks } from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { exam } from '@/src/api/exam';

interface Question {
  id: string;
  sectionId: string;
  type: string;
  questionText: string;
  order: number;
  points: number;
  imageUrl?: string | null;
  audioUrl?: string | null;
}

interface SectionData {
  id: string;
  title: string;
  type: string;
}

export default function AdminQuestionsPage() {
  const params = useParams();
  const examId = params.examId as string;
  const sectionId = params.sectionId as string;

  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
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
  const [type, setType] = useState('mcq');
  const [points, setPoints] = useState(5);
  
  // File State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeAudio, setRemoveAudio] = useState(false);
  
  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const token = Cookies.get('token');

  const fetchData = useCallback(async () => {
    if (!sectionId) return;
    try {
      setLoading(true);
      setError('');
      
      const [sectionRes, questionsRes] = await Promise.all([
        exam.getSectionById(sectionId, token),
        exam.getQuestionsBySectionId(sectionId, token)
      ]);

      setSectionData(sectionRes);
      
      if (questionsRes && questionsRes.data) {
        setQuestions(questionsRes.data);
      } else if (Array.isArray(questionsRes)) {
        setQuestions(questionsRes);
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }, [sectionId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setText('');
    setType(sectionData?.type || 'mcq');
    setPoints(5);
    setImageFile(null);
    setAudioFile(null);
    setRemoveImage(false);
    setRemoveAudio(false);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setIsEditing(true);
    setEditingId(q.id);
    setText(q.questionText || '');
    setType(q.type || sectionData?.type || 'mcq');
    setPoints(q.points || 5);
    setImageFile(null);
    setAudioFile(null);
    setRemoveImage(false);
    setRemoveAudio(false);
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setRemoveImage(false);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setRemoveAudio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const fd = new FormData();
      fd.append('questionText', text);
      fd.append('points', String(points));
      
      if (imageFile) {
        fd.append('imageFile', imageFile);
      }
      
      if (type === 'speaking' && audioFile) {
        fd.append('audioFile', audioFile);
      }

      if (isEditing && editingId) {
        if (removeImage) fd.append('removeImage', 'true');
        if (removeAudio) fd.append('removeAudio', 'true');
        fd.append('type', type);
        
        await exam.updateQuestion(editingId, fd, token);
        setSuccessMsg('Question updated successfully.');
      } else {
        fd.append('sectionId', sectionId);
        fd.append('type', type);
        fd.append('order', String(questions.length)); // Append to bottom
        
        await exam.createQuestion(fd, token);
        setSuccessMsg('Question created successfully.');
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save question.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }
    try {
      setLoading(true);
      await exam.deleteQuestion(id, token);
      setSuccessMsg('Question deleted successfully.');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete question.');
      setLoading(false);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      setLoading(true);
      await exam.reorderQuestion(id, direction, token);
      setSuccessMsg(`Question moved ${direction} successfully.`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to reorder question.');
      setLoading(false);
    }
  };

  // Sort by order safely
  const sortedQuestions = [...questions].sort((a, b) => {
    const oA = a.order ?? 0;
    const oB = b.order ?? 0;
    return oA - oB;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href={`/admin/exams/${examId}/sections`} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 mb-2 transition-colors">
            <ArrowLeft size={16} /> Back to Sections
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <MessageSquare size={22} className="text-emerald-600" />
            </div>
            Manage Questions
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {sectionData ? `Questions for section: ${sectionData.title}` : 'Loading section info...'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <Plus size={18} />
          Add Question
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

      {/* Questions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-emerald-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading questions...</p>
          </div>
        ) : sortedQuestions.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No Questions Found</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              This section doesn't have any questions yet.
            </p>
            <button onClick={openCreateModal} className="text-emerald-600 font-bold hover:underline">
              + Add First Question
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-20 text-center">No.</th>
                  <th className="px-6 py-4 min-w-[300px]">Question Text</th>
                  <th className="px-6 py-4">Media</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedQuestions.map((q, index) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleReorder(q.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <span className="font-bold text-slate-700">{(q.order !== undefined && q.order !== null ? q.order : index) + 1}</span>
                        <button
                          onClick={() => handleReorder(q.id, 'down')}
                          disabled={index === sortedQuestions.length - 1}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 whitespace-pre-wrap">{q.questionText || ""}</p>
                      <div className="mt-2 inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                        {q.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {q.imageUrl && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                            <ImageIcon size={14} /> Image
                          </div>
                        )}
                        {q.audioUrl && (
                          <div className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                            <Volume2 size={14} /> Audio
                          </div>
                        )}
                        {!q.imageUrl && !q.audioUrl && (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{q.points}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/exams/${examId}/sections/${sectionId}/questions/${q.id}/options`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-all border border-amber-200"
                          title="Manage Options"
                        >
                          Manage Options
                        </Link>
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Question"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Question"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isEditing ? 'Edit Question' : 'Add New Question'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Section: {sectionData?.title}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Question Type <span className="text-red-500">*</span></label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all bg-white"
                >
                  <option value="mcq">MCQ (Multiple Choice)</option>
                  <option value="speaking">Speaking</option>
                  <option value="essay">Essay / Writing</option>
                  <option value="listening">Listening</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Ensure this matches the section's intended format.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Question Text <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Points <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full sm:w-48 px-4 py-2.5 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                />
              </div>

              {/* File Uploads */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Media Attachments</h4>
                
                {/* Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon size={14} /> Image File (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                  />
                  {isEditing && !imageFile && (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={removeImage}
                          onChange={(e) => setRemoveImage(e.target.checked)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="font-medium text-red-600">Remove existing image from server</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Audio */}
                {type === 'speaking' && (
                  <div className="pt-4 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
                      <Volume2 size={14} /> Audio File
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      ref={audioInputRef}
                      onChange={handleAudioChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all cursor-pointer"
                    />
                    {isEditing && !audioFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={removeAudio}
                            onChange={(e) => setRemoveAudio(e.target.checked)}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="font-medium text-red-600">Remove existing audio from server</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl transition-all"
                >
                  {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isEditing ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
