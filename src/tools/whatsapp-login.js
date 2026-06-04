import * as z from "zod";
import { textResult } from "../utils/text.js";
import { loadConfig } from "../config.js";

export function registerWhatsAppLoginTools(server, client) {
  server.registerTool(
    "messlo_create_whatsapp_login_app",
    {
      description:
        "Create a Login with WhatsApp developer app. Returns api_key and webhook_secret ONCE — copy immediately. Also returns messlo_webhook_url for Meta callback.",
      inputSchema: {
        name: z.string().min(2).describe("App display name"),
        platform: z.enum(["web", "flutter"]).default("web"),
        use_messlo_phone: z
          .boolean()
          .optional()
          .default(false)
          .describe("Use Messlo shared number instead of tenant WABA"),
        use_messlo_hosted_webhook: z.boolean().optional().default(true),
        webhook_url: z.string().url().optional().describe("Your outbound webhook URL"),
        login_success_reply_message: z.string().optional(),
      },
    },
    async (body) => {
      const result = await client.post("/api/whatsapp-login-apps", body);
      const config = loadConfig();
      const appId = result.data?.id || result.data?._id;
      return textResult({
        ...result,
        important:
          "Copy api_key and webhook_secret now — shown only once.",
        meta_callback_url: appId
          ? `${config.baseUrl}/api/whatsapp-auth/webhook/${appId}`
          : undefined,
        env_hints: {
          MESSLO_WA_LOGIN_API_KEY: "<api_key>",
          MESSLO_WA_LOGIN_WEBHOOK_SECRET: "<webhook_secret>",
        },
      });
    }
  );

  server.registerTool(
    "messlo_list_whatsapp_login_apps",
    {
      description: "List Login with WhatsApp apps configured for this account.",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/whatsapp-login-apps"))
  );

  server.registerTool(
    "messlo_regenerate_login_webhook_secret",
    {
      description:
        "Regenerate webhook signing secret for a Login app (destructive for old secret).",
      inputSchema: {
        app_id: z.string(),
        confirm: z.boolean().describe("Must be true"),
      },
    },
    async ({ app_id, confirm }) => {
      if (!confirm) {
        return textResult({
          error: "Set confirm=true to regenerate webhook secret.",
        });
      }
      const result = await client.post(
        `/api/whatsapp-login-apps/${app_id}/regenerate-webhook-secret`,
        {}
      );
      return textResult({
        ...result,
        important: "Update MESSLO_WA_LOGIN_WEBHOOK_SECRET in your app env now.",
      });
    }
  );

  server.registerTool(
    "messlo_start_whatsapp_login",
    {
      description:
        "Start a Login with WhatsApp session (dev/testing). Returns waLink and sessionId for the user to scan/send LOGIN message.",
      inputSchema: {
        use_messlo_phone: z.boolean().optional(),
        phone_number_id: z.string().optional(),
        device_hash: z.string().optional(),
      },
    },
    async (body) => {
      const result = await client.post("/v1/auth/whatsapp/start", body);
      return textResult({
        ...result,
        hint: "User opens waLink in WhatsApp. Poll with messlo_get_whatsapp_login_status or use SSE at /v1/auth/whatsapp/events/:sessionId",
      });
    }
  );

  server.registerTool(
    "messlo_get_whatsapp_login_status",
    {
      description: "Poll Login with WhatsApp session status.",
      inputSchema: {
        session_id: z.string(),
      },
    },
    async ({ session_id }) =>
      textResult(
        await client.get(`/v1/auth/whatsapp/status/${session_id}`)
      )
  );

  server.registerTool(
    "messlo_verify_whatsapp_login_token",
    {
      description:
        "Verify a Login with WhatsApp JWT on your backend (server-side).",
      inputSchema: {
        token: z.string(),
      },
    },
    async ({ token }) =>
      textResult(await client.post("/v1/auth/verify-token", { token }))
  );
}
