import * as z from "zod";
import { textResult } from "../utils/text.js";
import { loadBundledDocs } from "../bundled/load-docs.js";

const presetSchema = z.enum([
  "simple",
  "variables",
  "otp",
  "quick_reply",
  "carousel",
]);

export function registerTemplateTools(server, client) {
  server.registerTool(
    "messlo_create_template",
    {
      description:
        "Create and submit a WhatsApp message template to Meta. Media headers use a public HTTPS URL; Messlo verifies the URL is reachable before submitting to Meta (same requirement WhatsApp has).",
      inputSchema: {
        preset: presetSchema.optional().describe(
          "simple | variables | otp | quick_reply | carousel — merges example structure"
        ),
        waba_id: z.string().describe("WABA ID from messlo_list_connections"),
        template_name: z
          .string()
          .describe("Lowercase snake_case template name"),
        category: z
          .enum(["MARKETING", "UTILITY", "AUTHENTICATION"])
          .optional(),
        language: z.string().optional().default("en_US"),
        message_body: z.string().optional(),
        footer_text: z.string().optional(),
        header_text: z.string().optional(),
        header_url: z
          .string()
          .url()
          .optional()
          .describe(
            "Public https URL for media header (image, video, or PDF). Example: invoice PDF on CDN."
          ),
        header_media_type: z
          .enum(["image", "video", "document", "audio"])
          .optional()
          .describe("Hint when URL extension is ambiguous (e.g. document for PDF)"),
        buttons: z.array(z.record(z.unknown())).optional(),
        variable_examples: z.array(z.record(z.unknown())).optional(),
        otp_buttons: z.array(z.record(z.unknown())).optional(),
        carousel_cards: z.array(z.record(z.unknown())).optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async (args) => {
      const docs = loadBundledDocs();
      const { preset, extra, ...fields } = args;
      let payload = { ...fields };

      if (preset && docs.templatePresets?.[preset]) {
        const example = { ...docs.templatePresets[preset] };
        delete example._example_title;
        payload = { ...example, ...payload };
      }

      if (!payload.category) payload.category = "MARKETING";
      if (!payload.language) payload.language = "en_US";
      if (fields.header_url && !payload.header_media_type && fields.preset) {
        const mediaPresets = { simple: "image", variables: "image" };
        payload.header_media_type =
          payload.header_media_type || mediaPresets[fields.preset];
      }
      if (extra) payload = { ...payload, ...extra };

      const result = await client.post("/api/template/create", payload);
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_list_templates",
    {
      description: "List WhatsApp message templates in the workspace.",
      inputSchema: {
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ page, limit }) => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (limit) qs.set("limit", String(limit));
      const q = qs.toString();
      const result = await client.get(`/api/template${q ? `?${q}` : ""}`);
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_validate_template_media_url",
    {
      description:
        "Check that a media URL is publicly reachable before creating a template (Messlo runs the same check Meta requires).",
      inputSchema: {
        url: z.string().url(),
        media_type: z
          .enum(["image", "video", "document", "audio"])
          .optional(),
      },
    },
    async ({ url, media_type }) => {
      const result = await client.post("/api/template/validate-media-url", {
        url,
        media_type,
      });
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_update_template",
    {
      description:
        "Update an existing template (e.g. fix rejected copy). JSON body; use header_url for media header changes (public HTTPS URL).",
      inputSchema: {
        template_id: z.string().describe("MongoDB template _id"),
        template_name: z.string().optional(),
        category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]).optional(),
        language: z.string().optional(),
        message_body: z.string().optional(),
        footer_text: z.string().optional(),
        header_text: z.string().optional(),
        header_url: z.string().url().optional(),
        header_media_type: z
          .enum(["image", "video", "document", "audio"])
          .optional(),
        buttons: z.array(z.record(z.unknown())).optional(),
        variable_examples: z.record(z.unknown()).optional(),
        carousel_cards: z.array(z.record(z.unknown())).optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ template_id, extra, header_media_type, header_url, ...fields }) => {
      const payload = { ...fields, ...(extra || {}) };
      if (header_url) {
        payload.header_url = header_url;
        if (header_media_type) payload.header_media_type = header_media_type;
      }
      return textResult(await client.put(`/api/template/${template_id}`, payload));
    }
  );

  server.registerTool(
    "messlo_sync_templates_status",
    {
      description:
        "Refresh Meta approval status for templates on a WABA (no full catalog pull).",
      inputSchema: {
        waba_id: z.string(),
        template_ids: z.array(z.string()).optional(),
      },
    },
    async ({ waba_id, template_ids }) => {
      return textResult(
        await client.post("/api/template/sync-status", {
          waba_id,
          ...(template_ids?.length ? { template_ids } : {}),
        })
      );
    }
  );

  server.registerTool(
    "messlo_sync_templates",
    {
      description:
        "Sync templates from Meta and refresh approval statuses for a WABA.",
      inputSchema: {
        waba_id: z.string().describe("WABA id from messlo_list_connections"),
        sync_status_only: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, only refresh statuses (skip full Meta pull)"),
        template_ids: z.array(z.string()).optional(),
      },
    },
    async ({ waba_id, sync_status_only, template_ids }) => {
      if (sync_status_only) {
        return textResult(
          await client.post("/api/template/sync-status", {
            waba_id,
            ...(template_ids?.length ? { template_ids } : {}),
          })
        );
      }
      const sync = await client.post("/api/template/sync", {
        waba_id,
        sync_all: true,
      });
      const status = await client.post("/api/template/sync-status", { waba_id });
      return textResult({ sync, status });
    }
  );

  server.registerTool(
    "messlo_delete_template",
    {
      description:
        "Delete a template from Messlo and Meta. Requires confirm: true.",
      inputSchema: {
        template_id: z.string().describe("MongoDB template _id"),
        confirm: z.boolean().describe("Must be true to delete"),
      },
    },
    async ({ template_id, confirm }) => {
      if (confirm !== true) {
        return textResult({ error: "Set confirm: true to delete this template." });
      }
      return textResult(await client.delete(`/api/template/${template_id}`));
    }
  );
}
