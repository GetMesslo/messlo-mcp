/**
 * CRM field patterns for automation flows (bundled resource).
 */
export const CRM_FIELD_GUIDE = {
  title: "CRM fields for automations",
  sections: [
    {
      heading: "Custom fields",
      body:
        "Call messlo_list_custom_fields before composing flows. Use field `name` (key) in update_contact nodes, not the Mongo _id.",
      tools: ["messlo_list_custom_fields", "messlo_create_custom_field"],
    },
    {
      heading: "Segments",
      body:
        "add_to_segment nodes need segment Mongo _id from messlo_list_segments or messlo_create_segment.",
      tools: ["messlo_list_segments", "messlo_create_segment"],
    },
    {
      heading: "Tags",
      body:
        "add_tag nodes use tag label/name from messlo_list_tags; Messlo resolves to tag id at runtime.",
      tools: ["messlo_list_tags", "messlo_create_tag"],
    },
    {
      heading: "Capture reply",
      body:
        "wait_for_reply → update_contact with value {{variable_name}}. Pair with capture_reply_to_crm preset.",
      tools: ["messlo_get_automation_preset"],
    },
    {
      heading: "Catalog / properties",
      body:
        "property_carousel nodes use settings.projects[] (id, name, image_url, …). For Meta catalogs use messlo_list_catalog_products.",
      tools: ["messlo_list_catalogs", "messlo_compose_automation_flow"],
    },
  ],
  variables: [
    "{{senderNumber}}",
    "{{contactId}}",
    "{{company_name}}",
    "{{city}}",
    "{{selected_project}}",
    "{{user_reply}}",
  ],
};
