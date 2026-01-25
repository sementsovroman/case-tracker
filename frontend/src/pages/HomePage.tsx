import React, { useMemo, useState } from "react";
import { fetchCases } from "../api/cases";
import { fetchHearings } from "../api/hearings";
import { HearingDetailsModal } from "../components/HearingDetailsModal";
import { TopNav } from "../components/TopNav";
import { Case, Hearing } from "../types";

export function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const caseMap = useMemo(() => new Map(cases.map((item) => [item.id, item])), [cases]);

  const todayHearings = useMemo(() => {
    const merged = hearings.map((h) => ({
      ...h,
      case: h.case ?? caseMap.get(h.caseId) ?? null,
    }));
    return merged.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [hearings, caseMap]);

  const activeHearing = todayHearings.find((h) => h.id === activeId) ?? null;
  const activeCase = activeHearing ? caseMap.get(activeHearing.caseId) ?? activeHearing.case ?? null : null;

  React.useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { fromISO, toISO } = todayRange();
      const [casesData, hearingsData] = await Promise.all([fetchCases(), fetchHearings(fromISO, toISO)]);
      setCases(casesData);
      setHearings(hearingsData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <h1>Сегодняшние заседания</h1>
            <p>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "full" }).format(new Date())}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <TopNav />
          <button className="btn" onClick={() => void load()} disabled={loading}>
            {loading ? "Загрузка…" : "Обновить"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="today-header">
          <div>
            <h2>Расписание на сегодня</h2>
            <p>Тап по карточке — детали заседания</p>
          </div>
          <div className="status-text">{loading ? "Обновляем список…" : `${todayHearings.length} событий`}</div>
        </div>

        <div className="list">
          {!todayHearings.length && !loading ? (
            <div className="empty">На сегодня заседаний нет.</div>
          ) : null}
          {todayHearings.map((hearing) => {
            const caseItem = caseMap.get(hearing.caseId) ?? hearing.case ?? null;
            return (
              <button
                key={hearing.id}
                type="button"
                className="list-item hearing-card"
                onClick={() => {
                  setActiveId(hearing.id);
                  setDetailsOpen(true);
                }}
              >
                <div>
                  <div className="list-title">
                    <span className="color-dot" style={{ background: caseItem?.color ?? "#60a5fa" }} />
                    <span>{caseItem?.title ?? "Дело"}</span>
                    <span className="pill">{hearing.kind === "meeting" ? "Встреча" : "Заседание"}</span>
                  </div>
                  <div className="list-sub">{formatTimeRange(hearing.start, hearing.end)}</div>
                </div>
                <span className="chevron">›</span>
              </button>
            );
          })}
        </div>
      </div>

      <HearingDetailsModal
        open={detailsOpen}
        hearing={activeHearing}
        caseItem={activeCase}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}

function todayRange() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { fromISO: start.toISOString(), toISO: end.toISOString() };
}

function formatTimeRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const timeFormatter = new Intl.DateTimeFormat("ru-RU", { timeStyle: "short" });
  return `${timeFormatter.format(start)} — ${timeFormatter.format(end)}`;
}
