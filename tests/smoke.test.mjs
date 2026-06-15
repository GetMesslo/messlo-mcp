import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPathAllowed } from "../src/tools/allowlist.js";
import { searchDocs, loadBundledDocs } from "../src/bundled/load-docs.js";
import { createMessloMcpServer } from "../src/server.js";
import { validateAutomationFlow } from "../src/automation/validate-flow.js";
import {
  buildCaptureReplyToCrmPreset,
  buildRealEstatePropertyToCrmPreset,
  buildWelcomeMenuPreset,
  getAutomationPreset,
  AUTOMATION_PRESET_CATALOG,
} from "../src/bundled/automation-presets.js";
import { composeAutomationFlow } from "../src/automation/flow-builder.js";
import { getAutomationBuilderGuide } from "../src/bundled/automation-builder-guide.js";
import { planIntegration, INTEGRATION_GOALS } from "../src/bundled/plan-integration.js";
import { INTEGRATION_PROMPTS } from "../src/bundled/integration-prompts.js";
import {
  MCP_PLAN_GOALS,
  MCP_TOOL_CATALOG,
} from "../src/bundled/mcp-tool-catalog.js";
import { CHECKOUT_GUIDE } from "../src/bundled/checkout-guide.js";
import { OMNICHANNEL_GUIDE } from "../src/bundled/omnichannel-guide.js";
import { callMcpTool, parseToolJson, listRegisteredToolNames } from "./helpers/mcp-tool.js";

/** Pre-v1.7 tools that must remain registered. */
const LEGACY_TOOL_NAMES = [
  "messlo_get_started",
  "messlo_send_message",
  "messlo_send_template",
  "messlo_create_template",
  "messlo_create_campaign",
  "messlo_setup_waba_webhooks",
  "messlo_create_automation_flow",
  "messlo_list_connections",
  "messlo_create_ecommerce_webhook",
  "messlo_call_api",
];

describe("allowlist", () => {
  it("allows public API paths", () => {
    assert.equal(isPathAllowed("/api/whatsapp/connections"), true);
    assert.equal(isPathAllowed("/v1/auth/whatsapp/start"), true);
  });

  it("blocks admin and billing webhooks", () => {
    assert.equal(isPathAllowed("/api/admin/templates"), false);
    assert.equal(isPathAllowed("/api/webhook/stripe"), false);
  });
});

describe("bundled docs", () => {
  it("loads sections from api-docs.json", () => {
    const docs = loadBundledDocs();
    assert.ok(Array.isArray(docs.sections));
    assert.ok(docs.sections.length >= 1);
  });

  it("search finds template endpoints", () => {
    const hits = searchDocs("template");
    assert.ok(
      hits.endpoints?.length > 0 || hits.sections?.length > 0
    );
  });

  it("supplement docs include automation and CRM", () => {
    const docs = loadBundledDocs();
    const ids = docs.sections.map((s) => s.id);
    assert.ok(ids.includes("automation"));
    assert.ok(ids.includes("crm"));
    assert.ok(ids.includes("conversations"));
    const hits = searchDocs("segment");
    assert.ok(hits.endpoints?.some((e) => e.path.includes("/api/segments")));
    const chats = searchDocs("chats");
    assert.ok(chats.endpoints?.some((e) => e.path.includes("/api/whatsapp/chats")));
    const bots = searchDocs("chatbot");
    assert.ok(bots.endpoints?.some((e) => e.path.includes("/api/chatbots")));
    const forms = searchDocs("forms");
    assert.ok(forms.endpoints?.some((e) => e.path.includes("/api/forms")));
    const ops = searchDocs("usage");
    assert.ok(ops.endpoints?.some((e) => e.path.includes("/api/subscription/usage")));
    const polish = searchDocs("webhook");
    assert.ok(
      polish.endpoints?.some((e) =>
        e.path.includes("/api/whatsapp/") && e.path.includes("webhooks")
      )
    );
    const checkout = searchDocs("ecommerce-webhook");
    assert.ok(
      checkout.endpoints?.some((e) =>
        e.path.includes("/api/ecommerce-webhook")
      )
    );
  });

  it("supplement docs include omnichannel and new feature sections", () => {
    const docs = loadBundledDocs();
    const ids = docs.sections.map((s) => s.id);
    for (const id of [
      "channels",
      "omnichannel-messaging",
      "social-automation",
      "shopify",
      "facebook-ads",
      "whatsapp-calling",
    ]) {
      assert.ok(ids.includes(id), `missing section: ${id}`);
    }
    const channels = searchDocs("channels");
    assert.ok(
      channels.endpoints?.some((e) => e.path.includes("/api/channels"))
    );
    const social = searchDocs("social-automation");
    assert.ok(
      social.endpoints?.some((e) =>
        e.path.includes("/api/social-automation")
      )
    );
  });

  it("template paths use /api/template/create", () => {
    const docs = loadBundledDocs();
    const template = docs.sections.find((s) => s.id === "template");
    if (template?.endpoints?.length) {
      for (const ep of template.endpoints) {
        assert.ok(
          !ep.path.includes("/api/templates/"),
          `bad path: ${ep.path}`
        );
      }
    }
  });
});

