"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cookies from "js-cookie";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  FileDown,
  Loader2,
  Mail,
  Search,
  Upload,
} from "lucide-react";
import {
  certificationService,
  CertificationAdditionalScore,
  CertificationScore,
} from "@/src/api/certification";

type ApiError = { response?: { data?: { error?: string; message?: string } } };
type ImportItem = {
  row: number;
  score: CertificationScore;
  additionalScore: Record<string, number>;
  overrides: Record<string, number>;
};

const getError = (error: unknown, fallback: string) => {
  const data = (error as ApiError)?.response?.data;
  return data?.error ?? data?.message ?? fallback;
};
const getExam = (score: CertificationScore) => ({
  id:
    score.exam?.id ??
    score.examSubmission?.examId ??
    score.examSubmission?.exam?.id ??
    "",
  title:
    score.exam?.title ??
    score.examSubmission?.exam?.title ??
    "Ujian tidak tersedia",
});
const sectionsOf = (score: CertificationScore) =>
  Array.isArray(score.scores) ? score.scores : [];
const overridesOf = (score: CertificationScore) =>
  Array.isArray(score.overrides) ? score.overrides : [];
const cellText = (value: unknown) => {
  if (value == null) return "";
  if (typeof value === "object" && "result" in value)
    return String(value.result ?? "").trim();
  if (typeof value === "object" && "text" in value)
    return String(value.text ?? "").trim();
  return String(value).trim();
};
const fileSafe = (value: string) =>
  value
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
const shown = (value: number | null | undefined) =>
  Number.isFinite(Number(value)) ? Number(value).toFixed(1) : "—";
const normalizeStudent = (score: CertificationScore) => {
  const raw = score as unknown as {
    studentId?: string;
    student_id?: string;
    nim?: string;
    student?: {
      studentId?: string;
      student_id?: string;
      nim?: string;
      degreeProgram?: string | null;
    } | null;
    user?: {
      studentId?: string;
      student_id?: string;
      nim?: string;
      degreeProgram?: string | null;
      student?: {
        studentId?: string;
        student_id?: string;
        nim?: string;
        degreeProgram?: string | null;
      } | null;
    };
  };
  const studentId =
    raw.student?.studentId ??
    raw.student?.student_id ??
    raw.student?.nim ??
    raw.user?.student?.studentId ??
    raw.user?.student?.student_id ??
    raw.user?.student?.nim ??
    raw.user?.studentId ??
    raw.user?.student_id ??
    raw.user?.nim ??
    raw.studentId ??
    raw.student_id ??
    raw.nim;
  const degreeProgram =
    raw.student?.degreeProgram ??
    raw.user?.student?.degreeProgram ??
    raw.user?.degreeProgram;
  return studentId || degreeProgram
    ? { studentId: studentId ?? "", degreeProgram: degreeProgram ?? null }
    : null;
};

