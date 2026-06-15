import * as z from "zod";
import { textResult } from "../utils/text.js";

function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) qs.set(key, String(value));
  }
  const q = qs.toString();
  return q ? `?${q}` : "";
}

export function registerFacebookAdsTools(server, client) {
  server.registerTool(
    "messlo_list_facebook_ad_accounts",
    {
      description: "List connected Facebook ad accounts.",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/facebook-ads/ad-accounts"))
  );

  server.registerTool(
    "messlo_sync_facebook_ad_accounts",
    {
      description: "Sync ad accounts from Facebook.",
      inputSchema: {},
    },
    async () =>
      textResult(await client.post("/api/facebook-ads/ad-accounts/sync", {}))
  );

  server.registerTool(
    "messlo_list_facebook_ad_campaigns",
    {
      description: "List Facebook ad campaigns in Messlo.",
      inputSchema: {
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
      },
    },
    async (params) =>
      textResult(
        await client.get(`/api/facebook-ads${buildQuery(params)}`)
      )
  );

  server.registerTool(
    "messlo_get_facebook_ad_campaign",
    {
      description: "Get one Facebook ad campaign by Messlo id.",
      inputSchema: {
        campaign_id: z.string(),
      },
    },
    async ({ campaign_id }) =>
      textResult(await client.get(`/api/facebook-ads/${campaign_id}`))
  );

  server.registerTool(
    "messlo_create_facebook_ad_campaign",
    {
      description:
        "Create a Facebook ad campaign with optional ad sets. For image/video creative, pass image_file_path or video_file_path (local file on MCP host).",
      inputSchema: {
        fb_page_id: z.string().optional(),
        ad_account_id: z.string(),
        name: z.string(),
        objective: z.string().optional(),
        daily_budget: z.number().optional(),
        lifetime_budget: z.number().optional(),
        is_cbo: z.boolean().optional(),
        ad_sets: z
          .union([z.array(z.record(z.unknown())), z.string()])
          .optional()
          .describe("Ad set definitions array or JSON string"),
        image_file_path: z
          .string()
          .optional()
          .describe("Local path to image creative"),
        video_file_path: z
          .string()
          .optional()
          .describe("Local path to video creative"),
      },
    },
    async ({
      image_file_path,
      video_file_path,
      ad_sets,
      ...fields
    }) => {
      const body = {
        ...fields,
        ad_sets:
          typeof ad_sets === "string" ? ad_sets : JSON.stringify(ad_sets || []),
      };
      const files = {};
      if (image_file_path) files.image = image_file_path;
      if (video_file_path) files.video = video_file_path;
      if (Object.keys(files).length > 0) {
        return textResult(
          await client.uploadMultipart("/api/facebook-ads", body, files)
        );
      }
      return textResult(await client.post("/api/facebook-ads", body));
    }
  );

  server.registerTool(
    "messlo_update_facebook_ad_campaign",
    {
      description: "Update a Facebook ad campaign by Messlo id.",
      inputSchema: {
        campaign_id: z.string(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ campaign_id, extra }) =>
      textResult(
        await client.patch(`/api/facebook-ads/${campaign_id}`, extra || {})
      )
  );

  server.registerTool(
    "messlo_update_facebook_ad_status",
    {
      description: "Update Facebook ad campaign status (ACTIVE/PAUSED).",
      inputSchema: {
        campaign_id: z.string(),
        status: z.enum(["ACTIVE", "PAUSED"]),
      },
    },
    async ({ campaign_id, status }) =>
      textResult(
        await client.post(`/api/facebook-ads/${campaign_id}/status`, { status })
      )
  );

  server.registerTool(
    "messlo_delete_facebook_ad_campaign",
    {
      description:
        "Delete a Facebook ad campaign. Requires confirm: true.",
      inputSchema: {
        campaign_id: z.string(),
        confirm: z.boolean().optional(),
      },
    },
    async ({ campaign_id, confirm }) => {
      if (!confirm) {
        return textResult({
          error: "Set confirm: true to delete the campaign.",
        });
      }
      return textResult(await client.delete(`/api/facebook-ads/${campaign_id}`));
    }
  );

  server.registerTool(
    "messlo_get_facebook_ad_hierarchy",
    {
      description: "Get campaign → ad set → ad hierarchy tree.",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/facebook-ads/hierarchy"))
  );

  server.registerTool(
    "messlo_get_facebook_ad_insights",
    {
      description: "Get Facebook ad insights for campaign, ad set, or ad.",
      inputSchema: {
        level: z.enum(["campaign", "adset", "ad"]),
        id: z.string(),
        date_preset: z.string().optional(),
      },
    },
    async ({ level, id, date_preset }) => {
      const qs = date_preset ? `?date_preset=${encodeURIComponent(date_preset)}` : "";
      return textResult(
        await client.get(`/api/facebook-ads/insights/${level}/${id}${qs}`)
      );
    }
  );

  server.registerTool(
    "messlo_search_facebook_ad_targeting",
    {
      description: "Search geo/interest targeting options for Facebook ads.",
      inputSchema: {
        type: z.string().describe("e.g.adgeolocation, adinterest"),
        q: z.string().describe("Search query"),
      },
    },
    async ({ type, q }) => {
      const qs = new URLSearchParams({ type, q });
      return textResult(
        await client.get(`/api/facebook-ads/targeting/search?${qs}`)
      );
    }
  );

  server.registerTool(
    "messlo_geocode_facebook_ad_targeting",
    {
      description: "Geocode a location string for ad targeting.",
      inputSchema: {
        q: z.string(),
      },
    },
    async ({ q }) => {
      const qs = new URLSearchParams({ q });
      return textResult(
        await client.get(`/api/facebook-ads/targeting/geocode?${qs}`)
      );
    }
  );

  server.registerTool(
    "messlo_list_facebook_ad_sets",
    {
      description: "List ad sets for a campaign.",
      inputSchema: {
        campaign_id: z.string(),
      },
    },
    async ({ campaign_id }) =>
      textResult(
        await client.get(`/api/facebook-ads/campaigns/${campaign_id}/ad-sets`)
      )
  );

  server.registerTool(
    "messlo_create_facebook_ad_set",
    {
      description: "Create a Facebook ad set.",
      inputSchema: {
        extra: z
          .record(z.unknown())
          .describe("Ad set payload (campaign_id, name, targeting, budget, …)"),
      },
    },
    async ({ extra }) =>
      textResult(await client.post("/api/facebook-ads/ad-sets", extra || {}))
  );

  server.registerTool(
    "messlo_create_facebook_ad",
    {
      description:
        "Create a Facebook ad. Pass image_file_path or video_file_path for creative upload.",
      inputSchema: {
        extra: z
          .record(z.unknown())
          .describe("Ad payload (ad_set_id, name, creative, …)"),
        image_file_path: z.string().optional(),
        video_file_path: z.string().optional(),
      },
    },
    async ({ extra, image_file_path, video_file_path }) => {
      const files = {};
      if (image_file_path) files.image = image_file_path;
      if (video_file_path) files.video = video_file_path;
      const fields = {};
      for (const [key, value] of Object.entries(extra || {})) {
        fields[key] =
          typeof value === "object" ? JSON.stringify(value) : String(value);
      }
      if (Object.keys(files).length > 0) {
        return textResult(
          await client.uploadMultipart("/api/facebook-ads/ads", fields, files)
        );
      }
      return textResult(await client.post("/api/facebook-ads/ads", extra || {}));
    }
  );
}
