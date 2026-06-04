import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerSubscriptionOpsTools(server, client) {
  server.registerTool(
    "messlo_get_usage",
    {
      description:
        "Plan limits vs usage (contacts, templates, campaigns, tags) and subscription status.",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/subscriptions/usage"))
  );

  server.registerTool(
    "messlo_get_my_subscription",
    {
      description:
        "Current subscription plan, features, and detailed usage (check before creating resources).",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/subscriptions/my-subscription"))
  );
}
