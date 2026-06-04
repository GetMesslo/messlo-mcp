import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerEcommerceWebhookTools(server, client) {
  server.registerTool(
    "messlo_list_ecommerce_webhooks",
    {
      description:
        "List ecommerce/order webhooks (Shopify, WooCommerce, custom). Use trigger URL in your store after mapping a template.",
      inputSchema: {
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
        is_active: z.boolean().optional(),
      },
    },
    async ({ page, limit, search, is_active }) => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (limit) qs.set("limit", String(limit));
      if (search) qs.set("search", search);
      if (is_active !== undefined) qs.set("is_active", String(is_active));
      const q = qs.toString();
      return textResult(
        await client.get(`/api/ecommerce-webhook/list${q ? `?${qs}` : ""}`)
      );
    }
  );

  server.registerTool(
    "messlo_create_ecommerce_webhook",
    {
      description:
        "Create an inbound webhook endpoint for order/checkout events. Returns webhook_url and secret_key (save once).",
      inputSchema: {
        webhook_name: z.string(),
        require_auth: z.boolean().optional().default(false),
        method: z.enum(["POST", "GET", "PUT"]).optional().default("POST"),
      },
    },
    async (body) => {
      const result = await client.post("/api/ecommerce-webhook/create", body);
      return textResult({
        ...result,
        hint: "POST your store payload to webhook_url. Then messlo_map_ecommerce_webhook_template after first payload is captured.",
      });
    }
  );

  server.registerTool(
    "messlo_get_ecommerce_webhook",
    {
      description: "Get ecommerce webhook details including field_mapping and template.",
      inputSchema: { webhook_id: z.string() },
    },
    async ({ webhook_id }) => {
      return textResult(await client.get(`/api/ecommerce-webhook/${webhook_id}`));
    }
  );

  server.registerTool(
    "messlo_map_ecommerce_webhook_template",
    {
      description:
        "Map an approved template to a webhook. variables map payload paths to template vars; use for dynamic PDF via header field path.",
      inputSchema: {
        webhook_id: z.string(),
        template_id: z.string().describe("MongoDB template _id (must be approved)"),
        phone_number_field: z
          .string()
          .optional()
          .default("customer.phone")
          .describe("Dot path in payload for recipient phone"),
        variables: z
          .record(z.string())
          .optional()
          .describe('e.g. { "1": "order.id", "header": "invoice.pdf_url" }'),
      },
    },
    async ({ webhook_id, ...body }) => {
      return textResult(
        await client.post(
          `/api/ecommerce-webhook/${webhook_id}/map-template`,
          body
        )
      );
    }
  );

  server.registerTool(
    "messlo_toggle_ecommerce_webhook",
    {
      description: "Enable or disable an ecommerce webhook.",
      inputSchema: {
        webhook_id: z.string(),
        is_active: z.boolean(),
      },
    },
    async ({ webhook_id, is_active }) => {
      return textResult(
        await client.patch(`/api/ecommerce-webhook/${webhook_id}/toggle`, {
          is_active,
        })
      );
    }
  );

  server.registerTool(
    "messlo_delete_ecommerce_webhook",
    {
      description: "Delete an ecommerce webhook. Requires confirm: true.",
      inputSchema: {
        webhook_id: z.string(),
        confirm: z
          .boolean()
          .describe("Must be true to delete"),
      },
    },
    async ({ webhook_id, confirm }) => {
      if (confirm !== true) {
        return textResult({
          error: "Set confirm: true to delete this webhook.",
        });
      }
      return textResult(
        await client.delete(`/api/ecommerce-webhook/${webhook_id}`)
      );
    }
  );
}
