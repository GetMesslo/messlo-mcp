import { composeAutomationFlow, branchConnections, conn } from "../automation/flow-builder.js";

export const SAMPLE_REAL_ESTATE_PROPERTIES = [
  {
    id: "item_1",
    name: "Option A",
    starting_price: "From $99",
    location: "Online",
    image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    brochure_url:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "item_2",
    name: "Option B",
    starting_price: "From $199",
    location: "In-store",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    brochure_url:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

/** @typedef {import('../automation/flow-builder.js').composeAutomationFlow} Compose */

export function buildWelcomeMenuPreset(options = {}) {
  const {
    name = "Welcome menu",
    description = "Inbound WhatsApp: greeting with button menu.",
    welcome_message = "Hello! 👋 Welcome to {{company_name}}.\n\nHow can we help?",
    buttons = [
      { title: "Sales", id: "sales" },
      { title: "Support", id: "support" },
      { title: "Other", id: "other" },
    ],
  } = options;

  return {
    preset_id: "welcome_menu",
    ...composeAutomationFlow({
      name,
      description,
      steps: [
        { type: "trigger", name: "Incoming Message" },
        {
          type: "send_message",
          name: "Welcome menu",
          message_body: welcome_message,
          interactive_type: "button",
          button_params: buttons,
        },
      ],
    }),
  };
}

export function buildCaptureReplyToCrmPreset(options = {}) {
  const {
    name = "Capture reply → CRM",
    description = "Ask a question, save the reply on the contact, optional tag and segment.",
    question_message = "Thanks for messaging {{company_name}}. What are you looking for?",
    variable_name = "user_reply",
    custom_field_key = "interest",
    custom_field_value = "{{user_reply}}",
    tag_name = "Inbound lead",
    segment_id = null,
    confirm_message = "Got it — we saved your response. Our team will follow up soon.",
  } = options;

  const steps = [
    { type: "trigger", name: "Incoming Message" },
    { type: "send_message", name: "Question", message_body: question_message },
    {
      type: "wait_for_reply",
      name: "Wait for reply",
      variable_name,
    },
    {
      type: "condition",
      name: "Has reply?",
      condition: { field: variable_name, operator: "exists" },
    },
    {
      type: "update_contact",
      name: "Save to CRM",
      updates: [
        { field_key: custom_field_key, value: custom_field_value },
        { field_key: "source", value: "WhatsApp automation" },
      ],
    },
  ];

  if (segment_id) {
    steps.push({
      type: "add_to_segment",
      name: "Add to segment",
      segment_id,
    });
  }

  if (tag_name) {
    steps.push({ type: "add_tag", name: "Tag contact", tag_name });
  }

  steps.push({
    type: "send_message",
    name: "Confirmation",
    message_body: confirm_message,
  });

  return {
    preset_id: "capture_reply_to_crm",
    ...composeAutomationFlow({ name, description, steps }),
  };
}

export function buildMenuRoutingPreset(options = {}) {
  const {
    name = "Menu routing",
    description = "Button menu; route each choice to a different reply and CRM field.",
    welcome_message = "Welcome to {{company_name}}! Choose an option:",
    buttons = [
      { title: "Pricing", id: "pricing" },
      { title: "Demo", id: "demo" },
      { title: "Support", id: "support" },
    ],
    routes = {
      pricing: {
        message: "Our team will share pricing on WhatsApp shortly.",
        crm_field: "interest",
        crm_value: "pricing",
      },
      demo: {
        message: "Great — we'll schedule a demo. What is your company name?",
        crm_field: "interest",
        crm_value: "demo",
      },
      support: {
        message: "Support team notified. Please describe your issue in one message.",
        crm_field: "interest",
        crm_value: "support",
      },
    },
  } = options;

  const routeEntries = Object.entries(routes);
  const steps = [
    { type: "trigger", id: "t_start", name: "Incoming Message" },
    {
      type: "send_message",
      id: "m_menu",
      name: "Menu",
      message_body: welcome_message,
      interactive_type: "button",
      button_params: buttons,
    },
    {
      type: "wait_for_reply",
      id: "w_choice",
      name: "Wait for choice",
      variable_name: "menu_choice",
    },
    {
      type: "condition",
      id: "cond_route",
      name: "Route by choice",
      conditions: routeEntries.map(([id]) => ({
        id,
        field: "menu_choice",
        operator: "contains",
        value: id,
        sourceHandle: id,
      })),
      no_match_handle: "default",
    },
  ];

  const branchTargets = {};
  for (const [id, route] of routeEntries) {
    steps.push(
      {
        type: "send_message",
        id: `m_${id}`,
        name: `Reply: ${id}`,
        message_body: route.message,
      },
      {
        type: "update_contact",
        id: `crm_${id}`,
        name: `CRM: ${id}`,
        updates: [
          { field_key: route.crm_field || "interest", value: route.crm_value || id },
        ],
      }
    );
    branchTargets[id] = `m_${id}`;
  }

  steps.push({
    type: "send_message",
    id: "m_default",
    name: "Default reply",
    message_body: "Thanks — we'll get back to you shortly.",
  });
  branchTargets.default = "m_default";

  const flow = composeAutomationFlow({
    name,
    description,
    steps,
    connections: [
      conn("c1", "t_start", "m_menu"),
      conn("c2", "m_menu", "w_choice"),
      conn("c3", "w_choice", "cond_route"),
      ...branchConnections("cond_route", branchTargets),
      ...routeEntries.map(([id]) => conn(`c_${id}_crm`, `m_${id}`, `crm_${id}`)),
    ],
  });

  return { preset_id: "menu_routing", ...flow };
}

export function buildTemplateOnInboundPreset(options = {}) {
  const {
    name = "Template on inbound",
    description = "Send an approved WhatsApp template when a message is received.",
    template_name,
    template_id,
    body_variables = {},
    language_code,
  } = options;

  if (!template_name && !template_id) {
    throw new Error("template_name or template_id is required for template_on_inbound preset");
  }

  return {
    preset_id: "template_on_inbound",
    ...composeAutomationFlow({
      name,
      description,
      steps: [
        { type: "trigger", name: "Incoming Message" },
        {
          type: "send_template",
          name: "Send template",
          template_name,
          template_id,
          body_variables,
          language_code,
        },
      ],
    }),
  };
}

export function buildCatalogPickerToCrmPreset(options = {}) {
  const {
    name = "Picker → CRM",
    description = "Show selectable items (carousel/list), save choice to CRM.",
    picker_type = "property_carousel",
    items = SAMPLE_REAL_ESTATE_PROPERTIES,
    list_body = "Choose an option below 👇",
    footer = "{{company_name}}",
    list_button_title = "Select",
    list_section_title = "Options",
    variable_name = "selected_item",
    custom_field_key = "interest",
    tag_name = "Inbound lead",
    segment_id = null,
    welcome_message = "Hi! Welcome to {{company_name}}.",
    confirm_message = "Thank you — we saved your selection.",
  } = options;

  const steps = [
    { type: "trigger", name: "Incoming Message" },
    { type: "send_message", name: "Welcome", message_body: welcome_message },
  ];

  if (picker_type === "property_carousel") {
    steps.push({
      type: "property_carousel",
      name: "Item picker",
      body: list_body,
      footer,
      list_button_title,
      list_section_title,
      properties: items,
    });
  } else {
    steps.push({
      type: "send_message",
      name: "Item list",
      message_body: list_body,
      interactive_type: "list",
      list_params: {
        buttonTitle: list_button_title,
        sectionTitle: list_section_title,
        items: items.map((item, i) => ({
          id: item.id || `item_${i}`,
          title: item.name || item.title || `Item ${i + 1}`,
          description: item.description || item.starting_price || "",
        })),
      },
    });
  }

  steps.push(
    { type: "wait_for_reply", name: "Wait for selection", variable_name },
    {
      type: "condition",
      name: "Selected?",
      condition: { field: variable_name, operator: "exists" },
    },
    {
      type: "update_contact",
      name: "Save to CRM",
      updates: [
        { field_key: custom_field_key, value: `{{${variable_name}}}` },
        { field_key: "source", value: "WhatsApp automation" },
      ],
    }
  );

  if (segment_id) {
    steps.push({ type: "add_to_segment", name: "Segment", segment_id });
  }
  if (tag_name) {
    steps.push({ type: "add_tag", name: "Tag", tag_name });
  }
  steps.push({
    type: "send_message",
    name: "Confirm",
    message_body: confirm_message,
  });

  const settings =
    picker_type === "property_carousel" ? { projects: items } : {};

  return {
    preset_id: "catalog_picker_to_crm",
    ...composeAutomationFlow({ name, description, steps, settings }),
  };
}

/** @deprecated alias */
export function buildRealEstatePropertyToCrmPreset(options = {}) {
  return buildCatalogPickerToCrmPreset({
    ...options,
    name: options.name || "Property inquiry → CRM",
    list_body: options.list_body || "Pick a project — we will save your interest 👇",
    list_button_title: options.list_button_title || "Select Project",
    list_section_title: options.list_section_title || "Projects",
    properties: options.properties,
    items: options.properties || options.items,
    custom_field_key: options.custom_field_project || options.custom_field_key || "project_interest",
    preset_id: undefined,
  });
}

export const AUTOMATION_PRESET_CATALOG = [
  {
    id: "welcome_menu",
    title: "Welcome + button menu",
    verticals: "any",
    customization: ["welcome_message", "buttons[]"],
  },
  {
    id: "capture_reply_to_crm",
    title: "Question → wait → save on contact",
    verticals: "any",
    customization: [
      "question_message",
      "variable_name",
      "custom_field_key",
      "tag_name",
      "segment_id",
    ],
  },
  {
    id: "menu_routing",
    title: "Menu with per-option replies + CRM",
    verticals: "any",
    customization: ["welcome_message", "buttons[]", "routes{}"],
  },
  {
    id: "template_on_inbound",
    title: "Send approved template on inbound",
    verticals: "any",
    customization: ["template_name or template_id", "body_variables"],
  },
  {
    id: "catalog_picker_to_crm",
    title: "Carousel/list picker → CRM",
    verticals: "real_estate, retail, travel, services",
    customization: ["items[]", "picker_type", "custom_field_key", "segment_id"],
  },
  {
    id: "real_estate_property_to_crm",
    title: "Alias for catalog_picker_to_crm (properties)",
    verticals: "real_estate",
    customization: ["properties[]", "company_name", "city", "segment_id"],
  },
];

const PRESET_BUILDERS = {
  welcome_menu: buildWelcomeMenuPreset,
  capture_reply_to_crm: buildCaptureReplyToCrmPreset,
  menu_routing: buildMenuRoutingPreset,
  template_on_inbound: buildTemplateOnInboundPreset,
  catalog_picker_to_crm: buildCatalogPickerToCrmPreset,
  real_estate_property_to_crm: buildRealEstatePropertyToCrmPreset,
};

export function getAutomationPreset(presetId, customization = {}) {
  const builder = PRESET_BUILDERS[presetId];
  if (!builder) return null;
  return builder(customization);
}
