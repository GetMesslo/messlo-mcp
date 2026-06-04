import { conn as makeConn } from "./validate-flow.js";

export const conn = makeConn;

const flowPos = (column, row = 0) => ({ x: column * 400, y: row * 280 });

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export function resetFlowBuilderIds() {
  idCounter = 0;
}

/**
 * Map a declarative step (any vertical) to a full Messlo node.
 * @param {object} step - { type, id?, name?, parameters?, ...typeSpecificFields }
 * @param {number} index - column index for layout
 */
export function stepToNode(step, index = 0) {
  const id = step.id || nextId(step.type === "trigger" ? "t" : "n");
  const base = {
    id,
    type: step.type,
    position: step.position || flowPos(index, step.row || 0),
    name: step.name || step.type,
    description: step.description || "",
    parameters: { ...(step.parameters || {}) },
  };

  switch (step.type) {
    case "trigger":
      base.parameters = {
        event_type: step.event_type || "message_received",
        ...base.parameters,
      };
      break;
    case "send_message":
      base.parameters = {
        recipient: step.recipient || "{{senderNumber}}",
        message_body: step.message_body || step.message || "",
        provider_type: step.provider_type || "business_api",
        ...base.parameters,
      };
      if (step.interactive_type) {
        base.parameters.interactive_type = step.interactive_type;
      }
      if (step.button_params) base.parameters.button_params = step.button_params;
      if (step.list_params) base.parameters.list_params = step.list_params;
      if (step.media_url) base.parameters.media_url = step.media_url;
      if (step.media_source) base.parameters.media_source = step.media_source;
      if (step.asset_type) base.parameters.asset_type = step.asset_type;
      break;
    case "wait_for_reply":
      base.parameters = {
        variable_name: step.variable_name || "last_user_message",
        ...base.parameters,
      };
      break;
    case "condition":
      if (step.conditions) {
        base.parameters = {
          conditions: step.conditions,
          no_match_handle: step.no_match_handle,
          ...base.parameters,
        };
      } else {
        base.parameters = {
          condition: step.condition || {
            field: step.field || "last_user_message",
            operator: step.operator || "exists",
            value: step.value,
          },
          ...base.parameters,
        };
      }
      break;
    case "update_contact":
      base.parameters = {
        updates: step.updates || [],
        ...base.parameters,
      };
      break;
    case "add_tag":
      base.parameters = {
        tag_name: step.tag_name,
        tag_id: step.tag_id,
        ...base.parameters,
      };
      break;
    case "add_to_segment":
      base.parameters = {
        segment_id: step.segment_id,
        ...base.parameters,
      };
      break;
    case "send_template":
      base.parameters = {
        recipient: step.recipient || "{{senderNumber}}",
        template_name: step.template_name,
        template_id: step.template_id,
        body_variables: step.body_variables,
        header_media_url: step.header_media_url,
        provider_type: step.provider_type || "business_api",
        ...base.parameters,
      };
      break;
    case "property_carousel":
      base.parameters = {
        recipient: step.recipient || "{{senderNumber}}",
        body: step.body || "",
        footer: step.footer || "",
        list_button_title: step.list_button_title || "Select",
        list_section_title: step.list_section_title || "Options",
        properties: step.properties || [],
        provider_type: step.provider_type || "business_api",
        ...base.parameters,
      };
      break;
    case "delay":
      base.parameters = {
        delay_seconds: step.delay_seconds ?? step.delay ?? 60,
        ...base.parameters,
      };
      break;
    case "assign_chatbot":
    case "assign_agent":
    case "form_flow":
    case "response_saver":
    case "api":
    case "save_to_google_sheet":
    case "send_template":
      Object.assign(base.parameters, step.parameters || {});
      if (step.type === "form_flow") {
        base.parameters.recipient =
          step.recipient || base.parameters.recipient || "{{senderNumber}}";
      }
      break;
    default:
      Object.assign(base.parameters, step.parameters || {});
  }

  return base;
}

/** Linear chain: each node's default output → next node */
export function linearConnections(nodeIds, connectionPrefix = "c") {
  const connections = [];
  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    connections.push(
      conn(`${connectionPrefix}${i + 1}`, nodeIds[i], nodeIds[i + 1])
    );
  }
  return connections;
}

/**
 * Branch from a condition node: { [sourceHandle]: targetNodeId }
 */
export function branchConnections(sourceId, branches, connectionPrefix = "cb") {
  return Object.entries(branches).map(([handle, targetId], i) => ({
    id: `${connectionPrefix}_${i + 1}`,
    source: sourceId,
    sourceHandle: handle,
    target: targetId,
    targetHandle: "tgt",
  }));
}

/**
 * Compose a full flow from declarative steps (industry-agnostic).
 */
export function composeAutomationFlow(spec) {
  resetFlowBuilderIds();

  const {
    name,
    description = "",
    steps = [],
    connections: explicitConnections,
    triggers = [{ event_type: "message_received", conditions: {} }],
    settings = {},
    is_active = true,
    branch_after = null,
  } = spec;

  const nodes = steps.map((step, i) => stepToNode(step, i));
  const nodeIds = nodes.map((n) => n.id);

  let connections = explicitConnections;
  if (!connections?.length) {
    connections = linearConnections(nodeIds);
  }

  if (branch_after && typeof branch_after === "object") {
    const idx = nodes.findIndex((n) => n.id === branch_after.after_node_id);
    const condNode = nodes[idx];
    if (condNode) {
      connections = connections.filter(
        (c) => !(c.source === condNode.id && branch_after.remove_default_from)
      );
      connections.push(...branchConnections(condNode.id, branch_after.branches));
    }
  }

  return {
    name,
    description,
    is_active,
    triggers,
    settings,
    nodes,
    connections,
  };
}