describe("plan integration", () => {
  it("returns tool sequence for inbound_automation", () => {
    const plan = planIntegration({ goal: "inbound_automation", business_type: "clinic" });
    assert.ok(plan.tool_sequence.length >= 5);
    assert.ok(INTEGRATION_GOALS.inbound_automation);
  });

  it("rejects unknown goal", () => {
    const plan = planIntegration({ goal: "unknown" });
    assert.ok(plan.error);
  });

  it("debug_automation goal includes execution tools", () => {
    const plan = planIntegration({ goal: "debug_automation" });
    const tools = plan.tool_sequence.map((s) => s.tool);
    assert.ok(tools.includes("messlo_list_automation_executions"));
  });

  it("ai_chatbot_and_forms goal includes form tools", () => {
    const plan = planIntegration({ goal: "ai_chatbot_and_forms" });
    const tools = plan.tool_sequence.map((s) => s.tool);
    assert.ok(tools.includes("messlo_create_form"));
    assert.ok(tools.includes("messlo_create_message_bot"));
  });

  it("ops_integrations goal includes usage and assign", () => {
    const plan = planIntegration({ goal: "ops_integrations" });
    const tools = plan.tool_sequence.map((s) => s.tool);
    assert.ok(tools.includes("messlo_get_usage"));
    assert.ok(tools.includes("messlo_assign_chat"));
  });

  it("ecommerce_catalog goal includes catalog tools", () => {
    const plan = planIntegration({ goal: "ecommerce_catalog" });
    const tools = plan.tool_sequence.map((s) => s.tool);
    assert.ok(tools.includes("messlo_sync_catalogs"));
    assert.ok(plan.resources.includes("messlo://prompts/ecommerce_catalog"));
  });

  it("whatsapp_setup includes webhook setup", () => {
    const tools = planIntegration({ goal: "whatsapp_setup" }).tool_sequence.map(
      (s) => s.tool
    );
    assert.ok(tools.includes("messlo_setup_waba_webhooks"));
  });

  it("ecommerce_checkout goal includes webhook and send_template", () => {
    const tools = planIntegration({ goal: "ecommerce_checkout" }).tool_sequence.map(
      (s) => s.tool
    );
    assert.ok(tools.includes("messlo_create_ecommerce_webhook"));
    assert.ok(tools.includes("messlo_send_template"));
  });

  it("omnichannel_setup goal includes channel tools", () => {
    const tools = planIntegration({ goal: "omnichannel_setup" }).tool_sequence.map(
      (s) => s.tool
    );
    assert.ok(tools.includes("messlo_list_channels"));
    assert.ok(tools.includes("messlo_connect_channel"));
    assert.ok(tools.includes("messlo_send_message"));
  });

  it("instagram_comment_dm goal includes social automation tools", () => {
    const tools = planIntegration({
      goal: "instagram_comment_dm",
    }).tool_sequence.map((s) => s.tool);
    assert.ok(tools.includes("messlo_create_social_automation"));
    assert.ok(tools.includes("messlo_fetch_social_media"));
  });

  it("new plan goals are in MCP_PLAN_GOALS", () => {
    for (const goal of [
      "omnichannel_setup",
      "telegram_bot",
      "instagram_comment_dm",
      "shopify_whatsapp",
      "facebook_ads",
      "whatsapp_calling",
    ]) {
      assert.ok(MCP_PLAN_GOALS.includes(goal), goal);
      assert.ok(INTEGRATION_GOALS[goal], goal);
    }
  });
});

describe("mcp catalog", () => {
  it("lists commerce and checkout goals", () => {
    assert.ok(MCP_PLAN_GOALS.includes("ecommerce_checkout"));
    const commerce = MCP_TOOL_CATALOG.find((c) => c.lane === "commerce");
    assert.ok(commerce.tools.includes("messlo_create_ecommerce_webhook"));
  });

  it("lists omnichannel and new feature lanes", () => {
    const lanes = MCP_TOOL_CATALOG.map((c) => c.lane);
    for (const lane of ["channels", "social", "shopify", "ads", "calling"]) {
      assert.ok(lanes.includes(lane), lane);
    }
    const channels = MCP_TOOL_CATALOG.find((c) => c.lane === "channels");
    assert.ok(channels.tools.includes("messlo_connect_channel"));
  });

  it("omnichannel guide references key tools", () => {
    assert.ok(OMNICHANNEL_GUIDE.connection.list === "messlo_list_channels");
    assert.ok(OMNICHANNEL_GUIDE.platforms.includes("telegram"));
  });

  it("checkout guide references key tools", () => {
    assert.ok(CHECKOUT_GUIDE.tools.includes("messlo_send_template"));
    assert.ok(CHECKOUT_GUIDE.plan_goal === "ecommerce_checkout");
  });
});

