import * as z from "zod";
import { textResult } from "../utils/text.js";

const platformSchema = z.enum(["telegram", "facebook", "instagram"]);

export function registerChannelTools(server, client) {
  server.registerTool(
    "messlo_list_channels",
    {
      description:
        "List connected omnichannel accounts (Telegram, Facebook Messenger, Instagram DM) for a workspace. Requires workspace_id from the Messlo dashboard.",
      inputSchema: {
        workspace_id: z.string().describe("Workspace MongoDB _id"),
        platform: platformSchema
          .optional()
          .describe("Filter by platform; omit for all"),
      },
    },
    async ({ workspace_id, platform }) => {
      const qs = new URLSearchParams({ workspace_id });
      if (platform) qs.set("platform", platform);
      return textResult(await client.get(`/api/channels?${qs}`));
    }
  );

  server.registerTool(
    "messlo_connect_channel",
    {
      description:
        "Connect an omnichannel account. Telegram: pass bot_token. Facebook: pass access_token from OAuth. Instagram: pass code from OAuth (use messlo_get_instagram_oauth_config for authorize_url).",
      inputSchema: {
        platform: platformSchema,
        workspace_id: z.string(),
        bot_token: z
          .string()
          .optional()
          .describe("Required for telegram — from @BotFather"),
        access_token: z
          .string()
          .optional()
          .describe("Required for facebook — long-lived page/user token"),
        code: z
          .string()
          .optional()
          .describe("Required for instagram — OAuth authorization code"),
      },
    },
    async (args) => {
      const { platform, workspace_id, bot_token, access_token, code } = args;
      if (platform === "telegram" && !bot_token) {
        return textResult({ error: "bot_token is required for telegram" });
      }
      if (platform === "facebook" && !access_token) {
        return textResult({ error: "access_token is required for facebook" });
      }
      if (platform === "instagram" && !code) {
        return textResult({
          error:
            "code is required for instagram. Call messlo_get_instagram_oauth_config, open authorize_url in a browser, then pass the returned code.",
        });
      }
      return textResult(
        await client.post("/api/channels/connect", {
          platform,
          workspace_id,
          bot_token,
          access_token,
          code,
        })
      );
    }
  );

  server.registerTool(
    "messlo_get_instagram_oauth_config",
    {
      description:
        "Get Instagram OAuth authorize_url and scopes. User must open authorize_url in a browser; after redirect, pass the code to messlo_connect_channel.",
      inputSchema: {
        workspace_id: z.string(),
      },
    },
    async ({ workspace_id }) => {
      const qs = new URLSearchParams({ workspace_id });
      return textResult(
        await client.get(`/api/channels/instagram/oauth-config?${qs}`)
      );
    }
  );

  server.registerTool(
    "messlo_disconnect_channel",
    {
      description:
        "Disconnect an omnichannel channel by connection MongoDB _id from messlo_list_channels. Requires confirm: true.",
      inputSchema: {
        channel_id: z.string().describe("Connection _id from messlo_list_channels"),
        confirm: z
          .boolean()
          .optional()
          .describe("Must be true to disconnect"),
      },
    },
    async ({ channel_id, confirm }) => {
      if (!confirm) {
        return textResult({
          error: "Set confirm: true to disconnect the channel.",
        });
      }
      return textResult(await client.delete(`/api/channels/${channel_id}`));
    }
  );
}
