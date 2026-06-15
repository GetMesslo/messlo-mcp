/**
 * Live E2E tests against Messlo API.
 *
 * Requires:
 *   MESSLO_API_KEY — Integration Tools → API Credentials
 *   API base is fixed at https://api.messlo.com (not configurable)
 *
 * Run: npm run test:e2e
 * Skipped automatically when MESSLO_API_KEY is unset (CI smoke-only).
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { createMessloMcpServer } from "../src/server.js";
import { MESSLO_API_BASE_URL } from "../src/config.js";
import {
  callMcpTool,
  parseToolJson,
  listRegisteredToolNames,
} from "./helpers/mcp-tool.js";

const API_KEY = process.env.MESSLO_API_KEY?.trim();

const describeE2e = API_KEY ? describe : describe.skip;

function e2eConfig() {
  return { apiKey: API_KEY, baseUrl: MESSLO_API_BASE_URL };
}

describeE2e("messlo-mcp E2E (live API)", () => {
  let server;
  let wabaId;

  before(() => {
    server = createMessloMcpServer(e2eConfig());
    const names = listRegisteredToolNames(server);
    assert.ok(names.length >= 160, `expected 160+ tools, got ${names.length}`);
  });

  it("messlo_list_connections — auth and WABA list", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_list_connections", {})
    );
    const list = data.connections || data.data || [];
    assert.ok(Array.isArray(list), `connections should be an array, got: ${JSON.stringify(data).slice(0, 200)}`);
    if (list.length > 0) {
      wabaId = list[0].id || list[0]._id;
      assert.ok(wabaId, "connection should have id");
    }
  });

  it("messlo_get_started — integration checklist", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_get_started", {})
    );
    assert.ok("ready" in data);
    assert.ok(Array.isArray(data.suggested_next_steps));
    if (data.errors?.length) {
      assert.fail(`get_started reported errors: ${data.errors.join("; ")}`);
    }
  });

  it("messlo_get_usage — plan limits", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_get_usage", {})
    );
    assert.ok(
      data.success !== false && (data.data !== undefined || data.usage !== undefined),
      JSON.stringify(data).slice(0, 500)
    );
  });

  it("messlo_search_docs — bundled + supplement", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_search_docs", {
        query: "automation node-types",
      })
    );
    const paths = (data.endpoints || []).map((e) => e.path);
    assert.ok(
      paths.some((p) => p.includes("/api/automation")),
      `expected automation endpoints, got: ${paths.slice(0, 5).join(", ")}`
    );
  });

  it("messlo_plan_integration — goal sequences", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_plan_integration", {
        goal: "ecommerce_checkout",
      })
    );
    assert.ok(data.tool_sequence?.length >= 4);
    assert.ok(
      data.tool_sequence.some((s) => s.tool === "messlo_send_template")
    );
  });

  it("messlo_list_mcp_tools — catalog", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_list_mcp_tools", {})
    );
    assert.ok(data.catalog?.length >= 5);
    assert.ok(data.plan_goals?.includes("inbound_automation"));
  });

  it("messlo_search_docs — omnichannel sections", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_search_docs", {
        query: "channels",
      })
    );
    const paths = (data.endpoints || []).map((e) => e.path);
    assert.ok(
      paths.some((p) => p.includes("/api/channels")),
      `expected channels endpoints, got: ${paths.slice(0, 5).join(", ")}`
    );
  });

  it("messlo_get_shopify_config — read-only", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_get_shopify_config", {})
    );
    assert.ok(data.success !== false || data.config !== undefined);
  });

  it("messlo_list_call_agents — read-only", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_list_call_agents", { limit: 5 })
    );
    assert.ok(Array.isArray(data) || data.success !== false || Array.isArray(data.data));
  });

  it("messlo_plan_integration — omnichannel goal", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_plan_integration", {
        goal: "omnichannel_setup",
      })
    );
    assert.ok(data.tool_sequence?.length >= 4);
    assert.ok(
      data.tool_sequence.some((s) => s.tool === "messlo_list_channels")
    );
  });

  it("messlo_list_templates", async (t) => {
    if (!wabaId) {
      t.skip("no WABA on account — connect WhatsApp to list templates");
      return;
    }
    const data = parseToolJson(
      await callMcpTool(server, "messlo_list_templates", {
        waba_id: wabaId,
        limit: 5,
      })
    );
    assert.ok(
      data.data !== undefined ||
        data.templates !== undefined ||
        Array.isArray(data),
      "templates response shape"
    );
  });

  it("messlo_list_automation_flows", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_list_automation_flows", {})
    );
    assert.ok(data.success !== false || Array.isArray(data.data));
  });

  it("messlo_get_automation_node_types", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_get_automation_node_types", {})
    );
    const nodeTypes = Array.isArray(data.data)
      ? data.data
      : data.data?.node_types || data.node_types;
    assert.ok(nodeTypes?.length > 0, "node types catalog");
  });

  it("messlo_list_segments", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_list_segments", {})
    );
    assert.ok(data.success !== false || Array.isArray(data.data));
  });

  it("messlo_get_automation_statistics", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_get_automation_statistics", {})
    );
    assert.ok(data.success !== false || data.data !== undefined);
  });

  it("messlo_validate_template_media_url — public PDF", async () => {
    const samplePdf =
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const data = parseToolJson(
      await callMcpTool(server, "messlo_validate_template_media_url", {
        url: samplePdf,
        media_type: "document",
      })
    );
    assert.ok(
      data.success === true || data.reachable === true,
      JSON.stringify(data)
    );
  });

  it("messlo_get_automation_preset + validate (no API write)", async () => {
    const preset = parseToolJson(
      await callMcpTool(server, "messlo_get_automation_preset", {
        preset_id: "welcome_menu",
        customization: { company_name: "E2E Test Co" },
      })
    );
    assert.ok(preset.flow?.nodes?.length > 0);
    const validation = parseToolJson(
      await callMcpTool(server, "messlo_validate_automation_flow", {
        flow: preset.flow,
      })
    );
    assert.equal(validation.valid, true, validation.errors?.join("; "));
  });

  it("messlo_list_industry_packs (public catalog)", async () => {
    const data = parseToolJson(
      await callMcpTool(server, "messlo_list_industry_packs", {
        authenticated_list: false,
      })
    );
    assert.ok(
      Array.isArray(data.data) ||
        Array.isArray(data.packs) ||
        data.success !== false
    );
  });

  it("waba-scoped reads when WABA connected", async (t) => {
    if (!wabaId) {
      t.skip("no WABA on account — connect WhatsApp to run waba-scoped E2E");
      return;
    }
    const catalogs = parseToolJson(
      await callMcpTool(server, "messlo_list_catalogs", {
        waba_id: wabaId,
        linked_only: false,
      })
    );
    assert.ok(catalogs.success !== false || catalogs.data !== undefined);

    const webhooks = parseToolJson(
      await callMcpTool(server, "messlo_list_ecommerce_webhooks", { limit: 5 })
    );
    assert.ok(
      Array.isArray(webhooks.webhooks) || Array.isArray(webhooks.data?.webhooks),
      `unexpected webhooks shape: ${JSON.stringify(webhooks).slice(0, 200)}`
    );
  });
});
