"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, Search, Mail, Download, X, Save, AlertTriangle, Loader2, CheckCircle2, ExternalLink, FileText, FileSpreadsheet, Upload } from 'lucide-react';
import Button from '@/src/components/ui/Button';
import Cookies from 'js-cookie';
import { certificationService, CertificationScore, CertificationAdditionalScore } from '@/src/api/certification';

type ImportRow = {
  rowNumber: number;
  score: CertificationScore | null;
  certificationScoreId: string;
  name: string;
  examScoreOverride: number | null;
  additionalScore: Record<string, number>;
  finalScore: number | null;
  errors: string[];
};

type ApiError = {
  response?: { data?: { message?: string } };
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    return (error as ApiError).response?.data?.message ?? fallback;
  }
  return fallback;
}

function excelCellToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if ('result' in value && value.result !== undefined) return String(value.result);
    if ('text' in value && value.text !== undefined) return String(value.text);
  }
  return String(value).trim();
}

export default function CertificationPage() {
  const [scores, setScores] = useState<CertificationScore[]>([]);
  const [additionalScoreDefs, setAdditionalScoreDefs] = useState<CertificationAdditionalScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filterNim, setFilterNim] = useState('');
  const [appliedNim, setAppliedNim] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [appliedGroup, setAppliedGroup] = useState('');
  const [filterExamTitle, setFilterExamTitle] = useState('');

  // Edit modal state
  const [editingScore, setEditingScore] = useState<CertificationScore | null>(null);
  const [editForm, setEditForm] = useState<{
    additionalScores: Record<string, string>;
    examScoreOverride: string;
    useOverride: boolean;
  }>({ additionalScores: {}, examScoreOverride: '', useOverride: false });
  const [editLoading, setEditLoading] = useState(false);

  // Excel import/export state
  const importInputRef = useRef<HTMLInputElement>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);

  // Email state
  const [emailLoading, setEmailLoading] = useState(false);
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<{ to: string; fullName: string; downloadUrl: string } | null>(null);

  const token = Cookies.get('token');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [scoresData, defsData] = await Promise.all([
        certificationService.getAllScores(token),
        certificationService.getAllAdditionalScores(token),
      ]);

      const rawScores = Array.isArray(scoresData) ? scoresData : [];
      setScores(rawScores);
      setAdditionalScoreDefs(Array.isArray(defsData) ? defsData : []);
      const examTitles = Array.from(new Set(
        rawScores.map(score => score.exam?.title).filter((title): title is string => Boolean(title)),
      ));
      setFilterExamTitle(current => examTitles.includes(current) ? current : examTitles[0] ?? '');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load certification data.'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedNim(filterNim.trim());
    setAppliedGroup(filterGroup.trim());
  };

  const handleClearFilter = () => {
    setFilterNim('');
    setAppliedNim('');
    setFilterGroup('');
    setAppliedGroup('');
  };

  const uniqueExams = Array.from(new Set(
    scores.map(score => score.exam?.title).filter((title): title is string => Boolean(title)),
  ));
  const filteredScores = filterExamTitle
      ? scores.filter((score) => {
        const matchesExam = score.exam?.title === filterExamTitle;
        const studentId = score.user?.studentId ?? score.user?.student_id ?? score.user?.nim ?? '';
        const matchesNim = !appliedNim
          || studentId.toLowerCase().includes(appliedNim.toLowerCase());
        const matchesGroup = !appliedGroup
          || (score.user?.degreeProgram ?? '').toLowerCase().includes(appliedGroup.toLowerCase());
        return matchesExam && matchesNim && matchesGroup;
      })
    : [];

  // --- Edit ---
  const openEditModal = (score: CertificationScore) => {
    const additionalScores: Record<string, string> = {};
    additionalScoreDefs.forEach(def => {
      additionalScores[def.scoreName] = score.additionalScore?.[def.scoreName]?.toString() || '';
    });

    setEditingScore(score);
    setEditForm({
      additionalScores,
      examScoreOverride: score.examScoreOverride?.toString() || '',
      useOverride: score.examScoreOverride !== null && score.examScoreOverride !== undefined,
    });
    setError('');
    setSuccessMsg('');
  };

  const calculateFinalScore = (
    examScoreValue: number | string | undefined | null,
    additionalScores: Record<string, number | string>,
  ) => {
    if (examScoreValue === null || examScoreValue === undefined || examScoreValue === '') return null;

    const examScore = Number(examScoreValue);
    if (!Number.isFinite(examScore)) return null;

    const totalAdditionalWeight = additionalScoreDefs.reduce((sum, def) => sum + Number(def.weight), 0);
    const examWeight = Math.max(0, 1 - totalAdditionalWeight);

    let finalScore = examScore * examWeight;
    additionalScoreDefs.forEach(def => {
      const value = Number(additionalScores[def.scoreName] ?? 0);
      if (Number.isFinite(value)) {
        finalScore += value * Number(def.weight);
      }
    });

    return finalScore;
  };

  const computePreviewScore = () => {
    if (!editingScore) return null;

    const examScore = editForm.useOverride
      ? editForm.examScoreOverride
      : editingScore.originalExamScore ?? editingScore.rawExamScore;

    const finalScore = calculateFinalScore(examScore, editForm.additionalScores);
    return finalScore === null ? null : finalScore.toFixed(1);
  };

  const getTableFinalScore = (score: CertificationScore) => {
    const examScore = score.examScoreOverride
      ?? score.originalExamScore
      ?? score.rawExamScore;
    const calculatedScore = calculateFinalScore(examScore, score.additionalScore ?? {});

    if (calculatedScore !== null) return calculatedScore.toFixed(1);

    const backendFinalScore = Number(score.finalScore);
    return Number.isFinite(backendFinalScore) ? backendFinalScore.toFixed(1) : null;
  };

  const getStudentId = (score: CertificationScore) => (
    score.user?.studentId
    ?? score.user?.student_id
    ?? score.user?.nim
    ?? '—'
  );

  const getSectionScore = (score: CertificationScore, aliases: string[]) => {
    const entry = Object.entries(score.sectionScores ?? {}).find(([sectionName]) => {
      const normalizedName = sectionName.toLowerCase();
      return aliases.some(alias => normalizedName.includes(alias));
    });
    return entry ? Number(entry[1]).toFixed(1) : '—';
  };

  const handleExportExcel = async () => {
    if (filteredScores.length === 0) {
      setError('Tidak ada data nilai yang dapat diekspor.');
      return;
    }

    setExcelLoading(true);
    setError('');

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Elobright Admin';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Nilai Sertifikasi', {
        views: [{ state: 'frozen', ySplit: 1 }],
      });
      const additionalHeaders = additionalScoreDefs.map(def => `nilai_tambahan:${def.scoreName}`);
      const headers = [
        'certification_score_id',
        'student_id',
        'nama',
        'email',
        'ujian',
        'nilai_asli',
        'nilai_override',
        ...additionalHeaders,
        'nilai_akhir',
      ];

      worksheet.addRow(headers);
      filteredScores.forEach((score) => {
        worksheet.addRow([
          score.id,
          getStudentId(score),
          score.user?.fullName ?? `User #${score.userId}`,
          score.user?.email ?? '',
          score.exam?.title ?? '',
          score.originalExamScore ?? score.rawExamScore ?? '',
          score.examScoreOverride ?? '',
          ...additionalScoreDefs.map(def => score.additionalScore?.[def.scoreName] ?? ''),
          getTableFinalScore(score) ?? '',
        ]);
      });

      const headerRow = worksheet.getRow(1);
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      worksheet.autoFilter = { from: 'A1', to: `${worksheet.getColumn(headers.length).letter}1` };
      worksheet.columns.forEach((column, index) => {
        column.width = index === 0 ? 38 : index >= 2 && index <= 4 ? 26 : 18;
      });
      worksheet.getColumn(1).hidden = true;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        for (let column = 7; column <= headers.length; column += 1) {
          row.getCell(column).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };
        }
      });

      const instructions = workbook.addWorksheet('Petunjuk');
      instructions.addRows([
        ['PETUNJUK IMPORT NILAI SERTIFIKASI'],
        ['1. Jangan mengubah atau menghapus kolom certification_score_id.'],
        ['2. Anda dapat mengubah nilai_akhir, nilai_override, atau kolom yang diawali nilai_tambahan:.'],
        ['3. Nilai harus berupa angka dari 0 sampai 100.'],
        ['4. Perubahan nilai_akhir akan dikonversi otomatis menjadi nilai_override.'],
        ['5. Simpan sebagai file .xlsx, lalu import melalui dashboard admin.'],
      ]);
      instructions.getColumn(1).width = 95;
      instructions.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF2563EB' } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `nilai-sertifikasi-${date}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMsg(`${filteredScores.length} data nilai berhasil diekspor.`);
    } catch {
      setError('Gagal membuat file Excel. Silakan coba kembali.');
    } finally {
      setExcelLoading(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Format file harus .xlsx.');
      return;
    }

    setExcelLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.getWorksheet('Nilai Sertifikasi') ?? workbook.worksheets[0];
      if (!worksheet || worksheet.rowCount < 2) throw new Error('EMPTY_FILE');

      const headerIndexes = new Map<string, number>();
      worksheet.getRow(1).eachCell((cell, columnNumber) => {
        headerIndexes.set(excelCellToString(cell.value).toLowerCase(), columnNumber);
      });
      const idColumn = headerIndexes.get('certification_score_id');
      if (!idColumn) throw new Error('MISSING_ID');

      const scoreMap = new Map(scores.map(score => [score.id, score]));
      const seenIds = new Set<string>();
      const parsedRows: ImportRow[] = [];

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        const certificationScoreId = excelCellToString(row.getCell(idColumn).value);
        if (!certificationScoreId) continue;

        const errors: string[] = [];
        const score = scoreMap.get(certificationScoreId) ?? null;
        if (!score) errors.push('ID nilai tidak ditemukan');
        if (seenIds.has(certificationScoreId)) errors.push('ID duplikat dalam file');
        seenIds.add(certificationScoreId);

        const overrideColumn = headerIndexes.get('nilai_override');
        const overrideText = overrideColumn ? excelCellToString(row.getCell(overrideColumn).value) : '';
        let examScoreOverride = overrideText === '' ? null : Number(overrideText);
        if (examScoreOverride !== null && (!Number.isFinite(examScoreOverride) || examScoreOverride < 0 || examScoreOverride > 100)) {
          errors.push('Nilai override harus 0–100 atau kosong');
        }

        const additionalScore: Record<string, number> = {};
        additionalScoreDefs.forEach((def) => {
          const column = headerIndexes.get(`nilai_tambahan:${def.scoreName}`.toLowerCase());
          const textValue = column ? excelCellToString(row.getCell(column).value) : '';
          if (textValue === '') return;

          const value = Number(textValue);
          if (!Number.isFinite(value) || value < 0 || value > 100) {
            errors.push(`${def.scoreName} harus 0–100 atau kosong`);
          } else {
            additionalScore[def.scoreName] = value;
          }
        });

        const finalScoreColumn = headerIndexes.get('nilai_akhir');
        const importedFinalScoreText = finalScoreColumn
          ? excelCellToString(row.getCell(finalScoreColumn).value)
          : '';
        const importedFinalScore = importedFinalScoreText === '' ? null : Number(importedFinalScoreText);
        if (importedFinalScore !== null && (!Number.isFinite(importedFinalScore) || importedFinalScore < 0 || importedFinalScore > 100)) {
          errors.push('Nilai akhir harus 0–100 atau kosong');
        }

        const currentFinalScore = score ? Number(getTableFinalScore(score)) : null;
        const finalScoreWasChanged = importedFinalScore !== null
          && Number.isFinite(importedFinalScore)
          && currentFinalScore !== null
          && Number.isFinite(currentFinalScore)
          && Math.abs(importedFinalScore - currentFinalScore) >= 0.05;

        if (finalScoreWasChanged) {
          const totalAdditionalWeight = additionalScoreDefs.reduce((sum, def) => sum + Number(def.weight), 0);
          const examWeight = Math.max(0, 1 - totalAdditionalWeight);
          const additionalContribution = additionalScoreDefs.reduce(
            (sum, def) => sum + (additionalScore[def.scoreName] ?? 0) * Number(def.weight),
            0,
          );

          if (examWeight === 0) {
            errors.push('Nilai akhir tidak dapat diubah langsung karena bobot ujian 0');
          } else {
            const requiredOverride = (importedFinalScore - additionalContribution) / examWeight;
            if (!Number.isFinite(requiredOverride) || requiredOverride < 0 || requiredOverride > 100) {
              errors.push('Nilai akhir tidak dapat dicapai dengan bobot yang digunakan');
            } else {
              examScoreOverride = Number(requiredOverride.toFixed(4));
            }
          }
        }

        const baseExamScore = examScoreOverride
          ?? score?.originalExamScore
          ?? score?.rawExamScore;
        const finalScore = calculateFinalScore(baseExamScore, additionalScore);
        parsedRows.push({
          rowNumber,
          score,
          certificationScoreId,
          name: score?.user?.fullName ?? `Baris ${rowNumber}`,
          examScoreOverride: Number.isFinite(examScoreOverride) ? examScoreOverride : null,
          additionalScore,
          finalScore,
          errors,
        });
      }

      if (parsedRows.length === 0) throw new Error('EMPTY_FILE');
      setImportRows(parsedRows);
    } catch (importError) {
      const message = importError instanceof Error && importError.message === 'MISSING_ID'
        ? 'Kolom certification_score_id tidak ditemukan. Gunakan file hasil export dari sistem.'
        : 'File Excel tidak valid atau tidak memiliki data nilai.';
      setError(message);
    } finally {
      setExcelLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importRows) return;
    const validRows = importRows.filter(row => row.score && row.errors.length === 0);
    if (validRows.length === 0) return;

    setExcelLoading(true);
    setError('');
    let successCount = 0;
    let failureCount = 0;

    for (const row of validRows) {
      try {
        await certificationService.updateScore(row.certificationScoreId, {
          exam_score_override: row.examScoreOverride,
          additional_score: row.additionalScore,
        }, token);
        successCount += 1;
      } catch {
        failureCount += 1;
      }
    }

    setImportRows(null);
    setExcelLoading(false);
    await fetchData();

    if (failureCount > 0) {
      setError(`${successCount} data diperbarui, ${failureCount} data gagal diperbarui.`);
    } else {
      setSuccessMsg(`${successCount} data nilai berhasil diperbarui dari Excel.`);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingScore) return;
    setEditLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const additionalScore: Record<string, number> = {};
      additionalScoreDefs.forEach(def => {
        const val = editForm.additionalScores[def.scoreName];
        if (val !== '' && val !== undefined) {
          additionalScore[def.scoreName] = parseFloat(val);
        }
      });

      await certificationService.updateScore(editingScore.id, {
        additional_score: additionalScore,
        exam_score_override: editForm.useOverride && editForm.examScoreOverride
          ? parseFloat(editForm.examScoreOverride)
          : null,
      }, token);

      setSuccessMsg('Certification score updated successfully.');
      setEditingScore(null);
      fetchData();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update score.'));
    } finally {
      setEditLoading(false);
    }
  };

  // --- Email ---
  const handleSendEmail = async (score: CertificationScore) => {
    setEmailLoading(true);
    setError('');
    setSuccessMsg('');
    setEmailResult(null);

    try {
      const result = await certificationService.blastEmail({
        exam_submission_id: score.examSubmissionId,
      }, token);
      setEmailResult({ to: result.to, fullName: result.fullName, downloadUrl: result.downloadUrl });
      setSuccessMsg(`Certificate email sent to ${result.to}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to send certificate email.'));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendAllCertificates = async () => {
    if (filteredScores.length === 0) {
      setError('Tidak ada peserta pada hasil filter yang dapat dikirimi sertifikat.');
      return;
    }

    const confirmed = window.confirm(
      `Kirim sertifikat kepada ${filteredScores.length} peserta ujian "${filterExamTitle}"?`,
    );
    if (!confirmed) return;

    setBulkEmailLoading(true);
    setError('');
    setSuccessMsg('');
    setEmailResult(null);
    let successCount = 0;
    let failureCount = 0;

    for (const score of filteredScores) {
      try {
        await certificationService.blastEmail({
          exam_submission_id: score.examSubmissionId,
        }, token);
        successCount += 1;
      } catch {
        failureCount += 1;
      }
    }

    setBulkEmailLoading(false);
    if (failureCount > 0) {
      setError(`${successCount} sertifikat berhasil dikirim, ${failureCount} gagal dikirim.`);
    } else {
      setSuccessMsg(`${successCount} sertifikat berhasil dikirim kepada peserta yang terfilter.`);
    }
  };

  // --- Download ---
  const handleDownload = (id: string) => {
    const url = certificationService.getDownloadUrl(id);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Memuat nilai sertifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Award size={22} className="text-blue-600" />
            </div>
            Nilai Sertifikasi
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola nilai sertifikasi, edit nilai tambahan, dan kirim email sertifikat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => importInputRef.current?.click()}
            disabled={excelLoading}
            className="gap-2"
          >
            {excelLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Import Excel
          </Button>
          <Button
            onClick={handleExportExcel}
            disabled={excelLoading || filteredScores.length === 0}
            className="gap-2"
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </Button>
        </div>
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

      {/* Email Result */}
      {emailResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5">
          <h3 className="text-sm font-bold text-green-700 mb-3">Email Berhasil Dikirim</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ke</p>
              <p className="text-slate-900 font-medium mt-0.5">{emailResult.to}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nama</p>
              <p className="text-slate-900 font-medium mt-0.5">{emailResult.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">URL Unduhan</p>
              <a href={emailResult.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium mt-0.5 hover:underline flex items-center gap-1">
                Buka <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setEmailResult(null)} className="mt-3 text-xs text-slate-400 hover:text-slate-600">Tutup</Button>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <form onSubmit={handleFilter} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter berdasarkan NIM</label>
            <input
              type="text"
              value={filterNim}
              onChange={(e) => setFilterNim(e.target.value)}
              placeholder="Masukkan NIM..."
              className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter berdasarkan Kelompok</label>
            <input
              type="text"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              placeholder="Masukkan kelompok..."
              className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter berdasarkan Ujian</label>
            <select
              value={filterExamTitle}
              onChange={(e) => setFilterExamTitle(e.target.value)}
              className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white"
            >
              <option value="" disabled>Pilih Ujian</option>
              {uniqueExams.map(exam => (
                <option key={exam as string} value={exam as string}>{exam as string}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all"
            >
              <Search size={16} />
              Filter
            </Button>
            {(appliedNim || appliedGroup) && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleClearFilter}
                className="flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-xl transition-all"
              >
                <X size={16} />
                Bersihkan
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendAllCertificates}
              disabled={bulkEmailLoading || filteredScores.length === 0}
              className="flex items-center gap-2 px-5 py-3 font-bold text-sm rounded-xl transition-all text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              {bulkEmailLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Kirim Semua ({filteredScores.length})
            </Button>
          </div>
        </form>
      </div>

      {/* Scores Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {filteredScores.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Award size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Tidak Ada Nilai Sertifikasi</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              {(appliedNim || appliedGroup)
                ? 'Tidak ada peserta yang cocok dengan filter NIM atau kelompok.'
                : 'Nilai sertifikasi akan muncul di sini setelah pengguna menyelesaikan ujian.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Nama</th>
                  <th className="px-6 py-3.5">NIM</th>
                  <th className="px-6 py-3.5">Kelompok</th>
                  <th className="px-6 py-3.5">Ujian</th>
                  <th className="px-6 py-3.5">Listening</th>
                  <th className="px-6 py-3.5">Grammar</th>
                  <th className="px-6 py-3.5">Reading</th>
                  <th className="px-6 py-3.5">Writing</th>
                  <th className="px-6 py-3.5">Speaking</th>
                  <th className="px-6 py-3.5">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScores.map((score) => (
                  <tr key={score.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{score.user?.fullName || `User #${score.userId}`}</p>
                        <p className="text-xs text-slate-400">{score.user?.email || ''}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <button onClick={() => openEditModal(score)} className="text-blue-500 hover:text-blue-700" title="Edit Nilai"><FileText size={13} /></button>
                          <button onClick={() => handleDownload(score.id)} className="text-green-500 hover:text-green-700" title="Unduh PDF"><Download size={13} /></button>
                          <button onClick={() => handleSendEmail(score)} disabled={emailLoading} className="text-purple-500 hover:text-purple-700 disabled:opacity-40" title="Kirim Email Sertifikat"><Mail size={13} /></button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {getStudentId(score)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {score.user?.degreeProgram || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{score.exam?.title || '—'}</p>
                        {score.examSubmission?.startedAt && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(score.examSubmission.startedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{getSectionScore(score, ['listening'])}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{getSectionScore(score, ['grammar', 'structure'])}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{getSectionScore(score, ['reading'])}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{getSectionScore(score, ['writing'])}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{getSectionScore(score, ['speaking'])}</td>
                    <td className="px-6 py-4">
                      {getTableFinalScore(score) !== null ? (
                        <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-black rounded-lg">
                          {getTableFinalScore(score)}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Excel Import Preview Modal */}
      {importRows && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <FileSpreadsheet size={20} className="text-green-600" />
                  Pratinjau Import Excel
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Periksa perubahan sebelum diterapkan ke tabel nilai sertifikasi.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setImportRows(null)} disabled={excelLoading}>
                <X size={18} />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 text-center">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xl font-black text-slate-900">{importRows.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Baris</p>
              </div>
              <div className="rounded-xl bg-green-50 p-3">
                <p className="text-xl font-black text-green-600">{importRows.filter(row => row.score && row.errors.length === 0).length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-500">Siap Diimport</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-xl font-black text-red-600">{importRows.filter(row => row.errors.length > 0).length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">Bermasalah</p>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Baris</th>
                    <th className="px-5 py-3">Mahasiswa</th>
                    <th className="px-5 py-3">Override Lama</th>
                    <th className="px-5 py-3">Override Baru</th>
                    <th className="px-5 py-3">Nilai Akhir Baru</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importRows.map(row => (
                    <tr key={`${row.rowNumber}-${row.certificationScoreId}`} className={row.errors.length ? 'bg-red-50/40' : ''}>
                      <td className="px-5 py-3 font-mono text-xs text-slate-400">{row.rowNumber}</td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-800">{row.name}</p>
                        <p className="max-w-48 truncate font-mono text-[10px] text-slate-400">{row.certificationScoreId}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{row.score?.examScoreOverride ?? 'Otomatis'}</td>
                      <td className="px-5 py-3 font-bold text-amber-600">{row.examScoreOverride ?? 'Otomatis'}</td>
                      <td className="px-5 py-3 font-black text-blue-600">{row.finalScore?.toFixed(1) ?? '—'}</td>
                      <td className="px-5 py-3">
                        {row.errors.length > 0 ? (
                          <div className="space-y-1">
                            {row.errors.map(message => (
                              <p key={message} className="text-xs font-medium text-red-600">{message}</p>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">
                            <CheckCircle2 size={13} /> Siap
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Baris bermasalah akan dilewati dan tidak mengubah data.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setImportRows(null)} disabled={excelLoading}>
                  Batal
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={excelLoading || !importRows.some(row => row.score && row.errors.length === 0)}
                  className="gap-2"
                >
                  {excelLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Terapkan {importRows.filter(row => row.score && row.errors.length === 0).length} Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingScore && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Nilai Sertifikasi</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingScore.user?.fullName || `User #${editingScore.userId}`}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingScore(null)}>
                <X size={18} />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              {/* Additional Scores */}
              {additionalScoreDefs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Nilai Tambahan</p>
                  <div className="space-y-3">
                    {additionalScoreDefs.map(def => (
                      <div key={def.id} className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-700 flex-1 min-w-0">
                          <span className="truncate block">{def.scoreName}</span>
                          <span className="text-[10px] text-slate-400">bobot: {def.weight}</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={editForm.additionalScores[def.scoreName] || ''}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            additionalScores: { ...editForm.additionalScores, [def.scoreName]: e.target.value }
                          })}
                          placeholder="0-100"
                          className="w-28 px-3 py-2 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Score Override */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Timpa Nilai Ujian</p>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.useOverride}
                      onChange={(e) => setEditForm({ ...editForm, useOverride: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 font-medium">Gunakan penimpaan manual</span>
                  </label>
                </div>
                {editForm.useOverride && (
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editForm.examScoreOverride}
                    onChange={(e) => setEditForm({ ...editForm, examScoreOverride: e.target.value })}
                    placeholder="0-100"
                    className="w-full px-4 py-3 text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                  />
                )}
                {!editForm.useOverride && (
                  <p className="text-xs text-slate-400 italic">Menggunakan nilai ujian yang dihitung otomatis dari pengumpulan.</p>
                )}
              </div>

              {/* Preview */}
              <div className="bg-blue-50/50 border-2 border-blue-100 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Pratinjau Nilai Akhir</p>
                <p className="text-3xl font-black text-blue-600">
                  {computePreviewScore() || '—'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setEditingScore(null)}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="flex items-center gap-2"
              >
                {editLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
