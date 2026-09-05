import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Save, X } from "lucide-react";
import {
  CertificationAdditionalScore,
  CertificationScore,
  CertificationScoreUpdatePayload,
} from "@/src/api/certification";

type SectionField = {
  sectionId: string;
  sectionName: string;
  scaledScore: number;
};

interface EditCertificationScoreModalProps {
  isOpen: boolean;
  score: CertificationScore | null;
  definitions: CertificationAdditionalScore[];
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSave: (payload: CertificationScoreUpdatePayload) => void;
}

const sectionsOf = (score: CertificationScore | null): SectionField[] =>
  score && Array.isArray(score.scores) ? score.scores : [];

const findValue = (values: Record<string, number> | null | undefined, name: string) => {
  if (!values) return undefined;
  const entry = Object.entries(values).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return entry?.[1];
};

const findSectionOverride = (score: CertificationScore, section: SectionField) => {
  const override = Array.isArray(score.overrides)
    ? score.overrides.find(
        (item) =>
          item.sectionId === section.sectionId ||
          item.sectionName.toLowerCase() === section.sectionName.toLowerCase(),
      )
    : undefined;

  return (
    override?.overriddenScore ??
    findValue(score.examScoreOverride, section.sectionName) ??
    findValue(score.examScoreOverride, section.sectionId)
  );
};

export function EditCertificationScoreModal({
  isOpen,
  score,
  definitions,
  isSaving,
  error,
  onClose,
  onSave,
}: EditCertificationScoreModalProps) {
  const sections = useMemo(() => sectionsOf(score), [score]);
  const initialSections = useMemo(
    () =>
      score
        ? Object.fromEntries(
            sections.map((section) => {
              const override = findSectionOverride(score, section);
              return [section.sectionId, override == null ? "" : String(override)];
            }),
          )
        : {},
    [score, sections],
  );
  const initialAdditional = useMemo(
    () =>
      score
        ? Object.fromEntries(
            definitions.map((definition) => {
              const value = findValue(score.additionalScore, definition.scoreName);
              return [definition.id, value == null ? "" : String(value)];
            }),
          )
        : {},
    [definitions, score],
  );
  const [sectionValues, setSectionValues] = useState<Record<string, string>>(
    initialSections,
  );
  const [additionalValues, setAdditionalValues] = useState<Record<string, string>>(
    initialAdditional,
  );
  const [initialSectionValues] = useState<Record<string, string>>(initialSections);
  const [initialAdditionalValues] = useState<Record<string, string>>(initialAdditional);
  const [formError, setFormError] = useState("");

  const hasChanges = useMemo(
    () =>
      sections.some(
        (section) =>
          (sectionValues[section.sectionId] ?? "").trim() !==
          (initialSectionValues[section.sectionId] ?? "").trim(),
      ) ||
      definitions.some(
        (definition) =>
          (additionalValues[definition.id] ?? "").trim() !==
          (initialAdditionalValues[definition.id] ?? "").trim(),
      ),
    [
      additionalValues,
      definitions,
      initialAdditionalValues,
      initialSectionValues,
      sectionValues,
      sections,
    ],
  );

  if (!isOpen || !score) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const examScoreOverride: Record<string, number | null> = {};
    const additionalScore: Record<string, number | null> = {};

    for (const section of sections) {
      const before = (initialSectionValues[section.sectionId] ?? "").trim();
      const after = (sectionValues[section.sectionId] ?? "").trim();
      if (before === after) continue;

      if (!after) {
        if (before) examScoreOverride[section.sectionName] = null;
        continue;
      }

      const value = Number(after);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        setFormError(`Nilai ${section.sectionName} harus berupa angka 0 sampai 100.`);
        return;
      }
      examScoreOverride[section.sectionName] = value;
    }

    for (const definition of definitions) {
      const before = (initialAdditionalValues[definition.id] ?? "").trim();
      const after = (additionalValues[definition.id] ?? "").trim();
      if (before === after) continue;

      if (!after) {
        if (before) additionalScore[definition.scoreName] = null;
        continue;
      }

      const value = Number(after);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        setFormError(`Nilai ${definition.scoreName} harus berupa angka 0 sampai 100.`);
        return;
      }
      additionalScore[definition.scoreName] = value;
    }

    if (!Object.keys(examScoreOverride).length && !Object.keys(additionalScore).length) {
      setFormError("Belum ada perubahan nilai.");
      return;
    }

    const payload: CertificationScoreUpdatePayload = {};
    if (Object.keys(examScoreOverride).length) payload.examScoreOverride = examScoreOverride;
    if (Object.keys(additionalScore).length) payload.additionalScore = additionalScore;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Edit Nilai Sertifikasi</h2>
            <p className="mt-1 text-xs text-slate-500">
              {score.user.fullName} · {score.user.email || "Email tidak tersedia"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Tutup modal"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Override Nilai Section</h3>
              <p className="mt-1 text-xs text-slate-500">
                Kosongkan input untuk menghapus override dan kembali ke nilai otomatis.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {sections.map((section) => (
                  <label key={section.sectionId} className="rounded-xl border border-slate-200 p-4">
                    <span className="block text-xs font-bold text-slate-700">{section.sectionName}</span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      Nilai otomatis: {Number.isFinite(Number(section.scaledScore)) ? Number(section.scaledScore).toFixed(1) : "—"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={sectionValues[section.sectionId] ?? ""}
                      onChange={(event) =>
                        setSectionValues((current) => ({
                          ...current,
                          [section.sectionId]: event.target.value,
                        }))
                      }
                      placeholder="Nilai override"
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">Nilai Tambahan</h3>
              <p className="mt-1 text-xs text-slate-500">
                Kosongkan nilai yang ingin dihapus. Nilai harus berada pada rentang 0–100.
              </p>
              {definitions.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {definitions.map((definition) => (
                    <label key={definition.id} className="rounded-xl border border-slate-200 p-4">
                      <span className="block text-xs font-bold text-slate-700">{definition.scoreName}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">Bobot: {definition.weight}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={additionalValues[definition.id] ?? ""}
                        onChange={(event) =>
                          setAdditionalValues((current) => ({
                            ...current,
                            [definition.id]: event.target.value,
                          }))
                        }
                        placeholder="Nilai tambahan"
                        className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                  Belum ada definisi nilai tambahan.
                </p>
              )}
            </div>

            {(formError || error) && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                <p>{formError || error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Menyimpan..." : "Simpan Nilai"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
