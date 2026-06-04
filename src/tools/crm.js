import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerCrmTools(server, client) {
  server.registerTool(
    "messlo_list_segments",
    {
      description: "List contact segments (for add_to_segment automation nodes and campaigns).",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(50),
        search: z.string().optional(),
      },
    },
    async ({ page, limit, search }) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) qs.set("search", search);
      return textResult(await client.get(`/api/segments?${qs}`));
    }
  );

  server.registerTool(
    "messlo_create_segment",
    {
      description: "Create a contact segment.",
      inputSchema: {
        name: z.string(),
        description: z.string().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...body }) => {
      return textResult(await client.post("/api/segments", { ...body, ...(extra || {}) }));
    }
  );

  server.registerTool(
    "messlo_list_tags",
    {
      description: "List tags (for add_tag automation nodes).",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(50),
        search: z.string().optional(),
      },
    },
    async ({ page, limit, search }) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) qs.set("search", search);
      return textResult(await client.get(`/api/tags?${qs}`));
    }
  );

  server.registerTool(
    "messlo_create_tag",
    {
      description: "Create a tag (label used by add_tag nodes or contact tagging).",
      inputSchema: {
        label: z.string(),
        color: z.string().optional().describe("Hex color e.g. #e11d48"),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...body }) => {
      return textResult(await client.post("/api/tags", { ...body, ...(extra || {}) }));
    }
  );

  server.registerTool(
    "messlo_list_custom_fields",
    {
      description:
        "List CRM custom field definitions (use field name as field_key in update_contact automation nodes).",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(50),
      },
    },
    async ({ page, limit }) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      return textResult(await client.get(`/api/custom-fields?${qs}`));
    }
  );

  server.registerTool(
    "messlo_create_custom_field",
    {
      description:
        "Create a CRM custom field (use `name` as field_key in update_contact automation nodes).",
      inputSchema: {
        name: z
          .string()
          .describe("Snake_case key, e.g. project_interest, budget"),
        label: z.string(),
        type: z
          .enum([
            "text",
            "number",
            "date",
            "boolean",
            "select",
            "textarea",
            "email",
            "phone",
          ])
          .default("text"),
        required: z.boolean().optional(),
        options: z
          .array(z.string())
          .optional()
          .describe("Required when type is select"),
        placeholder: z.string().optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional().default(true),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...body }) => {
      return textResult(
        await client.post("/api/custom-fields", { ...body, ...(extra || {}) })
      );
    }
  );
}
