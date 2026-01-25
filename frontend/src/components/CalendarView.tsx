import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, DatesSetArg, EventClickArg, EventDropArg, EventResizeDoneArg } from "@fullcalendar/core";

import { Case, Hearing, HearingKind } from "../types";
import { createCase, fetchCases } from "../api/cases";
import { createHearing, deleteHearing, fetchHearings, updateHearing } from "../api/hearings";
import { CaseModal } from "./CaseModal";
import { HearingDetailsModal } from "./HearingDetailsModal";
import { HearingModal } from "./HearingModal";
import { CasesListModal } from "./CasesListModal";
import { TopNav } from "./TopNav";

export function CalendarView() {
  const [cases, setCases] = useState<Case[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [hearingModalOpen, setHearingModalOpen] = useState(false);
  const [hearingModalMode, setHearingModalMode] = useState<"create" | "edit">("create");
  const [activeHearing, setActiveHearing] = useState<Partial<Hearing>>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsHearing, setDetailsHearing] = useState<Hearing | null>(null);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [casesListOpen, setCasesListOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const caseMap = useMemo(() => new Map(cases.map((item) => [item.id, item])), [cases]);

  const fcEvents = useMemo(
    () =>
      hearings.map((h) => {
        const caseItem = caseMap.get(h.caseId) ?? h.case ?? null;
        return {
          id: h.id,
          title: `${caseItem?.title ?? "Дело"} — ${kindLabel(h.kind)}`,
          start: h.start,
          end: h.end,
          backgroundColor: caseItem?.color ?? "#60a5fa",
          borderColor: caseItem?.color ?? "#60a5fa",
          extendedProps: {
            caseTitle: caseItem?.title,
            caseDescription: caseItem?.description,
            kind: h.kind,
            color: caseItem?.color ?? "#60a5fa",
          },
        };
      }),
    [hearings, caseMap]
  );

  async function reload(fromISO: string, toISO: string) {
    setLoading(true);
    try {
      const data = await fetchHearings(fromISO, toISO);
      setHearings(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadCases() {
    const data = await fetchCases();
    setCases(data);
  }

  return (
    <div className="shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <div>
            <h1>Календарь судебных дел</h1>
            <p>Day / Week / Month • заседания в календаре</p>
          </div>
        </div>
        <div className="topbar-actions">
          <TopNav />
          <button className="btn btn-primary" onClick={() => setCaseModalOpen(true)}>
            Завести дело
          </button>
          <button className="btn" onClick={() => setCasesListOpen(true)}>
            Список дел
          </button>
          <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12 }}>
            {loading ? "Загрузка…" : "Готово"}
          </div>
        </div>
      </div>

      <div className="card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridDay,timeGridWeek,dayGridMonth",
          }}
          height="auto"
          nowIndicator
          selectable
          selectMirror
          editable
          eventOverlap
          slotMinTime="06:00:00"
          slotMaxTime="24:00:00"
          expandRows
          events={fcEvents}
          datesSet={async (arg: DatesSetArg) => {
            await loadCases();
            await reload(arg.start.toISOString(), arg.end.toISOString());
          }}
          select={(arg: DateSelectArg) => {
            setHearingModalMode("create");
            setActiveHearing({
              caseId: cases[0]?.id ?? "",
              kind: "hearing",
              start: arg.start.toISOString(),
              end: arg.end.toISOString(),
            });
            setHearingModalOpen(true);
          }}
          eventClick={(arg: EventClickArg) => {
            const id = arg.event.id;
            const found = hearings.find((h) => h.id === id);
            if (!found) return;
            setDetailsHearing(found);
            setDetailsOpen(true);
          }}
          eventDrop={async (arg: EventDropArg) => {
            const id = arg.event.id;
            const found = hearings.find((h) => h.id === id);
            if (!found) return;

            const next: Omit<Hearing, "id"> = {
              caseId: found.caseId,
              kind: found.kind,
              start: arg.event.start?.toISOString() ?? found.start,
              end: arg.event.end?.toISOString() ?? found.end,
            };

            const updated = await updateHearing(id, next);
            setHearings((prev) => prev.map((h) => (h.id === id ? updated : h)));
          }}
          eventResize={async (arg: EventResizeDoneArg) => {
            const id = arg.event.id;
            const found = hearings.find((h) => h.id === id);
            if (!found) return;

            const next: Omit<Hearing, "id"> = {
              caseId: found.caseId,
              kind: found.kind,
              start: arg.event.start?.toISOString() ?? found.start,
              end: arg.event.end?.toISOString() ?? found.end,
            };

            const updated = await updateHearing(id, next);
            setHearings((prev) => prev.map((h) => (h.id === id ? updated : h)));
          }}
        />
      </div>

      <CaseModal
        open={caseModalOpen}
        onClose={() => setCaseModalOpen(false)}
        onSave={async (payload) => {
          const created = await createCase(payload);
          setCases((prev) => [created, ...prev]);
        }}
      />

      <CasesListModal open={casesListOpen} onClose={() => setCasesListOpen(false)} cases={cases} />

      <HearingDetailsModal
        open={detailsOpen}
        hearing={detailsHearing}
        caseItem={detailsHearing ? caseMap.get(detailsHearing.caseId) ?? detailsHearing.case ?? null : null}
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
    </div>
  );
}

function kindLabel(kind: HearingKind) {
  return kind === "meeting" ? "Встреча" : "Заседание";
}
