import * as z from "zod";
import { textResult } from "../utils/text.js";

const trainingItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export function registerChatbotTools(server, client) {
  server.registerTool(
    "messlo_list_chatbots",
    {
      description:
        "List AI chatbots for a WABA. Use chatbot _id in assign_chatbot automation nodes.",
      inputSchema: {
        waba_id: z.string().describe("WABA id from messlo_list_connections"),
        search: z.string().optional(),
      },
    },
    async ({ waba_id, search }) => {
      const qs = new URLSearchParams({ waba_id });
      if (search) qs.set("search", search);
      return textResult(await client.get(`/api/chatbots?${qs}`));
    }
  );

  server.registerTool(
    "messlo_get_chatbot",
    {
      description: "Get one chatbot by id (status, model, knowledge setup).",
      inputSchema: { chatbot_id: z.string() },
    },
    async ({ chatbot_id }) => {
      return textResult(await client.get(`/api/chatbots/${chatbot_id}`));
    }
  );

  server.registerTool(
    "messlo_create_chatbot",
    {
      description: "Create an AI sales/support chatbot for a connected WABA.",
      inputSchema: {
        waba_id: z.string(),
        name: z.string(),
        business_name: z.string().optional(),
        business_description: z.string().optional(),
        system_prompt: z.string().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...body }) => {
      return textResult(
        await client.post("/api/chatbots", { ...body, ...(extra || {}) })
      );
    }
  );

  server.registerTool(
    "messlo_update_chatbot",
    {
      description: "Update chatbot name, business context, or system prompt.",
      inputSchema: {
        chatbot_id: z.string(),
        name: z.string().optional(),
        business_name: z.string().optional(),
        business_description: z.string().optional(),
        system_prompt: z.string().optional(),
        status: z.enum(["active", "inactive", "draft"]).optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ chatbot_id, extra, ...body }) => {
      return textResult(
        await client.put(`/api/chatbots/${chatbot_id}`, { ...body, ...(extra || {}) })
      );
    }
  );

  server.registerTool(
    "messlo_train_chatbot",
    {
      description:
        "Train/update chatbot Q&A and business context. For RAG bots, also use messlo_add_chatbot_qna_source.",
      inputSchema: {
        chatbot_id: z.string(),
        business_name: z.string().optional(),
        business_description: z.string().optional(),
        training_data: z.array(trainingItemSchema).optional(),
        raw_training_text: z.string().optional(),
        knowledgeType: z.enum(["q&a", "text", "website"]).optional(),
        system_prompt: z.string().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ chatbot_id, extra, ...body }) => {
      return textResult(
        await client.post(`/api/chatbots/${chatbot_id}/train`, {
          ...body,
          ...(extra || {}),
        })
      );
    }
  );

  server.registerTool(
    "messlo_add_chatbot_qna_source",
    {
      description:
        "Add Q&A knowledge source to a chatbot (queued for ingest). Preferred for RAG training.",
      inputSchema: {
        chatbot_id: z.string(),
        title: z.string().optional().default("Q&A"),
        training_data: z.array(trainingItemSchema).min(1),
      },
    },
    async ({ chatbot_id, title, training_data }) => {
      return textResult(
        await client.post(`/api/chatbots/${chatbot_id}/knowledge-sources/qna`, {
          title,
          training_data,
        })
      );
    }
  );

  server.registerTool(
    "messlo_list_chatbot_knowledge_sources",
    {
      description: "List knowledge sources (qna, website, file) for a chatbot.",
      inputSchema: { chatbot_id: z.string() },
    },
    async ({ chatbot_id }) => {
      return textResult(
        await client.get(`/api/chatbots/${chatbot_id}/knowledge-sources`)
      );
    }
  );

  server.registerTool(
    "messlo_test_chatbot",
    {
      description:
        "Send a test message to an AI chatbot and get the reply (dev/debug).",
      inputSchema: {
        chatbot_id: z.string(),
        message: z.string(),
      },
    },
    async ({ chatbot_id, message }) => {
      return textResult(
        await client.post(`/api/chatbots/${chatbot_id}/chat`, { message })
      );
    }
  );

  server.registerTool(
    "messlo_delete_chatbot",
    {
      description: "Delete a chatbot. Requires confirm: true.",
      inputSchema: {
        chatbot_id: z.string(),
        confirm: z.boolean().optional().default(false),
      },
    },
    async ({ chatbot_id, confirm }) => {
      if (!confirm) {
        return textResult({
          deleted: false,
          hint: "Set confirm: true to delete.",
          chatbot_id,
        });
      }
      return textResult(await client.delete(`/api/chatbots/${chatbot_id}`));
    }
  );
}
