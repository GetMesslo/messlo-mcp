import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMessloClient } from "./client.js";
import { registerOnboardingTools } from "./tools/onboarding.js";
import { registerApiKeyTools } from "./tools/api-keys.js";
import { registerMessagingTools } from "./tools/messaging.js";
import { registerConversationTools } from "./tools/conversations.js";
import { registerTemplateTools } from "./tools/templates.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerCrmTools } from "./tools/crm.js";
import { registerIndustryPackTools } from "./tools/industry-packs.js";
import { registerCampaignTools } from "./tools/campaigns.js";
import { registerWhatsAppLoginTools } from "./tools/whatsapp-login.js";
import { registerCallApiTool } from "./tools/call-api.js";
import { registerAutomationTools } from "./tools/automation.js";
import { registerChatbotTools } from "./tools/chatbots.js";
import { registerMessageBotTools } from "./tools/message-bots.js";
import { registerQuickReplyTools } from "./tools/quick-replies.js";
import { registerFormTools } from "./tools/forms.js";
import { registerAgentTools } from "./tools/agents.js";
import { registerSequenceTools } from "./tools/sequences.js";
import { registerGoogleIntegrationTools } from "./tools/google-integration.js";
import { registerSubscriptionOpsTools } from "./tools/subscription-ops.js";
import { registerKanbanTools } from "./tools/kanban.js";
import { registerImportOpsTools } from "./tools/import-ops.js";
import { registerWhatsAppSetupTools } from "./tools/whatsapp-setup.js";
import { registerReplyMaterialTools } from "./tools/reply-materials.js";
import { registerEcommerceTools } from "./tools/ecommerce.js";
import { registerEcommerceWebhookTools } from "./tools/ecommerce-webhooks.js";
import { registerWhatsAppProfileTools } from "./tools/whatsapp-profile.js";
import { registerDocResources } from "./resources/docs.js";
import { registerGuideResources } from "./resources/guides.js";

export function createMessloMcpServer(config) {
  const client = createMessloClient(config);

  const server = new McpServer({
    name: "messlo",
    version: "1.6.0",
  });

  registerOnboardingTools(server, client);
  registerApiKeyTools(server, client);
  registerMessagingTools(server, client);
  registerConversationTools(server, client);
  registerTemplateTools(server, client);
  registerContactTools(server, client);
  registerCrmTools(server, client);
  registerIndustryPackTools(server, client);
  registerCampaignTools(server, client);
  registerWhatsAppLoginTools(server, client);
  registerCallApiTool(server, client);
  registerAutomationTools(server, client);
  registerChatbotTools(server, client);
  registerMessageBotTools(server, client);
  registerQuickReplyTools(server, client);
  registerFormTools(server, client);
  registerAgentTools(server, client);
  registerSequenceTools(server, client);
  registerGoogleIntegrationTools(server, client);
  registerSubscriptionOpsTools(server, client);
  registerKanbanTools(server, client);
  registerImportOpsTools(server, client);
  registerWhatsAppSetupTools(server, client);
  registerReplyMaterialTools(server, client);
  registerEcommerceTools(server, client);
  registerEcommerceWebhookTools(server, client);
  registerWhatsAppProfileTools(server, client);
  registerDocResources(server);
  registerGuideResources(server);

  return server;
}
