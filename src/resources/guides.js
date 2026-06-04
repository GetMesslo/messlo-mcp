import {
  AUTOMATION_PRESET_CATALOG,
  getAutomationPreset,
} from "../bundled/automation-presets.js";
import { CRM_FIELD_GUIDE } from "../bundled/crm-field-guide.js";
import { INTEGRATION_PROMPTS } from "../bundled/integration-prompts.js";
import { INTEGRATION_GOALS } from "../bundled/plan-integration.js";
import { CHECKOUT_GUIDE } from "../bundled/checkout-guide.js";

/** Defaults so example resources materialize without user input. */
const PRESET_EXAMPLE_DEFAULTS = {
  template_on_inbound: { template_name: "hello_world" },
};

export function registerGuideResources(server) {
  server.registerResource(
    "messlo-checkout-guide",
    "messlo://checkout/guide",
    {
      title: "Checkout & order notifications",
      description:
        "Dynamic PDF template headers, send_template mediaUrl, ecommerce webhooks",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "messlo://checkout/guide",
          mimeType: "application/json",
          text: JSON.stringify(CHECKOUT_GUIDE, null, 2),
        },
      ],
    })
  );

  for (const preset of AUTOMATION_PRESET_CATALOG) {
    server.registerResource(
      `messlo-automation-example-${preset.id}`,
      `messlo://automation/examples/${preset.id}`,
      {
        title: `Automation example: ${preset.title}`,
        description: `Full flow JSON for preset ${preset.id}`,
        mimeType: "application/json",
      },
      async () => {
        const flow = getAutomationPreset(
          preset.id,
          PRESET_EXAMPLE_DEFAULTS[preset.id] || {}
        );
        return {
          contents: [
            {
              uri: `messlo://automation/examples/${preset.id}`,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  preset_id: preset.id,
                  catalog: preset,
                  flow,
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );
  }

  server.registerResource(
    "messlo-crm-field-guide",
    "messlo://crm/field-guide",
    {
      title: "CRM fields for automations",
      description: "Segments, tags, custom fields, and flow variables",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "messlo://crm/field-guide",
          mimeType: "application/json",
          text: JSON.stringify(CRM_FIELD_GUIDE, null, 2),
        },
      ],
    })
  );

  server.registerResource(
    "messlo-limits-plan",
    "messlo://limits/plan",
    {
      title: "Plan limits",
      description: "How to check usage and limits before creating resources",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "messlo://limits/plan",
          mimeType: "text/markdown",
          text: [
            "# Messlo plan limits",
            "",
            "Call **`messlo_get_usage`** for live limits vs current usage (bot flows, templates, Google accounts, conversations, …).",
            "",
            "Call **`messlo_get_my_subscription`** for plan name and feature flags.",
            "",
            "Before creating automations, templates, or chatbots, check usage to avoid plan limit errors from the API.",
            "",
            "Ops plan goal: `ops_integrations`",
          ].join("\n"),
        },
      ],
    })
  );

  for (const [goal, prompts] of Object.entries(INTEGRATION_PROMPTS)) {
    const meta = INTEGRATION_GOALS[goal];
    server.registerResource(
      `messlo-prompts-${goal}`,
      `messlo://prompts/${goal}`,
      {
        title: `Example prompts: ${meta?.title || goal}`,
        description: "Natural-language prompts to try in Cursor",
        mimeType: "text/markdown",
      },
      async () => ({
        contents: [
          {
            uri: `messlo://prompts/${goal}`,
            mimeType: "text/markdown",
            text: [
              `# Example prompts (${goal})`,
              "",
              meta?.title ? `**${meta.title}**` : "",
              "",
              ...prompts.map((p) => `- ${p}`),
              "",
              `Plan: \`messlo_plan_integration\` with goal \`${goal}\``,
            ].join("\n"),
          },
        ],
      })
    );
  }
}
