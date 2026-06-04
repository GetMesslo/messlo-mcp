import * as z from "zod";
import { textResult, maskKeyPrefix } from "../utils/text.js";
import { searchDocs } from "../bundled/load-docs.js";
import {
  INTEGRATION_GOALS,
  planIntegration,
} from "../bundled/plan-integration.js";
import {
  MCP_TOOL_CATALOG,
  MCP_PLAN_GOALS,
} from "../bundled/mcp-tool-catalog.js";

export function registerOnboardingTools(server, client) {
  server.registerTool(
    "messlo_get_started",
    {
      description:
        "Check Messlo integration readiness: WABA connections, phone numbers, API keys (masked), and suggested next steps. Call this first when helping someone integrate Messlo.",
      inputSchema: {},
    },
    async () => {
      const steps = [];
      let connections = null;
      let phones = null;
      let keys = null;
      const errors = [];

      try {
        connections = await client.get("/api/whatsapp/connections");
      } catch (e) {
        errors.push(`connections: ${e.message}`);
      }

      try {
        phones = await client.get("/api/whatsapp/phone-numbers");
      } catch (e) {
        errors.push(`phone-numbers: ${e.message}`);
      }

      try {
        keys = await client.get("/api/api-keys?page=1&limit=10");
      } catch (e) {
        errors.push(`api-keys: ${e.message}`);
      }

      const connList =
        connections?.connections || connections?.data || [];
      const phoneList =
        phones?.phone_numbers || phones?.data || [];
      const keyList = keys?.data || [];

      if (connList.length === 0) {
        steps.push({
          priority: 1,
          action: "Connect WhatsApp Business Account (WABA) in the Messlo dashboard",
          path: "/integrate_waba",
        });
      } else {
        steps.push({
          priority: 1,
          status: "done",
          action: `WABA connected (${connList.length} connection(s))`,
        });
      }

      if (phoneList.length === 0) {
        steps.push({
          priority: 2,
          action: "Verify at least one WhatsApp phone number is active",
        });
      } else {
        const primary = phoneList.find((p) => p.is_primary) || phoneList[0];
        steps.push({
          priority: 2,
          status: "done",
          action: `Phone number ready: ${primary.display_phone_number || primary.id}`,
          phone_number_id: primary.id || primary.phone_number_id,
        });
      }

      if (keyList.length === 0) {
        steps.push({
          priority: 3,
          action:
            "Create your first API key in Messlo → Integration Tools → API Credentials (shown once), then set MESSLO_API_KEY in MCP config",
        });
      } else {
        steps.push({
          priority: 3,
          status: "done",
          action: `${keyList.length} API key(s) on file`,
          keys: keyList.map((k) => ({
            id: k.id,
            name: k.name,
            prefix: maskKeyPrefix(k.prefix || k.api_key),
          })),
        });
      }

      steps.push({
        priority: 4,
        action:
          "Bot flows (any industry): messlo_get_automation_builder_guide → messlo_compose_automation_flow or messlo_get_automation_preset → messlo_create_automation_flow",
      });

      steps.push({
        priority: 5,
        action: "Use messlo_search_docs or messlo://docs/overview for endpoint reference",
      });

      return textResult({
        ready: connList.length > 0 && phoneList.length > 0 && keyList.length > 0,
        connections: connList,
        phone_numbers: phoneList,
        api_keys_summary: keyList.map((k) => ({
          id: k.id,
          name: k.name,
          prefix: maskKeyPrefix(k.prefix || k.api_key),
        })),
        suggested_next_steps: steps.sort((a, b) => a.priority - b.priority),
        errors: errors.length ? errors : undefined,
        bootstrap_note:
          keyList.length === 0
            ? "The first API key must be created in the Messlo dashboard; after that, messlo_create_api_key can create additional keys."
            : undefined,
      });
    }
  );

  server.registerTool(
    "messlo_plan_integration",
    {
      description:
        "Get a recommended sequence of MCP tools for a goal (whatsapp_setup, template_messaging, inbound_automation, industry_pack_onboarding, broadcast_campaign, login_with_whatsapp). Works for any business type.",
      inputSchema: {
        goal: z
          .enum([
            "whatsapp_setup",
            "template_messaging",
            "inbound_automation",
            "industry_pack_onboarding",
            "broadcast_campaign",
            "login_with_whatsapp",
            "debug_automation",
            "ai_chatbot_and_forms",
            "ops_integrations",
            "ecommerce_catalog",
            "ecommerce_checkout",
          ])
          .describe(`Available: ${Object.keys(INTEGRATION_GOALS).join(", ")}`),
        business_type: z
          .string()
          .optional()
          .describe("e.g. dental clinic, ecommerce, real estate"),
        notes: z.string().optional(),
      },
    },
    async (args) => textResult(planIntegration(args))
  );

  server.registerTool(
    "messlo_search_docs",
    {
      description:
        "Search Messlo API documentation (endpoints and FAQs) by keyword. Use before calling unfamiliar endpoints.",
      inputSchema: {
        query: z.string().describe("Search keyword, e.g. template, campaign, login"),
      },
    },
    async ({ query }) => textResult(searchDocs(query))
  );

  server.registerTool(
    "messlo_list_mcp_tools",
    {
      description:
        "List Messlo MCP tools grouped by lane (integrate, automate, bots, operate, commerce) and available plan_integration goals.",
      inputSchema: {},
    },
    async () =>
      textResult({
        catalog: MCP_TOOL_CATALOG,
        plan_goals: MCP_PLAN_GOALS,
        resources: [
          "messlo://docs/overview",
          "messlo://automation/guide",
          "messlo://checkout/guide",
          "messlo://crm/field-guide",
          "messlo://limits/plan",
        ],
      })
  );

  server.registerTool(
    "messlo_list_connections",
    {
      description:
        "List WhatsApp Business Account (WABA) connections and registered phone numbers.",
      inputSchema: {},
    },
    async () => {
      const [connections, phones] = await Promise.all([
        client.get("/api/whatsapp/connections"),
        client.get("/api/whatsapp/phone-numbers"),
      ]);
      return textResult({ connections, phone_numbers: phones });
    }
  );
}
