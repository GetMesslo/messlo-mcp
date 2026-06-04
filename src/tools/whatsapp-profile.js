import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerWhatsAppProfileTools(server, client) {
  server.registerTool(
    "messlo_sync_workspace_waba",
    {
      description:
        "Sync WABA and phone numbers from Meta into the Messlo workspace.",
      inputSchema: {},
    },
    async () => textResult(await client.post("/api/whatsapp/workspace/sync", {}))
  );

  server.registerTool(
    "messlo_get_business_profile",
    {
      description:
        "Get WhatsApp Business profile for a phone number (about, websites, vertical).",
      inputSchema: {
        waba_id: z.string(),
        phone_number_id: z
          .string()
          .describe("MongoDB phone doc id or Meta phone_number_id"),
      },
    },
    async ({ waba_id, phone_number_id }) => {
      return textResult(
        await client.get(
          `/api/whatsapp/${waba_id}/phone-numbers/${phone_number_id}/business-profile`
        )
      );
    }
  );

  server.registerTool(
    "messlo_update_business_profile",
    {
      description: "Update WhatsApp Business profile fields for a phone number.",
      inputSchema: {
        waba_id: z.string(),
        phone_number_id: z.string(),
        about: z.string().optional(),
        address: z.string().optional(),
        description: z.string().optional(),
        email: z.string().optional(),
        websites: z.array(z.string()).optional(),
        vertical: z.string().optional(),
        new_display_name: z.string().optional(),
      },
    },
    async ({ waba_id, phone_number_id, ...body }) => {
      return textResult(
        await client.post(
          `/api/whatsapp/${waba_id}/phone-numbers/${phone_number_id}/business-profile`,
          body
        )
      );
    }
  );
}
