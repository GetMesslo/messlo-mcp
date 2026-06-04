/**
 * Industry-agnostic guidance for LLMs composing Messlo automation JSON.
 */

export const AUTOMATION_PATTERNS = [
  {
    id: "welcome_menu",
    title: "Welcome + button menu",
    use_when:
      "Any business that wants a first reply with 2–3 choices (support, sales, booking).",
    example_verticals: ["school", "clinic", "saas", "retail", "ngo"],
    step_outline: [
      "trigger message_received",
      "send_message with interactive_type button + button_params",
    ],
  },
  {
    id: "capture_reply_to_crm",
    title: "Ask → wait → save answer on contact",
    use_when:
      "Collect one reply (product choice, budget, issue type) and write it to CRM custom fields.",
    example_verticals: ["ecommerce", "services", "recruitment", "events"],
    step_outline: [
      "trigger",
      "send_message (question)",
      "wait_for_reply (variable_name)",
      "condition exists on variable",
      "update_contact updates[]",
      "add_tag optional",
      "send_message confirmation",
    ],
  },
  {
    id: "menu_routing",
    title: "Menu → branch by reply",
    use_when: "Route to different messages or CRM fields based on button/list id.",
    example_verticals: ["hospital", "bank", "government", "education"],
    step_outline: [
      "trigger",
      "send_message buttons",
      "wait_for_reply",
      "condition branches with sourceHandle per option",
      "per-branch send_message or update_contact",
    ],
  },
  {
    id: "template_on_inbound",
    title: "Reply with approved template",
    use_when: "Policy requires Meta template for first outbound (marketing utility).",
    example_verticals: ["otp", "order updates", "appointment confirm"],
    step_outline: ["trigger", "send_template template_name + body_variables"],
  },
  {
    id: "catalog_picker_to_crm",
    title: "Carousel / list picker → CRM",
    use_when: "User picks from a list of items (properties, products, plans).",
    example_verticals: ["real_estate", "automotive", "travel", "insurance"],
    step_outline: [
      "property_carousel OR send_message interactive list",
      "wait_for_reply",
      "update_contact",
      "settings.projects if using property_carousel",
    ],
  },
  {
    id: "handoff_to_human",
    title: "Tag + assign agent",
    use_when: "Escalate hot leads or complaints to a team member.",
    example_verticals: ["b2b", "luxury retail", "legal"],
    step_outline: [
      "condition on keyword or tag",
      "add_tag",
      "assign_agent",
      "send_message we will call you",
    ],
  },
];

export const STEP_TYPE_REFERENCE = {
  trigger: {
    required: ["event_type"],
    common: { event_type: "message_received" },
  },
  send_message: {
    fields: [
      "recipient",
      "message_body",
      "interactive_type",
      "button_params",
      "list_params",
      "media_url",
      "provider_type",
    ],
    notes: "Use {{senderNumber}}, {{contact_name}}, {{company_name}} in text.",
  },
  wait_for_reply: {
    fields: ["variable_name"],
    notes: "Pauses flow until next inbound message; stores text in variable_name.",
  },
  condition: {
    single: { condition: { field: "variable_or_message.body", operator: "exists", value: "" } },
    multi: {
      conditions: [
        { id: "branch_a", field: "menu_choice", operator: "contains", value: "sales", sourceHandle: "sales" },
      ],
      no_match_handle: "optional branch handle id",
    },
    operators: [
      "exists",
      "equals",
      "contains",
      "contains_any",
      "starts_with",
      "is_empty",
    ],
  },
  update_contact: {
    fields: ["updates: [{ field_key, value }]"],
    notes: "field_key can be name, email, or custom CRM field. Needs contactId in run context.",
  },
  add_tag: { fields: ["tag_name or tag_id"] },
  add_to_segment: { fields: ["segment_id"] },
  send_template: {
    fields: ["template_name or template_id", "body_variables", "header_media_url"],
  },
  property_carousel: {
    fields: ["properties[]", "body", "list_button_title"],
    notes: "Set settings.projects to same array as properties.",
  },
  delay: { fields: ["delay_seconds"] },
  assign_chatbot: { fields: ["chatbot_id"] },
  assign_agent: { fields: ["agent_id"] },
  form_flow: { fields: ["form_id", "message_body", "button_text"] },
  response_saver: { fields: ["mappings to variables/custom fields"] },
  api: { fields: ["url", "method", "headers", "body"] },
};

export const TEMPLATE_VARIABLES = [
  "{{senderNumber}}",
  "{{contactId}}",
  "{{contact_name}}",
  "{{company_name}}",
  "{{city}}",
  "{{last_user_message}}",
  "{{selected_project}}",
  "{{selected_project_name}}",
];

export const BUILDER_WORKFLOW = [
  "Understand the business goal in plain language (not limited to real estate).",
  "Call messlo_get_automation_node_types for exact parameter names.",
  "Pick a pattern from messlo_get_automation_builder_guide OR messlo_list_automation_presets.",
  "Build flow via messlo_compose_automation_flow(steps[]) OR messlo_get_automation_preset for a close match.",
  "Customize copy, custom fields, segment_id, template_name for the account.",
  "messlo_validate_automation_flow then messlo_create_automation_flow.",
];

export function getAutomationBuilderGuide() {
  return {
    workflow: BUILDER_WORKFLOW,
    patterns: AUTOMATION_PATTERNS,
    step_types: STEP_TYPE_REFERENCE,
    variables: TEMPLATE_VARIABLES,
    connection_defaults: {
      linear: { sourceHandle: "src", targetHandle: "tgt" },
      condition_branch: "sourceHandle must match condition sourceHandle or no_match_handle",
    },
    compose_hint:
      "Use messlo_compose_automation_flow with a steps array — any vertical. Only use property_carousel for property/product card pickers.",
  };
}
