import * as z from "zod";
import { textResult } from "../utils/text.js";

const inboxPlatformSchema = z.enum([
  "whatsapp",
  "telegram",
  "facebook",
  "instagram",
]);

export function registerConversationTools(server, client) {
  server.registerTool(
    "messlo_list_chats",
    {
      description:
        "List recent conversations (unified inbox). WhatsApp and omnichannel. For omnichannel, whatsapp_phone_number_id is the connection id (Telegram bot id, FB page id, or IG account id).",
      inputSchema: {
        whatsapp_phone_number_id: z
          .string()
          .optional()
          .describe(
            "Phone number id (WhatsApp) or connection id (Telegram/FB/IG); uses primary if omitted"
          ),
        platform: inboxPlatformSchema
          .optional()
          .describe("Filter inbox by platform"),
        search: z.string().optional(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(50).optional().default(15),
        provider: z.string().optional(),
      },
    },
    async ({ whatsapp_phone_number_id, platform, search, page, limit, provider }) => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (whatsapp_phone_number_id) {
        qs.set("whatsapp_phone_number_id", whatsapp_phone_number_id);
      }
      if (platform) qs.set("platform", platform);
      if (search) qs.set("search", search);
      if (provider) qs.set("provider", provider);
      return textResult(await client.get(`/api/whatsapp/chats?${qs}`));
    }
  );

  server.registerTool(
    "messlo_list_messages",
    {
      description:
        "List messages in a conversation thread. Requires contact_id from messlo_list_chats or messlo_list_contacts.",
      inputSchema: {
        contact_id: z.string().describe("Contact MongoDB _id"),
        whatsapp_phone_number_id: z.string().optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(30),
        start_date: z.string().optional().describe("ISO date YYYY-MM-DD"),
        end_date: z.string().optional().describe("ISO date YYYY-MM-DD"),
      },
    },
    async (args) => {
      const qs = new URLSearchParams({
        contact_id: args.contact_id,
        page: String(args.page),
        limit: String(args.limit),
      });
      if (args.whatsapp_phone_number_id) {
        qs.set("whatsapp_phone_number_id", args.whatsapp_phone_number_id);
      }
      if (args.search) qs.set("search", args.search);
      if (args.start_date) qs.set("start_date", args.start_date);
      if (args.end_date) qs.set("end_date", args.end_date);
      return textResult(await client.get(`/api/whatsapp/messages?${qs}`));
    }
  );
}
