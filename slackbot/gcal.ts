/**
 * Google Calendar tools for Pidgi (Route B: service account + calendar sharing).
 *
 * The bot authenticates as a Google service account (no domain-wide delegation).
 * Each team member shares their Google Calendar with the service account's email
 * and grants "Make changes to events". The bot then reads and writes only those
 * shared calendars, addressed by the owner's email as the calendarId.
 *
 * Enabled only when GOOGLE_SERVICE_ACCOUNT_JSON is set (the full service-account
 * JSON key, as a single-line string).
 */
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const DEFAULT_TZ = "Europe/Brussels";

export function gcalEnabled(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
}

function calendarClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  const creds = JSON.parse(raw);
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });
  return google.calendar({ version: "v3", auth });
}

export const gcalToolDefs = [
  {
    name: "gcal_list_events",
    description:
      "List Google Calendar events for a person over a time range. calendar_email is the owner's email (e.g. jonas@peaknine.studio) and must have shared their calendar with the bot's service account. Times are ISO 8601. Google Calendar shows the REAL meetings and commitments that Teamleader planning does not include, so use this to judge true availability.",
    input_schema: {
      type: "object",
      properties: {
        calendar_email: { type: "string", description: "Calendar owner's email" },
        time_min: { type: "string", description: "Start of range, ISO 8601 (e.g. 2026-06-16T00:00:00+02:00)" },
        time_max: { type: "string", description: "End of range, ISO 8601" },
        query: { type: "string", description: "Optional text filter" },
      },
      required: ["calendar_email", "time_min", "time_max"],
    },
  },
  {
    name: "gcal_create_event",
    description:
      "Create (book) a Google Calendar event on someone's calendar. calendar_email is the owner's email (must be shared with the bot). start/end are ISO 8601. Optionally invite attendees by email.",
    input_schema: {
      type: "object",
      properties: {
        calendar_email: { type: "string" },
        summary: { type: "string", description: "Event title" },
        start: { type: "string", description: "Start, ISO 8601" },
        end: { type: "string", description: "End, ISO 8601" },
        description: { type: "string" },
        location: { type: "string" },
        attendees: { type: "array", items: { type: "string" }, description: "Attendee emails" },
        recurrence: {
          type: "array",
          items: { type: "string" },
          description: "Optional RFC5545 RRULE strings for a recurring event, e.g. ['RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=12']",
        },
        time_zone: { type: "string", description: `IANA timezone, default ${DEFAULT_TZ}` },
      },
      required: ["calendar_email", "summary", "start", "end"],
    },
  },
  {
    name: "gcal_update_event",
    description:
      "Update or move an existing Google Calendar event. Provide calendar_email and event_id; only the fields you pass are changed.",
    input_schema: {
      type: "object",
      properties: {
        calendar_email: { type: "string" },
        event_id: { type: "string" },
        summary: { type: "string" },
        start: { type: "string", description: "New start, ISO 8601" },
        end: { type: "string", description: "New end, ISO 8601" },
        description: { type: "string" },
        location: { type: "string" },
        time_zone: { type: "string" },
      },
      required: ["calendar_email", "event_id"],
    },
  },
  {
    name: "gcal_delete_event",
    description: "Delete or cancel a Google Calendar event by calendar_email and event_id. Cannot be undone.",
    input_schema: {
      type: "object",
      properties: {
        calendar_email: { type: "string" },
        event_id: { type: "string" },
      },
      required: ["calendar_email", "event_id"],
    },
  },
];

export async function handleGcalTool(name: string, input: any): Promise<{ text: string; isError: boolean }> {
  try {
    const cal = calendarClient();
    const tz = input.time_zone || DEFAULT_TZ;

    if (name === "gcal_list_events") {
      const res = await cal.events.list({
        calendarId: input.calendar_email,
        timeMin: input.time_min,
        timeMax: input.time_max,
        singleEvents: true,
        orderBy: "startTime",
        q: input.query,
        maxResults: 100,
      });
      const items = (res.data.items || []).map((e) => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        attendees: (e.attendees || []).map((a) => a.email),
        status: e.status,
      }));
      return { text: JSON.stringify({ data: items }, null, 2), isError: false };
    }

    if (name === "gcal_create_event") {
      const res = await cal.events.insert({
        calendarId: input.calendar_email,
        sendUpdates: "all",
        requestBody: {
          summary: input.summary,
          description: input.description,
          location: input.location,
          start: { dateTime: input.start, timeZone: tz },
          end: { dateTime: input.end, timeZone: tz },
          attendees: (input.attendees || []).map((email: string) => ({ email })),
          ...(Array.isArray(input.recurrence) && input.recurrence.length ? { recurrence: input.recurrence } : {}),
        },
      });
      return { text: JSON.stringify({ id: res.data.id, htmlLink: res.data.htmlLink }, null, 2), isError: false };
    }

    if (name === "gcal_update_event") {
      const body: Record<string, unknown> = {};
      if (input.summary !== undefined) body.summary = input.summary;
      if (input.description !== undefined) body.description = input.description;
      if (input.location !== undefined) body.location = input.location;
      if (input.start !== undefined) body.start = { dateTime: input.start, timeZone: tz };
      if (input.end !== undefined) body.end = { dateTime: input.end, timeZone: tz };
      const res = await cal.events.patch({
        calendarId: input.calendar_email,
        eventId: input.event_id,
        sendUpdates: "all",
        requestBody: body,
      });
      return { text: JSON.stringify({ id: res.data.id, updated: true }, null, 2), isError: false };
    }

    if (name === "gcal_delete_event") {
      await cal.events.delete({
        calendarId: input.calendar_email,
        eventId: input.event_id,
        sendUpdates: "all",
      });
      return { text: `Deleted event ${input.event_id} from ${input.calendar_email}.`, isError: false };
    }

    return { text: `Unknown Google Calendar tool: ${name}`, isError: true };
  } catch (e: any) {
    return { text: `Google Calendar error in ${name}: ${e?.message || e}`, isError: true };
  }
}
