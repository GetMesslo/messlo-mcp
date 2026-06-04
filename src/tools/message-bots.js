import * as z from "zod";
import { textResult } from "../utils/text.js";

const replyTypeSchema = z.enum([
  "text",
  "media",
  "template",
  "catalog",
  "chatbot",
  "agent",
  "sequence",
  "flow",
  "appointment_flow",
]);

async function resolveReplyId(client, args) {
  const {
    waba_id,
    reply_type,
    reply_id,
    reply_content,
    reply_material_name,
  } = args;

  if (reply_id) return reply_id;

  if (reply_type === "text" && reply_content) {
    const material = await client.post("/api/reply-materials", {
      waba_id,
      type: "text",
      name:
        reply_material_name ||
        `Bot: ${(args.keywords || []).slice(0, 2).join(", ") || "auto"}`,
      content: reply_content,
    });
    const id = material?.data?._id || material?.data?.id;
    if (!id) {
      throw new Error(
        "Failed to create reply material for text message bot"
      );
    }
    return String(id);
  }

  throw new Error(
    "reply_id is required unless reply_type is text with reply_content"
  );
}

export function registerMessageBotTools(server, client) {
  server.registerTool(
    "messlo_list_message_bots",
    {
      description:
        "List keyword auto-reply bots (message bots) for a WABA.",
      inputSchema: {
        waba_id: z.string(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
        search: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      },
    },
    async ({ waba_id, page, limit, search, status }) => {
      const qs = new URLSearchParams({
        waba_id,
        page: String(page),
        limit: String(limit),
      });
      if (search) qs.set("search", search);
      if (status) qs.set("status", status);
      return textResult(await client.get(`/api/message-bots?${qs}`));
    }
  );

  server.registerTool(
    "messlo_get_message_bot",
    {
      description: "Get one message bot by id.",
      inputSchema: { message_bot_id: z.string() },
    },
    async ({ message_bot_id }) => {
      return textResult(await client.get(`/api/message-bots/${message_bot_id}`));
    }
  );

  server.registerTool(
    "messlo_create_message_bot",
    {
      description:
        "Create keyword auto-reply. For text replies, pass reply_content (creates reply material) OR reply_id.",
      inputSchema: {
        waba_id: z.string(),
        keywords: z.array(z.string()).min(1),
        matching_method: z
          .enum(["exact", "contains", "starts_with", "ends_with", "partial"])
          .optional()
          .default("contains"),
        partial_percentage: z.number().min(0).max(100).optional(),
        reply_type: replyTypeSchema,
        reply_id: z.string().optional(),
        reply_content: z
          .string()
          .optional()
          .describe("Text body when reply_type is text (auto-creates material)"),
        reply_material_name: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional().default("active"),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async (args) => {
      const { extra, reply_content, reply_material_name, ...rest } = args;
      const reply_id = await resolveReplyId(client, {
        ...rest,
        reply_content,
        reply_material_name,
      });
      return textResult(
        await client.post("/api/message-bots", {
          ...rest,
          reply_id,
          ...(extra || {}),
        })
      );
    }
  );

  server.registerTool(
    "messlo_update_message_bot",
    {
      description: "Update message bot keywords, matching, or reply target.",
      inputSchema: {
        message_bot_id: z.string(),
        keywords: z.array(z.string()).optional(),
        matching_method: z
          .enum(["exact", "contains", "starts_with", "ends_with", "partial"])
          .optional(),
        reply_type: replyTypeSchema.optional(),
        reply_id: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ message_bot_id, extra, ...body }) => {
      return textResult(
        await client.put(`/api/message-bots/${message_bot_id}`, {
          ...body,
          ...(extra || {}),
        })
      );
    }
  );

  server.registerTool(
    "messlo_delete_message_bot",
    {
      description: "Delete a message bot. Requires confirm: true.",
      inputSchema: {
        message_bot_id: z.string(),
        confirm: z.boolean().optional().default(false),
      },
    },
    async ({ message_bot_id, confirm }) => {
      if (!confirm) {
        return textResult({
          deleted: false,
          hint: "Set confirm: true to delete.",
          message_bot_id,
        });
      }
      return textResult(await client.delete(`/api/message-bots/${message_bot_id}`));
    }
  );

  server.registerTool(
    "messlo_create_reply_material",
    {
      description:
        "Create saved reply content (text) for message bots or other features.",
      inputSchema: {
        waba_id: z.string(),
        name: z.string(),
        content: z.string(),
        type: z.enum(["text", "flow"]).optional().default("text"),
        flow_id: z.string().optional(),
        button_text: z.string().optional(),
      },
    },
    async (body) => {
      return textResult(await client.post("/api/reply-materials", body));
    }
  );
}
