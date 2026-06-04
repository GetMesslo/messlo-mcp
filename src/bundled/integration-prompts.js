/**
 * Example natural-language prompts per integration goal (for MCP resources).
 */
export const INTEGRATION_PROMPTS = {
  whatsapp_setup: [
    "Check my Messlo integration status and list connected phone numbers",
    "Send a test WhatsApp text to +919876543210",
    "Set up webhooks for my WABA so inbound messages work",
  ],
  template_messaging: [
    "Create a marketing template with a PDF header from this URL …",
    "Sync template approval status for my WABA",
    "Send the approved template summer_sale to contact …",
  ],
  inbound_automation: [
    "Build a welcome menu bot for my dental clinic that captures the service they need",
    "Create an automation that tags inbound leads and adds them to segment New Leads",
  ],
  industry_pack_onboarding: [
    "I'm a real estate agency — apply the real estate industry pack with company Acme Homes",
    "List industry packs and preview what the school pack creates",
  ],
  broadcast_campaign: [
    "Create a broadcast campaign using template order_update for segment VIP",
  ],
  debug_automation: [
    "Why didn't my bot flow run? List recent executions for flow …",
    "Show messages for contact … after I sent a test inbound",
  ],
  ai_chatbot_and_forms: [
    "Create an AI chatbot trained on our pricing FAQ",
    "Build a WhatsApp Flow lead form and wire it into an automation",
  ],
  ops_integrations: [
    "Show plan usage and list agents",
    "Import contacts from ~/Downloads/leads.csv",
    "Connect Google Sheets for my automation",
  ],
  ecommerce_checkout: [
    "Create a checkout invoice template with PDF header from this URL",
    "Set up an ecommerce webhook for Shopify orders and map template checkout_invoice",
    "Send order confirmation template with dynamic invoice PDF mediaUrl",
  ],
  ecommerce_catalog: [
    "Sync Meta catalogs for my WABA and list products",
    "Build a catalog picker flow that saves the chosen product to CRM",
  ],
  login_with_whatsapp: [
    "Create a Login with WhatsApp web app for my store checkout",
  ],
};