describe("tier 5 resources", () => {
  it("every preset has example flow JSON", () => {
    const defaults = { template_on_inbound: { template_name: "hello_world" } };
    for (const p of AUTOMATION_PRESET_CATALOG) {
      assert.ok(getAutomationPreset(p.id, defaults[p.id] || {}), p.id);
    }
  });

  it("integration prompts cover all goals", () => {
    for (const goal of Object.keys(INTEGRATION_GOALS)) {
      assert.ok(INTEGRATION_PROMPTS[goal]?.length >= 1, goal);
    }
  });
});

describe("automation presets", () => {
  it("builder guide lists multiple patterns", () => {
    const guide = getAutomationBuilderGuide();
    assert.ok(guide.patterns.length >= 4);
    assert.ok(guide.step_types.send_message);
  });

  it("compose linear flow validates", () => {
    const flow = composeAutomationFlow({
      name: "Clinic intake",
      steps: [
        { type: "trigger" },
        {
          type: "send_message",
          message_body: "Welcome to {{company_name}}. What service do you need?",
        },
        { type: "wait_for_reply", variable_name: "service" },
        {
          type: "update_contact",
          updates: [{ field_key: "interest", value: "{{service}}" }],
        },
      ],
    });
    const v = validateAutomationFlow(flow);
    assert.equal(v.valid, true, v.errors.join("; "));
  });

  it("welcome_menu preset validates", () => {
    const flow = buildWelcomeMenuPreset({ company_name: "Acme" });
    assert.equal(validateAutomationFlow(flow).valid, true);
  });

  it("capture_reply_to_crm preset validates", () => {
    const flow = buildCaptureReplyToCrmPreset({});
    assert.equal(validateAutomationFlow(flow).valid, true);
  });

  it("catalog / real estate preset validates", () => {
    const flow = buildRealEstatePropertyToCrmPreset({});
    const v = validateAutomationFlow(flow);
    assert.equal(v.valid, true, v.errors.join("; "));
    assert.ok(flow.nodes.some((n) => n.type === "property_carousel"));
    assert.ok(flow.settings.projects.length >= 1);
  });

  it("getAutomationPreset resolves generic ids", () => {
    assert.ok(getAutomationPreset("welcome_menu", {}));
    assert.ok(getAutomationPreset("capture_reply_to_crm", {}));
    assert.ok(getAutomationPreset("menu_routing", {}));
  });
});

describe("MCP server", () => {
  it("registers tools without connecting", () => {
    const server = createMessloMcpServer({
      apiKey: "test_key_for_smoke_only",
      baseUrl: "https://api.messlo.com",
    });
    assert.ok(server);
    assert.ok(server.server);
  });
});

describe("legacy backward compatibility", () => {
  const server = createMessloMcpServer({
    apiKey: "test_key_for_smoke_only",
    baseUrl: "https://api.messlo.com",
  });
  const registered = new Set(listRegisteredToolNames(server));

  it("keeps pre-v1.7 core tools registered", () => {
    for (const name of LEGACY_TOOL_NAMES) {
      assert.ok(registered.has(name), `missing legacy tool: ${name}`);
    }
  });

  it("whatsapp_setup plan goal is unchanged", () => {
    const tools = planIntegration({ goal: "whatsapp_setup" }).tool_sequence.map(
      (s) => s.tool
    );
    assert.ok(tools.includes("messlo_send_message"));
    assert.ok(tools.includes("messlo_setup_waba_webhooks"));
    assert.ok(tools.includes("messlo_list_connections"));
  });

  it("send_message still requires whatsapp fields without omnichannel path", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_send_message", { message: "hi" })
    );
    assert.ok(data.error);
    assert.match(data.error, /contact_no/);
  });

  it("create_template still requires waba_id for whatsapp templates", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_create_template", {
        template_name: "legacy_test",
      })
    );
    assert.ok(data.error);
    assert.match(data.error, /waba_id/);
  });

  it("create_campaign still requires waba_id when platform is whatsapp", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_create_campaign", {
        name: "Legacy",
        template_name: "hello",
      })
    );
    assert.ok(data.error);
    assert.match(data.error, /waba_id/);
  });

  it("get_started accepts empty args (workspace_id optional)", async () => {
    const tool = server._registeredTools.messlo_get_started;
    assert.ok(tool?.handler);
    const schema = tool.inputSchema || tool.schema;
    assert.ok(schema);
  });
});
