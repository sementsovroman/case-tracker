import { useState } from "react";
import { updateCase } from "../api/cases";
import { Case } from "../types";
import { CaseDetailsModal } from "./CaseDetailsModal";

type Props = {
  open: boolean;
  cases: Case[];
  onClose: () => void;
  onUpdate: (updated: Case) => void;
};

export function CasesListModal({ open, cases, onClose, onUpdate }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeCase, setActiveCase] = useState<Case | null>(null);

  if (!open) return null;

  return (
    <div className="backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h3 className="modal-title">Список дел</h3>
            <p className="modal-sub">Название + описание для быстрого обзора</p>
          </div>
          <button className="icon-btn" onClick={onClose} title="Закрыть">
            ✕
          </button>
        </div>

        <div className="list">
          {cases.length === 0 ? (
            <div className="empty">Пока нет дел. Создай первое дело.</div>
          ) : (
            cases.map((c) => (
              <div className="list-item" key={c.id}>
                <div className="list-row">
                  <div className="list-title">
                    <span className="color-dot" style={{ background: c.color }} />
                    {c.title}
                  </div>
                  <button
                    className="icon-btn icon-btn-sm"
                    title="Открыть дело"
                    onClick={() => {
                      setActiveCase(c);
                      setDetailsOpen(true);
                    }}
                  >
                    ✎
                  </button>
                </div>
                <div className="list-sub">{c.description || "Без описания"}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <CaseDetailsModal
        open={detailsOpen}
        initial={activeCase}
        onClose={() => setDetailsOpen(false)}
        onSave={async (payload) => {
          if (!activeCase) return;
          const updated = await updateCase(activeCase.id, payload);
          onUpdate(updated);
        }}
      />
    </div>
  );
}
