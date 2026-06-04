/**
 * MCP tool index for messlo_list_mcp_tools (grouped by lane).
 */
export const MCP_TOOL_CATALOG = [
  {
    lane: "onboarding",
    tools: [
      "messlo_get_started",
      "messlo_plan_integration",
      "messlo_search_docs",
      "messlo_list_connections",
      "messlo_list_mcp_tools",
    ],
  },
  {
    lane: "integrate",
    tools: [
      "messlo_create_api_key",
      "messlo_list_api_keys",
      "messlo_send_message",
      "messlo_send_template",
      "messlo_create_template",
      "messlo_list_templates",
      "messlo_setup_waba_webhooks",
      "messlo_create_whatsapp_login_app",
      "messlo_call_api",
    ],
  },
  {
    lane: "automate",
    tools: [
      "messlo_get_automation_builder_guide",
      "messlo_compose_automation_flow",
      "messlo_create_automation_flow",
      "messlo_get_automation_preset",
      "messlo_toggle_automation_flow",
      "messlo_list_industry_packs",
      "messlo_apply_industry_pack",
    ],
  },
  {
    lane: "bots",
    tools: [
      "messlo_list_chatbots",
      "messlo_create_chatbot",
      "messlo_test_chatbot",
      "messlo_create_message_bot",
      "messlo_create_form",
      "messlo_publish_form",
    ],
  },
  {
    lane: "operate",
    tools: [
      "messlo_list_chats",
      "messlo_assign_chat",
      "messlo_import_contacts_csv",
      "messlo_get_usage",
      "messlo_list_kanban_funnels",
    ],
  },
  {
    lane: "commerce",
    tools: [
      "messlo_sync_catalogs",
      "messlo_list_catalog_products",
      "messlo_create_ecommerce_webhook",
      "messlo_map_ecommerce_webhook_template",
      "messlo_send_template",
      "messlo_delete_template",
    ],
  },
];

export const MCP_PLAN_GOALS = [
  "whatsapp_setup",
  "template_messaging",
  "inbound_automation",
  "industry_pack_onboarding",
  "broadcast_campaign",
  "debug_automation",
  "ai_chatbot_and_forms",
  "ops_integrations",
  "ecommerce_catalog",
  "ecommerce_checkout",
  "login_with_whatsapp",
];
