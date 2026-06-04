const ALLOWED_NODE_TYPES = new Set([
  "trigger",
  "condition",
  "action",
  "delay",
  "filter",
  "transform",
  "webhook",
  "ai_response",
  "send_message",
  "send_template",
  "add_tag",
  "cta_button",
  "assign_chatbot",
  "assign_agent",
  "update_contact",
  "response_saver",
  "save_to_google_sheet",
  "create_calendar_event",
  "resolve_site_visit_slot",
  "appointment_flow",
  "api",
  "wait_for_reply",
  "form_flow",
  "add_to_segment",
  "property_carousel",
  "custom",
]);

const conn = (id, source, target, sourceHandle = "src", targetHandle = "tgt") => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
});

export function validateAutomationFlow(flow) {
  const errors = [];
  const warnings = [];

  if (!flow || typeof flow !== "object") {
    return { valid: false, errors: ["flow must be an object"], warnings };
  }

  if (!flow.name || typeof flow.name !== "string") {
    errors.push("name is required (string)");
  }

  const nodes = flow.nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) {
    errors.push("nodes must be a non-empty array");
    return { valid: false, errors, warnings };
  }

  const nodeIds = new Set();
  let triggerCount = 0;

  for (const node of nodes) {
    if (!node?.id) {
      errors.push("each node needs a unique string id");
      continue;
    }
    if (nodeIds.has(node.id)) {
      errors.push(`duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);

    if (!node.type || !ALLOWED_NODE_TYPES.has(node.type)) {
      errors.push(`node ${node.id}: invalid or missing type "${node.type}"`);
    }
    if (node.type === "trigger") triggerCount += 1;
    if (!node.position || typeof node.position.x !== "number") {
      warnings.push(`node ${node.id}: position.x/y recommended for the flow builder UI`);
    }
  }

  if (triggerCount === 0) {
    errors.push("include at least one trigger node (type: trigger)");
  }

  const connections = Array.isArray(flow.connections) ? flow.connections : [];
  for (const c of connections) {
    if (!c?.id || !c.source || !c.target) {
      errors.push("each connection needs id, source, target");
      continue;
    }
    if (!nodeIds.has(c.source)) {
      errors.push(`connection ${c.id}: unknown source node ${c.source}`);
    }
    if (!nodeIds.has(c.target)) {
      errors.push(`connection ${c.id}: unknown target node ${c.target}`);
    }
    if (!c.sourceHandle || !c.targetHandle) {
      errors.push(`connection ${c.id}: sourceHandle and targetHandle are required (usually "src" / "tgt")`);
    }
  }

  const triggers = flow.triggers;
  if (!Array.isArray(triggers) || triggers.length === 0) {
    warnings.push(
      'triggers array is empty; add e.g. [{ "event_type": "message_received", "conditions": {} }] so the flow runs on inbound WhatsApp messages'
    );
  }

  if (
    nodes.some((n) => n.type === "property_carousel") &&
    !(flow.settings?.projects?.length > 0)
  ) {
    warnings.push(
      "property_carousel flows should set settings.projects to the same project list so selected_project resolves to names in later nodes"
    );
  }

  const reachable = new Set();
  const triggerNodes = nodes.filter((n) => n.type === "trigger");
  const queue = triggerNodes.map((n) => n.id);
  while (queue.length) {
    const id = queue.shift();
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const c of connections.filter((x) => x.source === id)) {
      if (!reachable.has(c.target)) queue.push(c.target);
    }
  }

  const orphan = nodes.filter((n) => n.type !== "trigger" && !reachable.has(n.id));
  if (orphan.length > 0) {
    warnings.push(
      `nodes not reachable from trigger via connections: ${orphan.map((n) => n.id).join(", ")}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      nodeCount: nodes.length,
      connectionCount: connections.length,
      triggerCount,
    },
  };
}

export { conn, ALLOWED_NODE_TYPES };
