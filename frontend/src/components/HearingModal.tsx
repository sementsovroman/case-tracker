import React, { useMemo, useState } from "react";
import { Case, Hearing, HearingKind } from "../types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: Partial<Hearing>;
  cases: Case[];
  onClose: () => void;
  onSave: (data: Omit<Hearing, "id">) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function HearingModal({ open, mode, initial, cases, onClose, onSave, onDelete }: Props) {
  const [caseId, setCaseId] = useState(initial.caseId ?? "");
  const [kind, setKind] = useState<HearingKind>(initial.kind ?? "hearing");
  const [start, setStart] = useState(toLocalInput(initial.start));
  const [end, setEnd] = useState(toLocalInput(initial.end));
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    setCaseId(initial.caseId ?? cases[0]?.id ?? "");
    setKind(initial.kind ?? "hearing");
    setStart(toLocalInput(initial.start));
    setEnd(toLocalInput(initial.end));
  }, [open, initial, cases]);

  const valid = useMemo(() => {
    if (!caseId) return false;
    if (!start || !end) return false;
    return new Date(fromLocalInput(start)).getTime() < new Date(fromLocalInput(end)).getTime();
  }, [caseId, start, end]);

  if (!open) return null;

  const canDelete = mode === "edit" && !!onDelete;

  return (
    <div className="backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3 className="modal-title">{mode === "create" ? "Новое заседание" : "Редактировать заседание"}</h3>
            <p className="modal-sub">Выбери дело и тип события</p>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={busy} title="Закрыть">
            ✕
          </button>
        </div>

        <label className="field">
          Дело
          <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            {!cases.length && <option value="">Сначала создайте дело</option>}
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Тип события
          <select className="input" value={kind} onChange={(e) => setKind(e.target.value as HearingKind)}>
            <option value="hearing">Заседание</option>
            <option value="meeting">Встреча</option>
          </select>
        </label>

        <div className="grid2">
          <label className="field">
            Начало
            <input className="input" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="field">
            Конец
            <input className="input" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>

        <div className="actions">
          {canDelete ? (
            <button
              className="btn btn-danger"
              onClick={async () => {
                if (!onDelete) return;
                setBusy(true);
                try {
                  await onDelete();
                  onClose();
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
            >
              Удалить
            </button>
          ) : (
            <span />
          )}

          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!valid) return;
              setBusy(true);
              try {
                await onSave({
                  caseId,
                  kind,
                  start: fromLocalInput(start),
                  end: fromLocalInput(end),
                });
                onClose();
              } finally {
                setBusy(false);
              }
            }}
            disabled={!valid || busy}
          >
            Сохранить
          </button>
        </div>

        {!valid ? (
          <div className="error">Проверь: выбрано дело, start/end, и что start &lt; end.</div>
        ) : (
          <div className="hint">Название в календаре формируется как «дело — тип».</div>
        )}
      </div>
    </div>
  );
}

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string) {
  const d = new Date(local);
  return d.toISOString();
}
