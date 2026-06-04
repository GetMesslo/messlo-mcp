/**
 * Checkout / order notification patterns (template + webhook + dynamic PDF).
 */
export const CHECKOUT_GUIDE = {
  title: "Checkout & order WhatsApp notifications",
  workflow: [
    "Create UTILITY/MARKETING template with document header using a sample PDF URL (header_url at create time).",
    "Wait for Meta approval — messlo_sync_templates_status with waba_id.",
    "Option A — API send per order: messlo_send_template with mediaUrl = per-order PDF URL.",
    "Option B — Ecommerce webhook: messlo_create_ecommerce_webhook → POST payload to trigger URL → messlo_map_ecommerce_webhook_template with variables including dynamic header from payload path.",
  ],
  send_template_example: {
    contact_no: "919876543210",
    whatsapp_phone_number: "911234567890",
    template_name: "checkout_invoice",
    templateVariables: { "1": "Jane", "2": "ORDER-123" },
    mediaUrl: "https://cdn.example.com/invoices/order-123.pdf",
  },
  webhook_variable_syntax:
    "Map template variables to payload paths, e.g. phone_number_field: customer.phone, variables: { \"1\": \"order.name\", \"header\": \"invoice.pdf_url\" }",
  tools: [
    "messlo_create_template",
    "messlo_send_template",
    "messlo_create_ecommerce_webhook",
    "messlo_map_ecommerce_webhook_template",
  ],
  plan_goal: "ecommerce_checkout",
};
