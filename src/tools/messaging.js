import * as z from "zod";
import { textResult } from "../utils/text.js";

const messageTypeSchema = z.enum([
  "text",
  "image",
  "video",
  "audio",
  "document",
  "location",
  "carousel",
]);

const platformSchema = z.enum(["telegram", "facebook", "instagram"]);

export function registerMessagingTools(server, client) {
  server.registerTool(
    "messlo_send_message",
    {
      description:
        "Send a message via Messlo. WhatsApp: contact_no + whatsapp_phone_number. Omnichannel (Telegram/Facebook/Instagram): contact_id (preferred for FB/IG) or platform + recipient_id (Telegram direct). Same endpoint POST /api/whatsapp/send.",
      inputSchema: {
        contact_no: z
          .string()
          .optional()
          .describe("WhatsApp recipient phone, e.g. 919876543210"),
        whatsapp_phone_number: z
          .string()
          .optional()
          .describe("Your WhatsApp sender number (digits, no +)"),
        contact_id: z
          .string()
          .optional()
          .describe("Contact MongoDB _id — preferred for facebook/instagram"),
        platform: platformSchema
          .optional()
          .describe("Omnichannel platform when not using WhatsApp phone"),
        recipient_id: z
          .string()
          .optional()
          .describe("Telegram chat id for direct telegram send"),
        workspace_id: z.string().optional(),
        messageType: messageTypeSchema.default("text"),
        message: z.string().optional().describe("Text or caption"),
        mediaUrl: z.string().url().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        buttons: z.array(z.record(z.unknown())).optional(),
        buttonParams: z.record(z.unknown()).optional(),
        reactionMessageId: z.string().optional(),
        reactionEmoji: z.string().optional(),
        carouselCardsData: z.array(z.record(z.unknown())).optional(),
        extra: z
          .record(z.unknown())
          .optional()
          .describe("Additional fields for carousel/advanced payloads"),
      },
    },
    async (args) => {
      const { extra, platform, contact_id, recipient_id, contact_no, whatsapp_phone_number, ...base } = args;
      const isOmnichannel = platform || contact_id || recipient_id;
      if (!isOmnichannel && (!contact_no || !whatsapp_phone_number)) {
        return textResult({
          error:
            "WhatsApp send requires contact_no and whatsapp_phone_number. Omnichannel requires contact_id or (platform + recipient_id for telegram).",
        });
      }
      const payload = {
        ...base,
        contact_no,
        whatsapp_phone_number,
        contact_id,
        platform,
        recipient_id,
        ...(extra || {}),
      };
      const result = await client.post("/api/whatsapp/send", payload);
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_send_template",
    {
      description:
        "Send an approved template via POST /api/whatsapp/send. WhatsApp: contact_no + whatsapp_phone_number. Omnichannel: contact_id. Use messlo_list_templates to find template_name.",
      inputSchema: {
        contact_no: z.string().optional().describe("WhatsApp recipient phone"),
        whatsapp_phone_number: z
          .string()
          .optional()
          .describe("Your WhatsApp sender number"),
        contact_id: z
          .string()
          .optional()
          .describe("Contact _id for omnichannel template send"),
        platform: platformSchema.optional(),
        workspace_id: z.string().optional(),
        template_name: z.string().optional().describe("Lowercase template name"),
        template_id: z.string().optional().describe("MongoDB template _id"),
        templateVariables: z
          .record(z.union([z.string(), z.number()]))
          .optional()
          .describe("Body/header variables, e.g. { \"1\": \"John\", \"2\": \"ORDER-1\" }"),
        mediaUrl: z
          .string()
          .url()
          .optional()
          .describe("Dynamic header media URL (PDF/image per order)"),
        languageCode: z.string().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async (args) => {
      const { extra, template_name, template_id, contact_no, whatsapp_phone_number, contact_id, platform, ...rest } = args;
      if (!template_name && !template_id) {
        return textResult({
          error: "template_name or template_id is required",
        });
      }
      const isOmnichannel = platform || contact_id;
      if (!isOmnichannel && (!contact_no || !whatsapp_phone_number)) {
        return textResult({
          error:
            "WhatsApp template send requires contact_no and whatsapp_phone_number, or use contact_id for omnichannel.",
        });
      }
      const payload = {
        messageType: "template",
        templateName: template_name,
        templateId: template_id,
        contact_no,
        whatsapp_phone_number,
        contact_id,
        platform,
        ...rest,
        ...(extra || {}),
      };
      return textResult(await client.post("/api/whatsapp/send", payload));
    }
  );
}
