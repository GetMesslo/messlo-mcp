import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerWhatsAppSetupTools(server, client) {
  server.registerTool(
    "messlo_setup_waba_webhooks",
    {
      description:
        "Register Meta webhook subscriptions for a WABA (Business API only). Run after connecting WhatsApp so inbound messages and delivery events reach Messlo.",
      inputSchema: {
        waba_id: z
          .string()
          .describe("MongoDB WABA _id from messlo_list_connections"),
      },
    },
    async ({ waba_id }) => {
      return textResult(
        await client.post(`/api/whatsapp/${waba_id}/webhooks/setup`, {})
      );
    }
  );
}
