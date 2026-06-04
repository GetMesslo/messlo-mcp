import * as z from "zod";
import { textResult } from "../utils/text.js";
import { validateAutomationFlow } from "../automation/validate-flow.js";
import { composeAutomationFlow } from "../automation/flow-builder.js";
import { getAutomationBuilderGuide } from "../bundled/automation-builder-guide.js";
import {
  AUTOMATION_PRESET_CATALOG,
  getAutomationPreset,
} from "../bundled/automation-presets.js";

const flowPayloadSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  nodes: z.array(z.record(z.unknown())),
  connections: z.array(z.record(z.unknown())).optional(),
  triggers: z.array(z.record(z.unknown())).optional(),
  settings: z.record(z.unknown()).optional(),
});

const automationStepSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  row: z.number().optional(),
  parameters: z.record(z.unknown()).optional(),
}).passthrough();

export function registerAutomationTools(server, client) {
  server.registerTool(
    "messlo_get_automation_builder_guide",
    {
      description:
        "Industry-agnostic guide for generating Messlo automation JSON: patterns (welcome menu, capture to CRM, routing, templates), step types, variables, and workflow. Call this first when the user describes ANY business (not only real estate).",
      inputSchema: {},
    },
    async () => textResult(getAutomationBuilderGuide())
  );

  server.registerTool(
    "messlo_get_automation_node_types",
    {
      description:
        "Fetch Messlo automation node catalog (all valid node types and parameters). Use with messlo_get_automation_builder_guide or messlo_compose_automation_flow.",
      inputSchema: {},
    },
    async () => {
      const result = await client.get("/api/automation/node-types");
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_compose_automation_flow",
    {
      description:
        "Build automation flow JSON from declarative steps for ANY vertical. Steps are chained linearly unless connections are provided. Prefer this over hand-writing nodes when the user describes their process in natural language.",
      inputSchema: {
        name: z.string(),
        description: z.string().optional(),
        steps: z
          .array(automationStepSchema)
          .min(1)
          .describe(
            "Ordered steps: trigger, send_message, wait_for_reply, condition, update_contact, add_tag, send_template, property_carousel, delay, assign_agent, form_flow, etc."
          ),
        connections: z.array(z.record(z.unknown())).optional(),
        triggers: z.array(z.record(z.unknown())).optional(),
        settings: z.record(z.unknown()).optional(),
        is_active: z.boolean().optional(),
      },
    },
    async (spec) => {
      const flow = composeAutomationFlow(spec);
      const validation = validateAutomationFlow(flow);
      return textResult({ flow, validation });
    }
  );

  server.registerTool(
    "messlo_get_automation_statistics",
    {
      description:
        "Workspace automation stats: total/active flows, execution counts, recent runs.",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/automation/statistics"))
  );

  server.registerTool(
    "messlo_list_automation_flows",
    {
      description: "List automation flows (bot flows) for the account.",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
        search: z.string().optional(),
        is_active: z.boolean().optional(),
      },
    },
    async (args) => {
      const params = new URLSearchParams();
      params.set("page", String(args.page));
      params.set("limit", String(args.limit));
      if (args.search) params.set("search", args.search);
      if (args.is_active !== undefined) {
        params.set("is_active", String(args.is_active));
      }
      const result = await client.get(`/api/automation?${params}`);
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_list_automation_presets",
    {
      description:
        "List starter flow presets for any industry (welcome menu, CRM capture, menu routing, template reply, catalog picker). Use messlo_get_automation_preset or messlo_compose_automation_flow for custom flows.",
      inputSchema: {},
    },
    async () => {
      return textResult({
        presets: AUTOMATION_PRESET_CATALOG,
        workflow: getAutomationBuilderGuide().workflow,
        note: "Presets are shortcuts; for unique flows use messlo_compose_automation_flow with steps from the guide.",
      });
    }
  );

  server.registerTool(
    "messlo_get_automation_preset",
    {
      description:
        "Materialize starter flow JSON by preset id (any vertical). See messlo_list_automation_presets for ids and customization fields.",
      inputSchema: {
        preset_id: z
          .string()
          .describe(
            "e.g. welcome_menu, capture_reply_to_crm, menu_routing, template_on_inbound, catalog_picker_to_crm, real_estate_property_to_crm"
          ),
        customization: z.record(z.unknown()).optional(),
      },
    },
    async ({ preset_id, customization }) => {
      try {
        const flow = getAutomationPreset(preset_id, customization || {});
        if (!flow) {
          return textResult({
            error: `Unknown preset: ${preset_id}`,
            available: AUTOMATION_PRESET_CATALOG.map((p) => p.id),
          });
        }
        const validation = validateAutomationFlow(flow);
        return textResult({ flow, validation });
      } catch (err) {
        return textResult({
          error: err instanceof Error ? err.message : String(err),
          preset_id,
        });
      }
    }
  );

  server.registerTool(
    "messlo_validate_automation_flow",
    {
      description:
        "Validate automation flow JSON (nodes + connections) before creating. Does not call the API.",
      inputSchema: {
        flow: flowPayloadSchema,
      },
    },
    async ({ flow }) => {
      return textResult(validateAutomationFlow(flow));
    }
  );

  server.registerTool(
    "messlo_create_automation_flow",
    {
      description:
        "Create an automation flow from JSON. Build with messlo_compose_automation_flow or messlo_get_automation_preset, validate, then create.",
      inputSchema: {
        flow: flowPayloadSchema,
        skip_validation: z.boolean().optional().default(false),
      },
    },
    async ({ flow, skip_validation }) => {
      if (!skip_validation) {
        const validation = validateAutomationFlow(flow);
        if (!validation.valid) {
          return textResult({
            created: false,
            validation,
            hint: "Fix errors or pass skip_validation: true only if you are sure.",
          });
        }
      }

      const payload = {
        name: flow.name,
        description: flow.description || "",
        nodes: flow.nodes,
        connections: flow.connections || [],
        triggers: flow.triggers || [{ event_type: "message_received", conditions: {} }],
        settings: flow.settings || {},
      };

      const result = await client.post("/api/automation", payload);

      if (flow.is_active === true && result?.data?._id) {
        try {
          await client.patch(`/api/automation/${result.data._id}/toggle`, {
            is_active: true,
          });
        } catch {
          // optional
        }
      }

      return textResult({ created: true, ...result });
    }
  );

  server.registerTool(
    "messlo_get_automation_flow",
    {
      description: "Get one automation flow by id (nodes, connections, triggers).",
      inputSchema: {
        flow_id: z.string(),
      },
    },
    async ({ flow_id }) => {
      return textResult(await client.get(`/api/automation/${flow_id}`));
    }
  );

  server.registerTool(
    "messlo_update_automation_flow",
    {
      description: "Update an existing automation flow (partial or full graph).",
      inputSchema: {
        flow_id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        nodes: z.array(z.record(z.unknown())).optional(),
        connections: z.array(z.record(z.unknown())).optional(),
        triggers: z.array(z.record(z.unknown())).optional(),
        settings: z.record(z.unknown()).optional(),
        is_active: z.boolean().optional(),
        skip_validation: z.boolean().optional().default(false),
      },
    },
    async ({ flow_id, skip_validation, ...updates }) => {
      const body = { ...updates };
      if (!skip_validation && body.nodes) {
        const validation = validateAutomationFlow({
          name: body.name || "flow",
          nodes: body.nodes,
          connections: body.connections || [],
          triggers: body.triggers,
          settings: body.settings,
        });
        if (!validation.valid) {
          return textResult({ updated: false, validation });
        }
      }
      return textResult(await client.put(`/api/automation/${flow_id}`, body));
    }
  );

  server.registerTool(
    "messlo_toggle_automation_flow",
    {
      description: "Activate or deactivate an automation flow.",
      inputSchema: {
        flow_id: z.string(),
        is_active: z.boolean(),
      },
    },
    async ({ flow_id, is_active }) => {
      return textResult(
        await client.patch(`/api/automation/${flow_id}/toggle`, { is_active })
      );
    }
  );

  server.registerTool(
    "messlo_test_automation_flow",
    {
      description:
        "Test-run an active automation flow with sample inbound data (flow must be active).",
      inputSchema: {
        flow_id: z.string(),
        test_data: z
          .record(z.unknown())
          .optional()
          .describe(
            "e.g. { senderNumber, contactId, message: { body: 'hi' }, userId }"
          ),
      },
    },
    async ({ flow_id, test_data }) => {
      return textResult(
        await client.post(`/api/automation/${flow_id}/test`, {
          test_data: test_data || {
            senderNumber: "919876543210",
            message: { body: "test" },
          },
        })
      );
    }
  );

  server.registerTool(
    "messlo_delete_automation_flow",
    {
      description: "Soft-delete an automation flow. Requires confirm: true.",
      inputSchema: {
        flow_id: z.string(),
        confirm: z.boolean().optional().default(false),
      },
    },
    async ({ flow_id, confirm }) => {
      if (!confirm) {
        return textResult({
          deleted: false,
          hint: "Set confirm: true to delete this flow.",
          flow_id,
        });
      }
      return textResult(await client.delete(`/api/automation/${flow_id}`));
    }
  );

  server.registerTool(
    "messlo_list_automation_executions",
    {
      description:
        "List execution logs for a bot flow (success, failed, waiting). Requires flow_id.",
      inputSchema: {
        flow_id: z.string(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
        status: z
          .enum(["running", "waiting", "success", "failed", "cancelled"])
          .optional(),
      },
    },
    async ({ flow_id, page, limit, status }) => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) qs.set("status", status);
      return textResult(
        await client.get(`/api/automation/${flow_id}/executions?${qs}`)
      );
    }
  );

  server.registerTool(
    "messlo_get_automation_execution",
    {
      description: "Get a single automation execution by id (full execution_log).",
      inputSchema: {
        execution_id: z.string(),
      },
    },
    async ({ execution_id }) => {
      return textResult(
        await client.get(`/api/automation/executions/${execution_id}`)
      );
    }
  );
}
