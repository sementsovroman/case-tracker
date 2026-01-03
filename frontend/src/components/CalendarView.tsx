import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, DatesSetArg, EventClickArg, EventDropArg, EventResizeDoneArg } from "@fullcalendar/core";

import { CalendarEvent } from "../types";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "../api/events";
import { EventModal } from "./EventModal";

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeEvent, setActiveEvent] = useState<Partial<CalendarEvent>>({});
  const [loading, setLoading] = useState(false);

  const fcEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        backgroundColor: e.color,
        borderColor: e.color,
        extendedProps: { description: e.description, color: e.color },
      })),
    [events]
  );

  async function reload(fromISO: string, toISO: string) {
    setLoading(true);
    try {
      const data = await fetchEvents(fromISO, toISO);
      setEvents(data);
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
            <h1>Календарь-органайзер (прототип)</h1>
            <p>Day / Week / Month • CRUD событий • общий сервер</p>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12 }}>
          {loading ? "Загрузка…" : "Готово"}
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
            await reload(arg.start.toISOString(), arg.end.toISOString());
          }}
          select={(arg: DateSelectArg) => {
            setModalMode("create");
            setActiveEvent({
              title: "",
              description: "",
              start: arg.start.toISOString(),
              end: arg.end.toISOString(),
              color: "#60a5fa",
            });
            setModalOpen(true);
          }}
          eventClick={(arg: EventClickArg) => {
            const id = arg.event.id;
            const found = events.find((e) => e.id === id);
            if (!found) return;
            setModalMode("edit");
            setActiveEvent(found);
            setModalOpen(true);
          }}
          eventDrop={async (arg: EventDropArg) => {
            const id = arg.event.id;
            const found = events.find((e) => e.id === id);
            if (!found) return;

            const next: Omit<CalendarEvent, "id"> = {
              title: found.title,
              description: found.description,
              start: arg.event.start?.toISOString() ?? found.start,
              end: arg.event.end?.toISOString() ?? found.end,
              color: found.color,
            };

            const updated = await updateEvent(id, next);
            setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
          }}
          eventResize={async (arg: EventResizeDoneArg) => {
            const id = arg.event.id;
            const found = events.find((e) => e.id === id);
            if (!found) return;

            const next: Omit<CalendarEvent, "id"> = {
              title: found.title,
              description: found.description,
              start: arg.event.start?.toISOString() ?? found.start,
              end: arg.event.end?.toISOString() ?? found.end,
              color: found.color,
            };

            const updated = await updateEvent(id, next);
            setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
          }}
        />
      </div>

      <EventModal
        open={modalOpen}
        mode={modalMode}
        initial={activeEvent}
        onClose={() => setModalOpen(false)}
        onSave={async (payload) => {
          if (modalMode === "create") {
            const created = await createEvent(payload);
            setEvents((prev) => [created, ...prev]);
          } else {
            const id = activeEvent.id!;
            const updated = await updateEvent(id, payload);
            setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
          }
        }}
        onDelete={
          modalMode === "edit"
            ? async () => {
                const id = activeEvent.id!;
                await deleteEvent(id);
                setEvents((prev) => prev.filter((e) => e.id !== id));
              }
            : undefined
        }
      />
    </div>
  );
}
