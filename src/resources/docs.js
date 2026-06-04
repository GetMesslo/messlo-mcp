import { loadBundledDocs } from "../bundled/load-docs.js";
import { AUTOMATION_PRESET_CATALOG } from "../bundled/automation-presets.js";

export function registerDocResources(server) {
  const docs = loadBundledDocs();

  server.registerResource(
    "messlo-docs-overview",
    "messlo://docs/overview",
    {
      title: "Messlo API Overview",
      description: "Authentication, quick start, and MCP install snippet",
      mimeType: "text/plain",
    },
    async () => {
      const lines = [
        "# Messlo REST API",
        "",
        ...docs.intro,
        "",
        "## Authentication",
        "- Header: X-API-Key: <key>",
        "- Or: Authorization: ApiKey <key>",
        "",
        "## MCP install (Cursor)",
        JSON.stringify(docs.mcpInstall?.cursor || {}, null, 2),
        "",
        "## Sections",
        ...docs.sections.map(
          (s) => `- ${s.id}: ${s.title} (${s.endpoints.length} endpoints)`
        ),
      ];
      return {
        contents: [
          {
            uri: "messlo://docs/overview",
            mimeType: "text/plain",
            text: lines.join("\n"),
          },
        ],
      };
    }
  );

  for (const section of docs.sections) {
    server.registerResource(
      `messlo-docs-${section.id}`,
      `messlo://docs/section/${section.id}`,
      {
        title: section.title,
        description: section.description,
        mimeType: "application/json",
      },
      async () => ({
        contents: [
          {
            uri: `messlo://docs/section/${section.id}`,
            mimeType: "application/json",
            text: JSON.stringify(section, null, 2),
          },
        ],
      })
    );
  }

  server.registerResource(
    "messlo-docs-login",
    "messlo://docs/login-with-whatsapp",
    {
      title: "Login with WhatsApp",
      description: "Integration guide from mess-api module README",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "messlo://docs/login-with-whatsapp",
          mimeType: "text/markdown",
          text: docs.loginWithWhatsAppReadme || "See https://messlo.com/developers/login-with-whatsapp",
        },
      ],
    })
  );

  server.registerResource(
    "messlo-automation-guide",
    "messlo://automation/guide",
    {
      title: "Automation flows (JSON)",
      description:
        "How Cursor should generate Messlo bot flows: nodes, connections, presets",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "messlo://automation/guide",
          mimeType: "text/markdown",
          text: [
            "# Messlo automation flows",
            "",
            "Flows are JSON: `nodes`, `connections`, `triggers`, optional `settings.projects` for property_carousel.",
            "",
            "## Tools (any industry)",
            "- `messlo_get_automation_builder_guide` — patterns + step reference (start here)",
            "- `messlo_compose_automation_flow` — build from declarative `steps[]`",
            "- `messlo_get_automation_node_types` — API node catalog",
            "- `messlo_list_automation_presets` / `messlo_get_automation_preset` — shortcuts",
            "- `messlo_validate_automation_flow` / `messlo_create_automation_flow`",
            "",
            "## Presets (examples, not limits)",
            "- `welcome_menu`, `capture_reply_to_crm`, `menu_routing`, `template_on_inbound`, `catalog_picker_to_crm`",
            "- For unique flows: compose steps in natural language → `messlo_compose_automation_flow`",
            "",
            "## Connection handles",
            "Default chain: sourceHandle `src`, targetHandle `tgt`.",
            "Multi-branch conditions: each branch needs `sourceHandle` on the connection matching condition `sourceHandle`.",
            "",
            "## Variables",
            "`{{senderNumber}}`, `{{contactId}}`, `{{selected_project}}`, `{{company_name}}`, `{{city}}`",
            "",
            "## Presets",
            JSON.stringify(AUTOMATION_PRESET_CATALOG, null, 2),
            "",
            "## Example flow JSON",
            "Resources: `messlo://automation/examples/{preset_id}` (welcome_menu, capture_reply_to_crm, …)",
            "",
            "## CRM + limits",
            "- `messlo://crm/field-guide`",
            "- `messlo://limits/plan` — use `messlo_get_usage` for live numbers",
            "- `messlo://prompts/{goal}` — example user prompts",
          ].join("\n"),
        },
      ],
    })
  );

  server.registerResource(
    "messlo-bots-guide",
    "messlo://bots/guide",
    {
      title: "Chatbots, message bots, forms",
      description: "MCP tools for AI bots, keyword replies, quick replies, WhatsApp Flow forms",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "messlo://bots/guide",
          mimeType: "text/markdown",
          text: [
            "# Bots & forms (MCP)",
            "",
            "## AI chatbots",
            "- `messlo_list_chatbots` / `messlo_create_chatbot` (needs waba_id)",
            "- `messlo_train_chatbot` or `messlo_add_chatbot_qna_source`",
            "- Automation `assign_chatbot` node: use chatbot MongoDB `_id`",
            "",
            "## Message bots (keywords)",
            "- `messlo_create_message_bot` with `keywords` + `reply_content` for text",
            "- Or `messlo_create_reply_material` then pass `reply_id`",
            "",
            "## Quick replies",
            "- Agent inbox snippets: `messlo_list_quick_replies`, `messlo_create_quick_reply`",
            "",
            "## WhatsApp Flow forms",
            "- `messlo_create_form` → `messlo_publish_form`",
            "- `messlo_get_form` → use `data.flow.flow_id` in `form_flow` automation node (not Mongo _id)",
            "",
            "## Plan",
            "`messlo_plan_integration` goal: `ai_chatbot_and_forms`",
            "",
            "## Ops",
            "- `messlo_get_usage` before creating flows/templates",
            "- `messlo_assign_chat`, `messlo_list_agents`",
            "- `messlo_google_connect_url` → sheets/calendar for automation nodes",
            "- `messlo_import_contacts_csv` (local file path)",
            "",
            "Plan goal: `ops_integrations`",
          ].join("\n"),
        },
      ],
    })
  );

  const presets = docs.templatePresets || {};
  for (const [preset, payload] of Object.entries(presets)) {
    server.registerResource(
      `messlo-template-${preset}`,
      `messlo://examples/template/${preset}`,
      {
        title: `Template example: ${preset}`,
        mimeType: "application/json",
      },
      async () => ({
        contents: [
          {
            uri: `messlo://examples/template/${preset}`,
            mimeType: "application/json",
            text: JSON.stringify(payload, null, 2),
          },
        ],
      })
    );
  }
}