export default function CertificationPage() {
  const token = Cookies.get("token");
  const importRef = useRef<HTMLInputElement>(null);
  const [scores, setScores] = useState<CertificationScore[]>([]);
  const [definitions, setDefinitions] = useState<
    CertificationAdditionalScore[]
  >([]);
  const [submissionInput, setSubmissionInput] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [excelLoading, setExcelLoading] = useState(false);
  const [mailingId, setMailingId] = useState<string | null>(null);
  const [bulkMailing, setBulkMailing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalize = (rows: CertificationScore[]) =>
    rows.map((score) => {
      const legacyExam = score.examSubmission?.exam;
      const normalizedSections = sectionsOf(score);
      const normalizedOverrides = overridesOf(score);
      const overrideMap =
        score.examScoreOverride && typeof score.examScoreOverride === "object"
          ? score.examScoreOverride
          : {};
      return {
        ...score,
        user: score.user ?? {
          id: score.userId,
          fullName: `User #${score.userId}`,
          email: "",
          role: "user",
        },
        student: normalizeStudent(score),
        exam: score.exam ?? {
          id: score.examSubmission?.examId ?? legacyExam?.id ?? "",
          title: legacyExam?.title ?? "Ujian tidak tersedia",
          type: legacyExam?.type ?? "",
          isOnce: legacyExam?.isOnce ?? false,
        },
        scores: normalizedSections,
        overrides: normalizedOverrides.length
          ? normalizedOverrides
          : Object.entries(overrideMap).map(([sectionId, overriddenScore]) => ({
              sectionId,
              sectionName:
                normalizedSections.find(
                  (section) => section.sectionId === sectionId,
                )?.sectionName ?? sectionId,
              overriddenScore: Number(overriddenScore),
            })),
      };
    });

  const loadData = useCallback(
    async (submissionId = "") => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        const [rows, defs] = await Promise.all([
          certificationService.getAllScores(token, submissionId || undefined),
          certificationService.getAllAdditionalScores(token),
        ]);
        setScores(normalize(Array.isArray(rows) ? rows : []));
        setDefinitions(Array.isArray(defs) ? defs : []);
      } catch (err) {
        setError(getError(err, "Data nilai sertifikasi gagal dimuat."));
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const exams = useMemo(() => {
    const map = new Map<string, string>();
    scores.forEach((score) => {
      const exam = getExam(score);
      if (exam.id) map.set(exam.id, exam.title);
    });
    return [...map.entries()];
  }, [scores]);
  useEffect(() => {
    if (exams.length > 0 && !exams.some(([id]) => id === examFilter)) {
      setExamFilter(exams[0][0]);
    }
  }, [examFilter, exams]);

  const rows = useMemo(
    () =>
      scores.filter((score) => !examFilter || getExam(score).id === examFilter),
    [examFilter, scores],
  );
  const sectionColumns = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((score) =>
      sectionsOf(score).forEach((section) =>
        map.set(section.sectionId, section.sectionName),
      ),
    );
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [rows]);
  const effectiveScore = (score: CertificationScore, sectionId: string) => {
    const override = overridesOf(score).find(
      (item) => item.sectionId === sectionId,
    );
    if (override) return override.overriddenScore;
    return sectionsOf(score).find((item) => item.sectionId === sectionId)
      ?.scaledScore;
  };

  const exportExcel = async () => {
    if (!rows.length) {
      setError("Tidak ada data yang dapat diekspor.");
      return;
    }
    try {
      setExcelLoading(true);
      setError("");
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Elobright Admin";
      const sheet = workbook.addWorksheet("Nilai Sertifikasi", {
        views: [{ state: "frozen", ySplit: 1, xSplit: 4 }],
      });
      const headers = [
        "certification_score_id",
        "exam_submission_id",
        "nama",
        "email",
        "nim",
        "kelompok",
        "ujian",
        ...sectionColumns.map(
          (section) => `section:${section.id}:${section.name}`,
        ),
        ...definitions.map((def) => `additional:${def.scoreName}`),
        "nilai_akhir",
      ];
      sheet.addRow(headers);
      rows.forEach((score) =>
        sheet.addRow([
          score.id,
          score.examSubmissionId,
          score.user.fullName,
          score.user.email,
          score.student?.studentId ?? "",
          score.student?.degreeProgram ?? "",
          getExam(score).title,
          ...sectionColumns.map(
            (section) => effectiveScore(score, section.id) ?? "",
          ),
          ...definitions.map(
            (def) => score.additionalScore?.[def.scoreName] ?? "",
          ),
          score.totalScore,
        ]),
      );
      const header = sheet.getRow(1);
      header.height = 26;
      header.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF3B82F6" },
        };
        cell.alignment = { vertical: "middle" };
      });
      sheet.autoFilter = {
        from: "A1",
        to: `${sheet.getColumn(headers.length).letter}1`,
      };
      sheet.columns.forEach((column, index) => {
        column.width = index < 2 ? 38 : index === 2 || index === 6 ? 26 : 18;
      });
      sheet.getColumn(1).hidden = true;
      sheet.getColumn(2).hidden = true;
      const guide = workbook.addWorksheet("Petunjuk");
      guide.addRows([
        ["PETUNJUK EDIT NILAI SERTIFIKASI"],
        ["1. Jangan mengubah certification_score_id dan exam_submission_id."],
        [
          "2. Ubah kolom section:... untuk membuat override nilai section (0–100).",
        ],
        [
          "3. Kosongkan kolom section untuk menghapus override section tersebut.",
        ],
        ["4. Kolom additional:... mengikuti definisi nilai pada sistem."],
        ["5. Kolom nilai_akhir hanya informasi dan tidak diimpor."],
      ]);
      guide.getColumn(1).width = 100;
      guide.getRow(1).font = { bold: true, size: 14 };
      const blob = new Blob([(await workbook.xlsx.writeBuffer()) as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nilai-${fileSafe(exams.find(([id]) => id === examFilter)?.[1] ?? "semua-ujian")}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess(`${rows.length} data berhasil diekspor.`);
    } catch (err) {
      setError(getError(err, "File Excel gagal dibuat."));
    } finally {
      setExcelLoading(false);
    }
  };

  const importExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Gunakan file Excel berformat .xlsx.");
      return;
    }
    try {
      setExcelLoading(true);
      setError("");
      setSuccess("");
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const sheet =
        workbook.getWorksheet("Nilai Sertifikasi") ?? workbook.worksheets[0];
      if (!sheet || sheet.rowCount < 2)
        throw new Error("File tidak memiliki data.");
      const headers = new Map<number, string>();
      sheet
        .getRow(1)
        .eachCell((cell, column) => headers.set(column, cellText(cell.value)));
      const idColumn = [...headers].find(
        ([, value]) => value === "certification_score_id",
      )?.[0];
      if (!idColumn)
        throw new Error(
          "Kolom certification_score_id tidak ditemukan. Gunakan hasil export dari sistem.",
        );
      const scoreMap = new Map(scores.map((score) => [score.id, score]));
      const items: ImportItem[] = [];
      const errors: string[] = [];
      for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
        const row = sheet.getRow(rowNumber);
        const id = cellText(row.getCell(idColumn).value);
        if (!id) continue;
        const score = scoreMap.get(id);
        if (!score) {
          errors.push(`Baris ${rowNumber}: ID nilai tidak ditemukan.`);
          continue;
        }
        const overrides: Record<string, number> = {};
        const additionalScore: Record<string, number> = {};
        for (const [column, name] of headers) {
          const raw = cellText(row.getCell(column).value);
          if (!raw) continue;
          if (name.startsWith("section:")) {
            const sectionId = name.split(":")[1];
            const value = Number(raw);
            if (!Number.isFinite(value) || value < 0 || value > 100)
              errors.push(`Baris ${rowNumber}: nilai section harus 0–100.`);
            else overrides[sectionId] = value;
          }
          if (name.startsWith("additional:")) {
            const scoreName = name.slice("additional:".length);
            const value = Number(raw);
            if (!definitions.some((def) => def.scoreName === scoreName))
              errors.push(
                `Baris ${rowNumber}: definisi ${scoreName} tidak dikenal.`,
              );
            else if (!Number.isFinite(value) || value < 0 || value > 100)
              errors.push(
                `Baris ${rowNumber}: nilai ${scoreName} harus 0–100.`,
              );
            else additionalScore[scoreName] = value;
          }
        }
        items.push({ row: rowNumber, score, overrides, additionalScore });
      }
      if (errors.length) throw new Error(errors.slice(0, 6).join("\n"));
      if (!items.length) throw new Error("Tidak ada baris yang dapat diimpor.");
      if (
        !window.confirm(
          `Terapkan perubahan pada ${items.length} data submission?`,
        )
      )
        return;
      const results = await Promise.allSettled(
        items.map((item) =>
          certificationService.updateScore(
            item.score.id,
            {
              additional_score: item.additionalScore,
              exam_score_override: Object.keys(item.overrides).length
                ? item.overrides
                : null,
            },
            token,
          ),
        ),
      );
      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;
      await loadData(submissionInput.trim());
      if (failed)
        setError(
          `${items.length - failed} data diperbarui, ${failed} data gagal.`,
        );
      else setSuccess(`${items.length} data berhasil diperbarui dari Excel.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "File Excel gagal diimpor.",
      );
    } finally {
      setExcelLoading(false);
    }
  };

  const sendEmail = async (score: CertificationScore) => {
    try {
      setMailingId(score.id);
      setError("");
      const result = await certificationService.blastEmail(
        { exam_submission_id: score.examSubmissionId },
        token,
      );
      setSuccess(`Sertifikat berhasil dikirim ke ${result.to}.`);
    } catch (err) {
      setError(getError(err, "Email sertifikat gagal dikirim."));
    } finally {
      setMailingId(null);
    }
  };

  const sendBulkEmail = async () => {
    const submissionIds = [
      ...new Set(rows.map((score) => score.examSubmissionId).filter(Boolean)),
    ];
    if (!submissionIds.length) {
      setError("Tidak ada submission yang dapat dikirimi sertifikat.");
      return;
    }
    const examName =
      exams.find(([id]) => id === examFilter)?.[1] ?? "ujian ini";
    if (
      !window.confirm(
        `Kirim sertifikat kepada ${submissionIds.length} peserta ${examName}?`,
      )
    )
      return;

    setBulkMailing(true);
    setError("");
    setSuccess("");
    let sent = 0;
    for (const examSubmissionId of submissionIds) {
      try {
        await certificationService.blastEmail(
          { exam_submission_id: examSubmissionId },
          token,
        );
        sent += 1;
      } catch {
        // Continue so one invalid recipient does not stop the entire batch.
      }
    }
    setBulkMailing(false);
    const failed = submissionIds.length - sent;
    if (failed > 0) {
      setError(`${sent} sertifikat berhasil dikirim, ${failed} gagal dikirim.`);
    } else {
      setSuccess(`${sent} sertifikat berhasil dikirim secara massal.`);
    }
  };

  return (
    <div className="space-y-5">
      <input
        ref={importRef}
        type="file"
        accept=".xlsx"
        onChange={(event) => void importExcel(event)}
        className="hidden"
      />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex gap-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <Award size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">
              Nilai Sertifikasi
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Kelola nilai sertifikasi, impor nilai dosen, dan kirim sertifikat.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={bulkMailing || loading || !rows.length}
            onClick={() => void sendBulkEmail()}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-100 disabled:opacity-50"
          >
            {bulkMailing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Mail size={16} />
            )}
            Kirim Sertifikat Massal
          </button>
          <button
            disabled={excelLoading}
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm disabled:opacity-50"
          >
            <Upload size={16} />
            Import Excel
          </button>
          <button
            disabled={excelLoading || !rows.length}
            onClick={() => void exportExcel()}
            className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {excelLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            Export Excel
          </button>
        </div>
      </div>
      {error && (
        <div className="whitespace-pre-line flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void loadData(submissionInput.trim());
        }}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end"
      >
        <label className="text-xs font-bold text-slate-700">
          Filter berdasarkan ID Pengumpulan
          <input
            value={submissionInput}
            onChange={(event) => setSubmissionInput(event.target.value)}
            placeholder="Enter exam submission UUID..."
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none placeholder:text-slate-300 focus:border-blue-400"
          />
        </label>
        <label className="text-xs font-bold text-slate-700">
          Filter berdasarkan Ujian
          <select
            value={examFilter}
            onChange={(event) => setExamFilter(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-blue-400"
          >
            {exams.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600">
          <Search size={16} />
          Filter
        </button>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-16 text-sm text-slate-500">
            <Loader2 className="animate-spin" />
            Memuat data submission...
          </div>
        ) : !rows.length ? (
          <div className="p-16 text-center text-sm text-slate-500">
            Tidak ada data submission.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-xs">
              <thead className="border-b bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">NIM</th>
                  <th className="px-5 py-4">Program Studi</th>
                  <th className="px-5 py-4">Kelompok</th>
                  <th className="px-5 py-4">Ujian</th>
                  {sectionColumns.map((section) => (
                    <th key={section.id} className="px-5 py-4 text-center">
                      {section.name}
                    </th>
                  ))}
                  {definitions.map((definition) => (
                    <th key={definition.id} className="px-5 py-4 text-center">
                      {definition.scoreName}
                    </th>
                  ))}
                  <th className="px-5 py-4 text-center">Nilai Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((score) => (
                  <tr key={score.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {score.user.fullName}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {score.user.email}
                      </p>
                      <div className="mt-1 flex gap-1.5">
                        <a
                          href={certificationService.getDownloadUrl(score.id)}
                          title="Unduh sertifikat"
                          className="text-blue-500"
                        >
                          <Download size={13} />
                        </a>
                        <button
                          onClick={() => void sendEmail(score)}
                          disabled={mailingId === score.id}
                          title="Kirim sertifikat"
                          className="text-fuchsia-500 disabled:opacity-50"
                        >
                          {mailingId === score.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Mail size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {score.student?.studentId || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {score.degreeProgram || score.student?.degreeProgram || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {score.groupNumber || "—"}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {getExam(score).title}
                    </td>
                    {sectionColumns.map((section) => (
                      <td key={section.id} className="px-5 py-4 text-center">
                        <span
                          className={
                            overridesOf(score).some(
                              (item) => item.sectionId === section.id,
                            )
                              ? "font-black text-amber-600"
                              : "font-bold text-slate-600"
                          }
                        >
                          {shown(effectiveScore(score, section.id))}
                        </span>
                      </td>
                    ))}
                    {definitions.map((definition) => (
                      <td
                        key={definition.id}
                        className="px-5 py-4 text-center font-bold text-violet-600"
                      >
                        {shown(score.additionalScore?.[definition.scoreName])}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-lg bg-emerald-50 px-3 py-2 font-black text-emerald-700">
                        {shown(score.totalScore)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
