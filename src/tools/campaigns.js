import * as z from "zod";
import { textResult } from "../utils/text.js";

const campaignPlatformSchema = z.enum([
  "whatsapp",
  "telegram",
  "facebook",
  "instagram",
  "all",
]);

export function registerCampaignTools(server, client) {
  server.registerTool(
    "messlo_create_campaign",
    {
      description:
        "Create a broadcast campaign. WhatsApp (default): requires waba_id. Omnichannel: set platform to telegram|facebook|instagram|all and omit waba_id. See messlo_search_docs query=campaign for recipient_type options.",
      inputSchema: {
        name: z.string(),
        platform: campaignPlatformSchema
          .optional()
          .default("whatsapp")
          .describe("Target platform; default whatsapp"),
        waba_id: z
          .string()
          .optional()
          .describe("Required for whatsapp platform"),
        template_name: z.string().describe("Approved template name"),
        recipient_type: z
          .enum(["all_contacts", "specific_contacts", "tags"])
          .default("all_contacts"),
        contact_numbers: z.array(z.string()).optional(),
        tag_ids: z.array(z.string()).optional(),
        variables_mapping: z.record(z.string()).optional(),
        is_scheduled: z.boolean().optional(),
        scheduled_at: z.string().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, platform, waba_id, ...fields }) => {
      const resolvedPlatform = platform || "whatsapp";
      if (resolvedPlatform === "whatsapp" && !waba_id) {
        return textResult({
          error: "waba_id is required for whatsapp campaigns.",
        });
      }
      const result = await client.post("/api/campaigns", {
        platform: resolvedPlatform,
        waba_id,
        ...fields,
        ...(extra || {}),
      });
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_list_campaigns",
    {
      description: "List broadcast campaigns and their statuses.",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/campaigns"))
  );

  server.registerTool(
    "messlo_send_campaign",
    {
      description: "Trigger sending for an existing campaign by ID.",
      inputSchema: {
        campaign_id: z.string().describe("Campaign document ID"),
      },
    },
    async ({ campaign_id }) => {
      const result = await client.post(
        `/api/campaigns/${campaign_id}/send`,
        {}
      );
      return textResult(result);
    }
  );
}
