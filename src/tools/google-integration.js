import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerGoogleIntegrationTools(server, client) {
  server.registerTool(
    "messlo_google_connect_url",
    {
      description:
        "Get Google OAuth URL to connect Sheets/Calendar (open in browser; completes via callback).",
      inputSchema: {
        return_to: z.string().optional().default("/google_account"),
      },
    },
    async ({ return_to }) => {
      const qs = new URLSearchParams();
      if (return_to) qs.set("return_to", return_to);
      return textResult(await client.get(`/api/google/connect?${qs}`));
    }
  );

  server.registerTool(
    "messlo_list_google_accounts",
    {
      description: "List connected Google accounts.",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/google/accounts"))
  );

  server.registerTool(
    "messlo_list_google_calendars",
    {
      description:
        "List calendars for a Google account (use calendar Mongo id for events).",
      inputSchema: { google_account_id: z.string() },
    },
    async ({ google_account_id }) => {
      return textResult(
        await client.get(`/api/google/accounts/${google_account_id}/calendars`)
      );
    }
  );

  server.registerTool(
    "messlo_create_google_calendar_event",
    {
      description:
        "Create a calendar event (automation create_calendar_event nodes use linked calendars).",
      inputSchema: {
        calendar_id: z.string().describe("MongoDB GoogleCalendar _id"),
        summary: z.string(),
        description: z.string().optional(),
        start: z.string().describe("ISO datetime"),
        end: z.string().describe("ISO datetime"),
      },
    },
    async ({ calendar_id, ...body }) => {
      return textResult(
        await client.post(`/api/google/calendars/${calendar_id}/events`, body)
      );
    }
  );

  server.registerTool(
    "messlo_list_google_sheets",
    {
      description: "List linked Google Sheets for an account.",
      inputSchema: { google_account_id: z.string() },
    },
    async ({ google_account_id }) => {
      return textResult(
        await client.get(`/api/google/accounts/${google_account_id}/sheets`)
      );
    }
  );

  server.registerTool(
    "messlo_write_google_sheet",
    {
      description:
        "Append/update sheet values (automation save_to_google_sheet uses linked sheets).",
      inputSchema: {
        sheet_id: z.string().describe("MongoDB GoogleSheet _id"),
        range: z.string().optional().default("A1"),
        values: z
          .array(z.array(z.union([z.string(), z.number(), z.boolean()])))
          .describe("2D array e.g. [[\"Name\",\"Phone\"],[\"Jane\",\"919...\"]]"),
      },
    },
    async ({ sheet_id, range, values }) => {
      return textResult(
        await client.post(`/api/google/sheets/${sheet_id}/values`, { range, values })
      );
    }
  );

  server.registerTool(
    "messlo_read_google_sheet",
    {
      description: "Read values from a linked Google Sheet.",
      inputSchema: {
        sheet_id: z.string(),
        range: z.string().optional(),
      },
    },
    async ({ sheet_id, range }) => {
      const qs = range ? `?range=${encodeURIComponent(range)}` : "";
      return textResult(await client.get(`/api/google/sheets/${sheet_id}${qs}`));
    }
  );
}
