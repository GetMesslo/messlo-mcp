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
      "messlo_list_channels",
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
      "messlo_create_campaign",
      "messlo_setup_waba_webhooks",
      "messlo_connect_channel",
      "messlo_get_instagram_oauth_config",
      "messlo_create_whatsapp_login_app",
      "messlo_call_api",
    ],
  },
  {
    lane: "channels",
    tools: [
      "messlo_list_channels",
      "messlo_connect_channel",
      "messlo_get_instagram_oauth_config",
      "messlo_disconnect_channel",
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
    lane: "social",
    tools: [
      "messlo_list_social_automations",
      "messlo_create_social_automation",
      "messlo_fetch_social_media",
      "messlo_retrigger_social_comments",
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
  {
    lane: "shopify",
    tools: [
      "messlo_get_shopify_config",
      "messlo_save_shopify_config",
      "messlo_sync_shopify_products",
      "messlo_setup_shopify_catalog",
      "messlo_push_shopify_to_whatsapp",
    ],
  },
  {
    lane: "ads",
    tools: [
      "messlo_list_facebook_ad_accounts",
      "messlo_list_facebook_ad_campaigns",
      "messlo_create_facebook_ad_campaign",
      "messlo_create_facebook_ad_set",
      "messlo_create_facebook_ad",
      "messlo_get_facebook_ad_insights",
    ],
  },
  {
    lane: "calling",
    tools: [
      "messlo_get_call_settings",
      "messlo_create_call_agent",
      "messlo_assign_call_agent",
      "messlo_list_call_logs",
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
  "omnichannel_setup",
  "telegram_bot",
  "instagram_comment_dm",
  "shopify_whatsapp",
  "facebook_ads",
  "whatsapp_calling",
];
