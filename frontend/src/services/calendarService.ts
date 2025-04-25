import axios from 'axios';

const BASE = `${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`;
const CALENDAR_URL = `${BASE}/api/calendar`;

export interface CalendarEvent {
  event_id: number;
  event_title: string;
  event_date: string;
  event_type: string;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const res = await axios.get<{ events: CalendarEvent[] }>(CALENDAR_URL);
  return res.data.events;
}

export async function createCalendarEvent(data: {
  event_title: string;
  event_date: string;
  event_type?: string;
}): Promise<CalendarEvent> {
  const res = await axios.post<{ event: CalendarEvent }>(CALENDAR_URL, data);
  return res.data.event;
}

export async function deleteCalendarEvent(id: number): Promise<void> {
  await axios.delete(`${CALENDAR_URL}/${id}`);
}

export async function updateCalendarEvent(
  id: number,
  data: { event_title?: string; event_date?: string; event_type?: string }
): Promise<CalendarEvent> {
  const res = await axios.put<{ event: CalendarEvent }>(`${CALENDAR_URL}/${id}`, data);
  return res.data.event;
}
