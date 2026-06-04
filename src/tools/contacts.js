import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerContactTools(server, client) {
  server.registerTool(
    "messlo_create_contact",
    {
      description: "Create a contact in Messlo.",
      inputSchema: {
        phone_number: z.string().describe("E.164 or national format, e.g. +919876543210"),
        name: z.string().optional(),
        email: z.string().email().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...fields }) => {
      const result = await client.post("/api/contacts", {
        ...fields,
        ...(extra || {}),
      });
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_list_contacts",
    {
      description: "List contacts with optional pagination.",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
        search: z.string().optional(),
      },
    },
    async ({ page, limit, search }) => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) qs.set("search", search);
      const result = await client.get(`/api/contacts?${qs}`);
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_get_contact",
    {
      description: "Get a single contact by MongoDB id.",
      inputSchema: {
        contact_id: z.string().describe("Contact _id"),
      },
    },
    async ({ contact_id }) => {
      return textResult(await client.get(`/api/contacts/${contact_id}`));
    }
  );

  server.registerTool(
    "messlo_update_contact",
    {
      description:
        "Update contact fields, tags, segments, or custom_fields (same fields automation update_contact nodes use).",
      inputSchema: {
        contact_id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone_number: z.string().optional(),
        custom_fields: z.record(z.unknown()).optional(),
        tags: z.array(z.string()).optional().describe("Tag ids"),
        segments: z.array(z.string()).optional().describe("Segment ids"),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ contact_id, extra, ...body }) => {
      return textResult(
        await client.put(`/api/contacts/${contact_id}`, { ...body, ...(extra || {}) })
      );
    }
  );

  server.registerTool(
    "messlo_delete_contacts",
    {
      description: "Bulk delete contacts by id. Requires confirm: true.",
      inputSchema: {
        contact_ids: z.array(z.string()).min(1),
        confirm: z.boolean().describe("Must be true to delete"),
      },
    },
    async ({ contact_ids, confirm }) => {
      if (confirm !== true) {
        return textResult({ error: "Set confirm: true to delete contacts." });
      }
      return textResult(
        await client.delete("/api/contacts/delete", { ids: contact_ids })
      );
    }
  );
}
