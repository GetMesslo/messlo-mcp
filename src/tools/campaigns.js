import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerCampaignTools(server, client) {
  server.registerTool(
    "messlo_create_campaign",
    {
      description:
        "Create a WhatsApp broadcast campaign (bulk template send). See messlo_search_docs query=campaign for recipient_type options.",
      inputSchema: {
        name: z.string(),
        waba_id: z.string(),
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
    async ({ extra, ...fields }) => {
      const result = await client.post("/api/campaigns", {
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
