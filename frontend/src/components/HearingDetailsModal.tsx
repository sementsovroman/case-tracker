import { Case, Hearing } from "../types";

type Props = {
  open: boolean;
  hearing?: Hearing | null;
  caseItem?: Case | null;
  onClose: () => void;
  onEdit?: () => void;
};

export function HearingDetailsModal({ open, hearing, caseItem, onClose, onEdit }: Props) {
  if (!open || !hearing) return null;

  const title = caseItem?.title ?? hearing.case?.title ?? "Дело";
  const description = caseItem?.description ?? hearing.case?.description;
  const court = caseItem?.court ?? "—";
  const judge = caseItem?.judge ?? "—";
  const plaintiff = caseItem?.plaintiff ?? "—";
  const defendant = caseItem?.defendant ?? "—";

  return (
    <div className="backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Детали заседания</h3>
            <p className="modal-sub">{formatRange(hearing.start, hearing.end)}</p>
          </div>
          <button className="icon-btn" onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>

        <div className="details-card">
          <div className="details-title">
            <span className="color-dot" style={{ background: caseItem?.color ?? hearing.case?.color ?? "#60a5fa" }} />
            <div>
              <div className="details-heading">{title}</div>
              {description ? <div className="details-sub">{description}</div> : null}
            </div>
          </div>

          <div className="details-grid">
            <div className="detail-row">
              <span>Тип</span>
              <span>{hearing.kind === "meeting" ? "Встреча" : "Заседание"}</span>
            </div>
            <div className="detail-row">
              <span>Суд</span>
              <span>{court}</span>
            </div>
            <div className="detail-row">
              <span>Судья</span>
              <span>{judge}</span>
            </div>
            <div className="detail-row">
              <span>Истец</span>
              <span>{plaintiff}</span>
            </div>
            <div className="detail-row">
              <span>Ответчик</span>
              <span>{defendant}</span>
            </div>
          </div>
        </div>

        <div className="actions">
          <span />
          {onEdit ? (
            <button className="btn btn-primary" onClick={onEdit}>
              Редактировать
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const dateFormatter = new Intl.DateTimeFormat("ru-RU", { dateStyle: "full" });
  const timeFormatter = new Intl.DateTimeFormat("ru-RU", { timeStyle: "short" });
  const date = dateFormatter.format(start);
  const startTime = timeFormatter.format(start);
  const endTime = timeFormatter.format(end);
  return `${date}, ${startTime} — ${endTime}`;
}
