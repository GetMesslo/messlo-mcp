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

export function registerMessagingTools(server, client) {
  server.registerTool(
    "messlo_send_message",
    {
      description:
        "Send a WhatsApp message via Messlo. contact_no is the recipient; whatsapp_phone_number is your registered sender number (digits, no +).",
      inputSchema: {
        contact_no: z.string().describe("Recipient phone, e.g. 919876543210"),
        whatsapp_phone_number: z
          .string()
          .describe("Your sender number registered in Messlo"),
        messageType: messageTypeSchema.default("text"),
        message: z.string().optional().describe("Text or caption"),
        mediaUrl: z.string().url().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        extra: z
          .record(z.unknown())
          .optional()
          .describe("Additional fields for carousel/advanced payloads"),
      },
    },
    async (args) => {
      const { extra, ...base } = args;
      const payload = { ...base, ...(extra || {}) };
      const result = await client.post("/api/whatsapp/send", payload);
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_send_template",
    {
      description:
        "Send an approved WhatsApp template via POST /api/whatsapp/send. Use messlo_list_templates to find template_name.",
      inputSchema: {
        contact_no: z.string().describe("Recipient phone, e.g. 919876543210"),
        whatsapp_phone_number: z
          .string()
          .describe("Your sender number registered in Messlo"),
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
      const { extra, template_name, template_id, ...rest } = args;
      if (!template_name && !template_id) {
        return textResult({
          error: "template_name or template_id is required",
        });
      }
      const payload = {
        messageType: "template",
        templateName: template_name,
        templateId: template_id,
        ...rest,
        ...(extra || {}),
      };
      return textResult(await client.post("/api/whatsapp/send", payload));
    }
  );
}
