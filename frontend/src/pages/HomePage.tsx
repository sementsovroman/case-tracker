import React, { useMemo, useState } from "react";
import { createCase, fetchCases } from "../api/cases";
import { createHearing, deleteHearing, fetchHearings, updateHearing } from "../api/hearings";
import { CaseModal } from "../components/CaseModal";
import { CasesListModal } from "../components/CasesListModal";
import { HearingDetailsModal } from "../components/HearingDetailsModal";
import { HearingModal } from "../components/HearingModal";
import { Case, Hearing } from "../types";

export function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [hearingModalOpen, setHearingModalOpen] = useState(false);
  const [hearingModalMode, setHearingModalMode] = useState<"create" | "edit">("create");
  const [activeHearing, setActiveHearing] = useState<Partial<Hearing>>({});
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [casesListOpen, setCasesListOpen] = useState(false);

  const caseMap = useMemo(() => new Map(cases.map((item) => [item.id, item])), [cases]);

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const mergedHearings = useMemo(() => {
    const merged = hearings.map((h) => ({
      ...h,
      case: h.case ?? caseMap.get(h.caseId) ?? null,
    }));
    return merged.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [hearings, caseMap]);

  const selectedHearings = useMemo(() => {
    return mergedHearings.filter((h) => isSameDay(new Date(h.start), selectedDate));
  }, [mergedHearings, selectedDate]);

  const detailsHearing = mergedHearings.find((h) => h.id === activeId) ?? null;
  const activeCase = detailsHearing ? caseMap.get(detailsHearing.caseId) ?? detailsHearing.case ?? null : null;

  React.useEffect(() => {
    void load();
  }, [weekStart]);

  async function load() {
    setLoading(true);
    try {
      const { fromISO, toISO } = weekRange(weekStart);
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
            <h1>Календарь судебных дел</h1>
            <p>Управляйте заседаниями и делами</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="segmented">
            <button
              type="button"
              className={`segmented-btn ${viewMode === "day" ? "active" : ""}`}
              onClick={() => {
                setViewMode("day");
                setSelectedDate(startOfDay(new Date()));
              }}
            >
              День
            </button>
            <button
              type="button"
              className={`segmented-btn ${viewMode === "week" ? "active" : ""}`}
              onClick={() => {
                setViewMode("week");
                setSelectedDate(startOfDay(new Date()));
              }}
            >
              Неделя
            </button>
          </div>
          <button className="btn" onClick={() => void load()} disabled={loading}>
            {loading ? "Загрузка…" : "Обновить"}
          </button>
          <button className="btn btn-primary" onClick={() => setCaseModalOpen(true)}>
            Завести дело
          </button>
          <button className="btn" onClick={() => setCasesListOpen(true)}>
            Список дел
          </button>
        </div>
      </div>

      <div className="card">
        <div className="calendar-header">
          <button
            type="button"
            className="nav-btn"
            aria-label="Назад"
            onClick={() => {
              setSelectedDate((prev) => (viewMode === "day" ? addDays(prev, -1) : addDays(prev, -7)));
            }}
          >
            ‹
          </button>
          <div className="calendar-center">
            {viewMode === "day" ? (
              <div className="day-widget">
                <div className="day-title">{formatWeekdayFull(selectedDate)}</div>
                <div className="day-date">{formatDayNumber(selectedDate)}</div>
                <div className="day-month">{formatMonthYear(selectedDate)}</div>
              </div>
            ) : (
              <div className="week-strip">
                {weekDays.map((day) => (
                  <button
                    key={day.toISOString()}
                    type="button"
                    className={`week-day ${isSameDay(day, selectedDate) ? "active" : ""}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className="week-day-title">{formatWeekdayShort(day)}</span>
                    <span className="week-day-date">{day.getDate()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="nav-btn"
            aria-label="Вперёд"
            onClick={() => {
              setSelectedDate((prev) => (viewMode === "day" ? addDays(prev, 1) : addDays(prev, 7)));
            }}
          >
            ›
          </button>
        </div>

        <div className="calendar-subhead">
          <h2>Планы на выбранный день</h2>
          <p>{loading ? "Обновляем список…" : `${selectedHearings.length} событий`}</p>
        </div>

        <div className="list">
          {!selectedHearings.length && !loading ? (
            <div className="empty">На выбранный день событий нет.</div>
          ) : null}
          {selectedHearings.map((hearing) => {
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
        hearing={detailsHearing}
        caseItem={activeCase}
        onClose={() => setDetailsOpen(false)}
        onEdit={
          detailsHearing
            ? () => {
                setDetailsOpen(false);
                setHearingModalMode("edit");
                setActiveHearing(detailsHearing);
                setHearingModalOpen(true);
              }
            : undefined
        }
      />

      <CaseModal
        open={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        onSave={async (payload) => {
          const created = await createCase(payload);
          setCases((prev) => [created, ...prev]);
        }}
      />

      <CasesListModal open={casesListOpen} onClose={() => setCasesListOpen(false)} cases={cases} />

      <HearingModal
        open={hearingModalOpen}
        mode={hearingModalMode}
        initial={activeHearing}
        cases={cases}
        onClose={() => setHearingModalOpen(false)}
        onSave={async (payload) => {
          if (hearingModalMode === "create") {
            const created = await createHearing(payload);
            setHearings((prev) => [created, ...prev]);
          } else {
            const id = activeHearing.id!;
            const updated = await updateHearing(id, payload);
            setHearings((prev) => prev.map((h) => (h.id === id ? updated : h)));
          }
        }}
        onDelete={
          hearingModalMode === "edit"
            ? async () => {
                const id = activeHearing.id!;
                await deleteHearing(id);
                setHearings((prev) => prev.filter((h) => h.id !== id));
              }
            : undefined
        }
      />

      <button
        className="fab"
        type="button"
        onClick={() => {
          const now = new Date();
          const base = viewMode === "day" ? new Date(selectedDate) : new Date(selectedDate);
          const defaultTime = roundToNextQuarter(now);
          const start = setDateTime(base, defaultTime.getHours(), defaultTime.getMinutes());
          const end = new Date(start);
          end.setMinutes(end.getMinutes() + 60);
          setHearingModalMode("create");
          setActiveHearing({
            caseId: cases[0]?.id ?? "",
            kind: "hearing",
            start: start.toISOString(),
            end: end.toISOString(),
          });
          setHearingModalOpen(true);
        }}
        aria-label="Добавить заседание"
        title="Добавить заседание"
      >
        +
      </button>
    </div>
  );
}

function weekRange(weekStart: Date) {
  const start = startOfDay(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { fromISO: start.toISOString(), toISO: end.toISOString() };
}

function formatTimeRange(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const timeFormatter = new Intl.DateTimeFormat("ru-RU", { timeStyle: "short" });
  return `${timeFormatter.format(start)} — ${timeFormatter.format(end)}`;
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

function formatWeekdayFull(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(date);
}

function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric" }).format(date);
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(date);
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}

function buildWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + index);
    return d;
  });
}

function formatWeekdayShort(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function roundToNextQuarter(date: Date) {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const rounded = Math.ceil(minutes / 15) * 15;
  d.setMinutes(rounded, 0, 0);
  if (rounded === 60) {
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
  }
  return d;
}

function setDateTime(date: Date, hours: number, minutes: number) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function addDays(date: Date, delta: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}
