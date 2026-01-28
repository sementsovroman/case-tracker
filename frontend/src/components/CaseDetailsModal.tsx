import React, { useMemo, useState } from "react";
import { Case } from "../types";

type Props = {
  open: boolean;
  initial: Case | null;
  onClose: () => void;
  onSave: (data: Omit<Case, "id">) => Promise<void>;
};

export function CaseDetailsModal({ open, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [court, setCourt] = useState("");
  const [judge, setJudge] = useState("");
  const [plaintiff, setPlaintiff] = useState("");
  const [defendant, setDefendant] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [notes, setNotes] = useState("");
  const [archived, setArchived] = useState(false);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (!open || !initial) return;
    setTitle(initial.title);
    setDescription(initial.description ?? "");
    setCourt(initial.court ?? "");
    setJudge(initial.judge ?? "");
    setPlaintiff(initial.plaintiff ?? "");
    setDefendant(initial.defendant ?? "");
    setColor(initial.color ?? "#3b82f6");
    setNotes(initial.notes ?? "");
    setArchived(Boolean(initial.archived));
  }, [open, initial]);

  const valid = useMemo(() => title.trim().length > 0, [title]);

  if (!open || !initial) return null;

  return (
    <div className="backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Детали дела</h3>
            <p className="modal-sub">Просмотр и редактирование</p>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={busy} title="Закрыть">
            ✕
          </button>
        </div>

        <label className="field">
          Название дела
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="field">
          Краткое описание
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="section">
          <div className="section-title">Стороны</div>
          <div className="grid2">
            <label className="field">
              Суд
              <input className="input" value={court} onChange={(e) => setCourt(e.target.value)} />
            </label>
            <label className="field">
              Судья
              <input className="input" value={judge} onChange={(e) => setJudge(e.target.value)} />
            </label>
          </div>
          <div className="grid2">
            <label className="field">
              Истец
              <input className="input" value={plaintiff} onChange={(e) => setPlaintiff(e.target.value)} />
            </label>
            <label className="field">
              Ответчик
              <input className="input" value={defendant} onChange={(e) => setDefendant(e.target.value)} />
            </label>
          </div>
        </div>

        <label className="field">
          Цвет дела
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
              height: 42,
              width: 72,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
            }}
          />
        </label>

        <label className="field">
          Дополнительная информация
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <label className="field">
          <span>Архив</span>
          <div className="checkbox-row">
            <input
              id="case-archived"
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            <label htmlFor="case-archived">Скрыть дело из списка</label>
          </div>
        </label>

        <div className="actions">
          <span />
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!valid) return;
              setBusy(true);
              try {
                await onSave({
                  title: title.trim(),
                  description,
                  court,
                  judge,
                  plaintiff,
                  defendant,
                  color,
                  notes,
                  archived,
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

        {!valid ? <div className="error">Укажи название дела.</div> : <div className="hint">Изменения сохраняются сразу.</div>}
      </div>
    </div>
  );
}
