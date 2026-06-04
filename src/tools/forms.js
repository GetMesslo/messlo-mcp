import * as z from "zod";
import { textResult } from "../utils/text.js";

const formFieldSchema = z
  .object({
    id: z.string().optional(),
    type: z.string(),
    label: z.string(),
    name: z.string().optional(),
    required: z.boolean().optional(),
    step: z.number().int().optional(),
    order: z.number().int().optional(),
    options: z.array(z.record(z.unknown())).optional(),
  })
  .passthrough();

export function registerFormTools(server, client) {
  server.registerTool(
    "messlo_list_forms",
    {
      description:
        "List WhatsApp Flow / Meta forms for a WABA. Use form.flow.flow_id as form_id in form_flow automation nodes.",
      inputSchema: {
        waba_id: z.string(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
        search: z.string().optional(),
        meta_status: z.string().optional(),
        category: z.string().optional(),
      },
    },
    async ({ waba_id, page, limit, search, meta_status, category }) => {
      const qs = new URLSearchParams({
        waba_id,
        page: String(page),
        limit: String(limit),
      });
      if (search) qs.set("search", search);
      if (meta_status) qs.set("meta_status", meta_status);
      if (category) qs.set("category", category);
      return textResult(await client.get(`/api/forms?${qs}`));
    }
  );

  server.registerTool(
    "messlo_get_form",
    {
      description:
        "Get form by id including flow.flow_id for automation form_flow nodes.",
      inputSchema: { form_id: z.string() },
    },
    async ({ form_id }) => {
      return textResult(await client.get(`/api/forms/${form_id}`));
    }
  );

  server.registerTool(
    "messlo_create_form",
    {
      description:
        "Create a WhatsApp Flow form (Meta flow created on save). fields[] define steps.",
      inputSchema: {
        waba_id: z.string(),
        name: z.string(),
        category: z.string().optional().default("CUSTOM"),
        description: z.string().optional(),
        fields: z.array(formFieldSchema).min(1),
        is_active: z.boolean().optional(),
        submit_settings: z.record(z.unknown()).optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...body }) => {
      return textResult(
        await client.post("/api/forms", { ...body, ...(extra || {}) })
      );
    }
  );

  server.registerTool(
    "messlo_update_form",
    {
      description: "Update form fields or metadata (PATCH).",
      inputSchema: {
        form_id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        fields: z.array(formFieldSchema).optional(),
        is_active: z.boolean().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ form_id, extra, ...body }) => {
      return textResult(
        await client.patch(`/api/forms/${form_id}`, { ...body, ...(extra || {}) })
      );
    }
  );

  server.registerTool(
    "messlo_publish_form",
    {
      description:
        "Publish form Meta Flow (required before using in WhatsApp).",
      inputSchema: { form_id: z.string() },
    },
    async ({ form_id }) => {
      return textResult(await client.patch(`/api/forms/${form_id}/publish`));
    }
  );

  server.registerTool(
    "messlo_delete_form",
    {
      description: "Delete a form. Requires confirm: true.",
      inputSchema: {
        form_id: z.string(),
        confirm: z.boolean().optional().default(false),
      },
    },
    async ({ form_id, confirm }) => {
      if (!confirm) {
        return textResult({
          deleted: false,
          hint: "Set confirm: true to delete.",
          form_id,
        });
      }
      return textResult(await client.delete(`/api/forms/${form_id}`));
    }
  );
}
