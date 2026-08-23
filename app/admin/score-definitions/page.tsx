"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ListChecks, Plus, Pencil, Trash2, X, Save, AlertTriangle, Loader2 } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Cookies from 'js-cookie';
import { certificationService, CertificationAdditionalScore } from '@/src/api/certification';

export default function ScoreDefinitionsPage() {
  const [scores, setScores] = useState<CertificationAdditionalScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ scoreName: '', weight: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const token = Cookies.get('token');

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await certificationService.getAllAdditionalScores(token);
      setScores(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load score definitions.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setFormLoading(true);

    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight < 0 || weight > 1) {
      setError('Weight must be between 0 and 1.');
      setFormLoading(false);
      return;
    }

    try {
      if (editingId) {
        await certificationService.updateAdditionalScore(editingId, {
          scoreName: formData.scoreName,
          weight,
        }, token);
        setSuccessMsg('Score definition updated successfully.');
      } else {
        await certificationService.createAdditionalScore({
          scoreName: formData.scoreName,
          weight,
        }, token);
        setSuccessMsg('Score definition created successfully.');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ scoreName: '', weight: '' });
      fetchScores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save score definition.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (score: CertificationAdditionalScore) => {
    setEditingId(score.id);
    setFormData({ scoreName: score.scoreName, weight: score.weight.toString() });
    setShowForm(true);
    setError('');
    setSuccessMsg('');
  };

  const handleDelete = async (id: string) => {
    setError('');
    setSuccessMsg('');
    try {
      await certificationService.deleteAdditionalScore(id, token);
      setSuccessMsg('Score definition deleted.');
      setDeleteConfirmId(null);
      fetchScores();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete score definition.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ scoreName: '', weight: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Memuat definisi nilai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <ListChecks size={22} className="text-blue-600" />
            </div>
            Definisi Nilai
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Tentukan komponen nilai tambahan dan bobotnya untuk sertifikasi.
          </p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ scoreName: '', weight: '' }); setError(''); setSuccessMsg(''); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          Tambah Nilai
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
        <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Weight Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bobot Terpakai</p>
            <p className={`text-3xl font-black mt-1 ${totalWeight > 1 ? 'text-red-500' : 'text-slate-900'}`}>
              {totalWeight.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bobot Ujian (Otomatis)</p>
            <p className="text-3xl font-black mt-1 text-blue-600">
              {Math.max(0, 1 - totalWeight).toFixed(2)}
            </p>
          </div>
        </div>
        {totalWeight > 1 && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-500 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={14} />
            Total bobot melebihi 1.0 — bobot ujian akan dibatasi menjadi 0.
          </div>
        )}
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${totalWeight > 1 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(totalWeight * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit Definisi Nilai' : 'Definisi Nilai Baru'}
            </h3>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X size={18} />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Nilai</label>
              <input
                type="text"
                value={formData.scoreName}
                onChange={(e) => setFormData({ ...formData, scoreName: e.target.value })}
                placeholder="e.g. class_speaking_score"
                required
                className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Bobot (0–1)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.3"
                required
                className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl transition-all"
              >
                {formLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? 'Perbarui' : 'Buat'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Scores Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {scores.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <ListChecks size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Tidak Ada Definisi Nilai</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Tambahkan definisi nilai untuk mengonfigurasi komponen penilaian tambahan untuk sertifikat.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Nama Nilai</th>
                <th className="px-6 py-3.5">Bobot</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scores.map((score) => (
                <tr key={score.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{score.scoreName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                      {score.weight}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(score)}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Button>
                      {deleteConfirmId === score.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(score.id)}
                            className="px-3 py-1.5 text-xs rounded-lg"
                          >
                            Konfirmasi
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1.5 text-xs rounded-lg"
                          >
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmId(score.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
