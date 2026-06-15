/**
 * Suggested MCP tool sequences by integration goal (any vertical).
 */

export const INTEGRATION_GOALS = {
  whatsapp_setup: {
    title: "Connect WhatsApp and send first message",
    steps: [
      { tool: "messlo_get_started", why: "Check WABA, phones, API key" },
      { tool: "messlo_list_connections", why: "Get waba_id and phone numbers" },
      { tool: "messlo_setup_waba_webhooks", why: "Subscribe Meta webhooks for inbound events" },
      { tool: "messlo_send_message", why: "Test outbound text" },
    ],
  },
  template_messaging: {
    title: "Create and send approved templates",
    steps: [
      { tool: "messlo_get_started", why: "Confirm WABA connected" },
      { tool: "messlo_list_templates", why: "See existing templates" },
      { tool: "messlo_create_template", why: "Submit new template to Meta" },
      { tool: "messlo_sync_templates_status", why: "Refresh Meta approval status" },
      { tool: "messlo_send_template", why: "Send to a contact" },
    ],
  },
  inbound_automation: {
    title: "Bot flow on inbound WhatsApp (any industry)",
    steps: [
      { tool: "messlo_get_automation_builder_guide", why: "Patterns and step types" },
      { tool: "messlo_list_custom_fields", why: "Real CRM field keys for update_contact" },
      { tool: "messlo_list_segments", why: "segment_id for add_to_segment nodes" },
      { tool: "messlo_list_tags", why: "Tag names for add_tag nodes" },
      { tool: "messlo_compose_automation_flow", why: "Build JSON from steps" },
      { tool: "messlo_validate_automation_flow", why: "Check graph" },
      { tool: "messlo_create_automation_flow", why: "Deploy" },
      { tool: "messlo_toggle_automation_flow", why: "Activate with is_active true" },
    ],
  },
  industry_pack_onboarding: {
    title: "One-shot vertical setup (school, NGO, real estate, …)",
    steps: [
      { tool: "messlo_list_industry_packs", why: "Choose pack_slug" },
      { tool: "messlo_preview_industry_pack", why: "See what will be created" },
      { tool: "messlo_apply_industry_pack", why: "Provision CRM + automations" },
      { tool: "messlo_list_automation_flows", why: "Review created flows" },
    ],
  },
  broadcast_campaign: {
    title: "Template broadcast to contacts",
    steps: [
      { tool: "messlo_list_templates", why: "Pick approved template" },
      { tool: "messlo_list_segments", why: "Audience" },
      { tool: "messlo_create_campaign", why: "Create campaign" },
      { tool: "messlo_send_campaign", why: "Send" },
    ],
  },
  debug_automation: {
    title: "Debug a live bot flow",
    steps: [
      { tool: "messlo_list_automation_flows", why: "Find flow_id" },
      { tool: "messlo_list_chats", why: "Find contact_id from inbox" },
      { tool: "messlo_list_messages", why: "See thread after test message" },
      { tool: "messlo_list_automation_executions", why: "Check run status per flow" },
      { tool: "messlo_get_automation_execution", why: "Inspect execution_log on failure" },
      { tool: "messlo_test_automation_flow", why: "Re-run with test_data" },
    ],
  },
  ai_chatbot_and_forms: {
    title: "AI chatbot, keyword bots, forms, quick replies",
    steps: [
      { tool: "messlo_list_connections", why: "Get waba_id" },
      { tool: "messlo_create_chatbot", why: "AI assistant" },
      { tool: "messlo_add_chatbot_qna_source", why: "Train with Q&A pairs" },
      { tool: "messlo_create_message_bot", why: "Keyword auto-replies (pricing, support)" },
      { tool: "messlo_create_form", why: "WhatsApp Flow lead form" },
      { tool: "messlo_publish_form", why: "Publish Meta Flow" },
      { tool: "messlo_get_form", why: "Copy flow.flow_id for form_flow nodes" },
      { tool: "messlo_create_quick_reply", why: "Agent canned responses" },
      { tool: "messlo_compose_automation_flow", why: "Wire assign_chatbot / form_flow nodes" },
    ],
  },
  ecommerce_checkout: {
    title: "Order/checkout WhatsApp notifications (template + webhook)",
    steps: [
      { tool: "messlo_list_connections", why: "Get waba_id and sender phone" },
      {
        tool: "messlo_create_template",
        why: "Template with document header_url (sample PDF for Meta approval)",
      },
      { tool: "messlo_sync_templates_status", why: "Wait for approved status" },
      {
        tool: "messlo_send_template",
        why: "Per-order send with mediaUrl for dynamic PDF (API path)",
      },
      {
        tool: "messlo_create_ecommerce_webhook",
        why: "Or: webhook for Shopify/WooCommerce order events",
      },
      {
        tool: "messlo_map_ecommerce_webhook_template",
        why: "Map payload fields to template variables + phone",
      },
    ],
  },
  ecommerce_catalog: {
    title: "WhatsApp Commerce catalogs and product picker flows",
    steps: [
      { tool: "messlo_list_connections", why: "Get waba_id" },
      { tool: "messlo_sync_catalogs", why: "Pull catalogs from Meta" },
      { tool: "messlo_list_catalogs", why: "Pick catalog_id for products" },
      { tool: "messlo_list_catalog_products", why: "Verify products for picker copy" },
      { tool: "messlo_get_automation_preset", why: "catalog_picker_to_crm or compose custom" },
      { tool: "messlo_create_automation_flow", why: "Deploy product picker bot" },
    ],
  },
  ops_integrations: {
    title: "Agents, sequences, Google, pipeline, imports",
    steps: [
      { tool: "messlo_get_usage", why: "Check plan limits before creating resources" },
      { tool: "messlo_list_agents", why: "Staff for assign_chat / assign_agent nodes" },
      { tool: "messlo_assign_chat", why: "Hand conversation to agent" },
      { tool: "messlo_list_sequences", why: "Drip follow-ups" },
      { tool: "messlo_google_connect_url", why: "Link Google for sheets/calendar" },
      { tool: "messlo_list_google_sheets", why: "Pick sheet_id for automations" },
      { tool: "messlo_list_kanban_funnels", why: "Sales pipeline stages" },
      { tool: "messlo_import_contacts_csv", why: "Bulk import (local file path)" },
    ],
  },
  login_with_whatsapp: {
    title: "Login with WhatsApp in your app",
    steps: [
      { tool: "messlo_create_whatsapp_login_app", why: "Create login app" },
      { tool: "messlo_start_whatsapp_login", why: "Dev test session" },
      { tool: "messlo_verify_whatsapp_login_token", why: "Validate JWT server-side" },
    ],
  },
  omnichannel_setup: {
    title: "Connect Telegram, Facebook, or Instagram and send messages",
    steps: [
      { tool: "messlo_get_started", why: "Check workspace readiness" },
      { tool: "messlo_list_channels", why: "See connected omnichannel accounts" },
      {
        tool: "messlo_connect_channel",
        why: "Telegram: bot_token. Instagram: code after OAuth. Facebook: access_token",
      },
      {
        tool: "messlo_get_instagram_oauth_config",
        why: "Get authorize_url for Instagram OAuth (browser step)",
      },
      { tool: "messlo_list_chats", why: "Find contact_id from omnichannel inbox" },
      { tool: "messlo_send_message", why: "Send with contact_id or platform+recipient_id" },
    ],
  },
  telegram_bot: {
    title: "Telegram bot messaging and templates",
    steps: [
      { tool: "messlo_connect_channel", why: "platform=telegram with bot_token" },
      { tool: "messlo_create_template", why: "platform=telegram (no waba_id)" },
      { tool: "messlo_send_message", why: "platform=telegram with recipient_id" },
    ],
  },
  instagram_comment_dm: {
    title: "Instagram comment-to-DM automation",
    steps: [
      { tool: "messlo_list_channels", why: "Confirm Instagram connected" },
      { tool: "messlo_fetch_social_media", why: "List posts/reels to target" },
      { tool: "messlo_create_social_automation", why: "Create comment keyword automation" },
      { tool: "messlo_retrigger_social_comments", why: "Process existing comments on a post" },
    ],
  },
  shopify_whatsapp: {
    title: "Shopify store → WhatsApp catalog",
    steps: [
      { tool: "messlo_get_shopify_config", why: "Check existing Shopify connection" },
      { tool: "messlo_save_shopify_config", why: "Connect shop domain and token" },
      { tool: "messlo_sync_shopify_products", why: "Pull products into Messlo" },
      { tool: "messlo_setup_shopify_catalog", why: "Link Meta commerce catalog" },
      { tool: "messlo_push_shopify_to_whatsapp", why: "Push products to WhatsApp" },
    ],
  },
  facebook_ads: {
    title: "Facebook Ads campaigns",
    steps: [
      { tool: "messlo_list_facebook_ad_accounts", why: "Pick ad_account_id" },
      { tool: "messlo_create_facebook_ad_campaign", why: "Create campaign with ad sets" },
      { tool: "messlo_create_facebook_ad_set", why: "Add ad set if not in campaign payload" },
      { tool: "messlo_create_facebook_ad", why: "Create ad with image_file_path if needed" },
      { tool: "messlo_get_facebook_ad_insights", why: "Check performance" },
    ],
  },
  whatsapp_calling: {
    title: "WhatsApp voice calling setup",
    steps: [
      { tool: "messlo_list_connections", why: "Get phone_number_id" },
      { tool: "messlo_get_call_settings", why: "Review calling config" },
      { tool: "messlo_create_call_agent", why: "Add call agents" },
      { tool: "messlo_assign_call_agent", why: "Assign agent to contact" },
      { tool: "messlo_list_call_logs", why: "Review call history" },
    ],
  },
};

export function planIntegration({ goal, business_type, notes }) {
  const base = INTEGRATION_GOALS[goal];
  if (!base) {
    return {
      error: `Unknown goal: ${goal}`,
      available_goals: Object.keys(INTEGRATION_GOALS),
    };
  }

  const hints = [];
  if (business_type) {
    hints.push(
      `Business: ${business_type} — customize copy and custom fields; use messlo_compose_automation_flow or messlo_get_automation_preset.`
    );
  }
  if (notes) hints.push(`Notes: ${notes}`);

  return {
    goal,
    title: base.title,
    tool_sequence: base.steps,
    hints,
    resources: [
      "messlo://docs/overview",
      "messlo://automation/guide",
      "messlo://bots/guide",
      "messlo://crm/field-guide",
      "messlo://limits/plan",
      `messlo://prompts/${goal}`,
    ],
  };
}
