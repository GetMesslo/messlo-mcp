import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerSequenceTools(server, client) {
  server.registerTool(
    "messlo_list_sequences",
    {
      description: "List drip/follow-up sequences for a WABA.",
      inputSchema: { waba_id: z.string() },
    },
    async ({ waba_id }) => {
      const qs = new URLSearchParams({ waba_id });
      return textResult(await client.get(`/api/sequences?${qs}`));
    }
  );

  server.registerTool(
    "messlo_get_sequence",
    {
      description: "Get sequence with ordered steps.",
      inputSchema: { sequence_id: z.string() },
    },
    async ({ sequence_id }) => {
      return textResult(await client.get(`/api/sequences/${sequence_id}`));
    }
  );

  server.registerTool(
    "messlo_create_sequence",
    {
      description: "Create a new message sequence.",
      inputSchema: {
        waba_id: z.string(),
        name: z.string(),
      },
    },
    async (body) => {
      return textResult(await client.post("/api/sequences", body));
    }
  );

  server.registerTool(
    "messlo_update_sequence",
    {
      description: "Update sequence name or active flag.",
      inputSchema: {
        sequence_id: z.string(),
        name: z.string().optional(),
        is_active: z.boolean().optional(),
      },
    },
    async ({ sequence_id, ...body }) => {
      return textResult(await client.put(`/api/sequences/${sequence_id}`, body));
    }
  );

  server.registerTool(
    "messlo_delete_sequence",
    {
      description: "Delete a sequence. Requires confirm: true.",
      inputSchema: {
        sequence_id: z.string(),
        confirm: z.boolean().optional().default(false),
      },
    },
    async ({ sequence_id, confirm }) => {
      if (!confirm) {
        return textResult({
          deleted: false,
          hint: "Set confirm: true to delete.",
          sequence_id,
        });
      }
      return textResult(await client.delete(`/api/sequences/${sequence_id}`));
    }
  );

  server.registerTool(
    "messlo_create_sequence_step",
    {
      description:
        "Add a step to a sequence (requires reply_material_id from messlo_create_reply_material).",
      inputSchema: {
        sequence_id: z.string(),
        reply_material_id: z.string(),
        reply_material_type: z
          .string()
          .optional()
          .default("ReplyMaterial"),
        delay_value: z.number().int().optional().default(1),
        delay_unit: z
          .enum(["minutes", "hours", "days"])
          .optional()
          .default("days"),
        sort: z.number().int().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...body }) => {
      return textResult(
        await client.post("/api/sequences/steps", { ...body, ...(extra || {}) })
      );
    }
  );
}
