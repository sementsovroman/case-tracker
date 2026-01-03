import React, { useMemo, useState } from "react";
import { CalendarEvent } from "../types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial: Partial<CalendarEvent>;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, "id">) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function EventModal({ open, mode, initial, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [start, setStart] = useState(toLocalInput(initial.start));
  const [end, setEnd] = useState(toLocalInput(initial.end));
  const [color, setColor] = useState(initial.color ?? "#3b82f6");
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(initial.title ?? "");
    setDescription(initial.description ?? "");
    setStart(toLocalInput(initial.start));
    setEnd(toLocalInput(initial.end));
    setColor(initial.color ?? "#3b82f6");
  }, [open, initial]);

  const valid = useMemo(() => {
    if (!title.trim()) return false;
    if (!start || !end) return false;
    return new Date(fromLocalInput(start)).getTime() < new Date(fromLocalInput(end)).getTime();
  }, [title, start, end]);

  if (!open) return null;

  const canDelete = mode === "edit" && !!onDelete;

  return (
    <div className="backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3 className="modal-title">{mode === "create" ? "Создать событие" : "Редактировать событие"}</h3>
            <p className="modal-sub">Клик по событию — просмотр/редактирование • выделение диапазона — создание</p>
          </div>
          <button className="icon-btn" onClick={onClose} disabled={busy} title="Закрыть">✕</button>
        </div>

        <label className="field">
          Название
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Встреча" />
        </label>

        <label className="field">
          Описание
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Текст заметки / детали" />
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

        <label className="field">
          Цвет
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ height: 42, width: 72, borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.06)" }} />
        </label>

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
                  title: title.trim(),
                  description,
                  start: fromLocalInput(start),
                  end: fromLocalInput(end),
                  color,
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
          <div className="error">Проверь: название, start/end, и что start &lt; end.</div>
        ) : (
          <div className="hint">Можно двигать/растягивать события прямо в календаре (drag &amp; resize).</div>
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
