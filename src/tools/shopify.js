import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerShopifyTools(server, client) {
  server.registerTool(
    "messlo_get_shopify_config",
    {
      description: "Get current Shopify store connection config (tokens masked).",
      inputSchema: {},
    },
    async () => textResult(await client.get("/api/shopify/config"))
  );

  server.registerTool(
    "messlo_save_shopify_config",
    {
      description:
        "Save Shopify store credentials. Requires shop_domain and admin_api_access_token.",
      inputSchema: {
        shop_domain: z.string().describe("e.g. mystore.myshopify.com"),
        admin_api_access_token: z.string().optional(),
        client_id: z.string().optional(),
        client_secret: z.string().optional(),
        is_active: z.boolean().optional(),
      },
    },
    async (body) => textResult(await client.post("/api/shopify/config", body))
  );

  server.registerTool(
    "messlo_generate_shopify_token",
    {
      description:
        "Exchange Shopify client credentials for an admin API access token.",
      inputSchema: {
        shop_domain: z.string(),
        client_id: z.string(),
        client_secret: z.string(),
      },
    },
    async (body) =>
      textResult(await client.post("/api/shopify/generate-token", body))
  );

  server.registerTool(
    "messlo_sync_shopify_products",
    {
      description: "Sync products from connected Shopify store into Messlo.",
      inputSchema: {},
    },
    async () => textResult(await client.post("/api/shopify/sync", {}))
  );

  server.registerTool(
    "messlo_list_shopify_products",
    {
      description: "List synced Shopify products.",
      inputSchema: {
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
      },
    },
    async ({ page, limit, search }) => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (limit) qs.set("limit", String(limit));
      if (search) qs.set("search", search);
      const q = qs.toString();
      return textResult(
        await client.get(`/api/shopify/products${q ? `?${q}` : ""}`)
      );
    }
  );

  server.registerTool(
    "messlo_get_shopify_catalog_status",
    {
      description: "Check WhatsApp catalog linkage status for Shopify products.",
      inputSchema: {
        waba_id: z.string().optional(),
      },
    },
    async ({ waba_id }) => {
      const qs = waba_id ? `?waba_id=${encodeURIComponent(waba_id)}` : "";
      return textResult(await client.get(`/api/shopify/catalog-status${qs}`));
    }
  );

  server.registerTool(
    "messlo_setup_shopify_catalog",
    {
      description: "Set up Meta commerce catalog for Shopify products.",
      inputSchema: {
        waba_id: z.string(),
        catalog_name: z.string().optional(),
      },
    },
    async (body) =>
      textResult(await client.post("/api/shopify/setup-catalog", body))
  );

  server.registerTool(
    "messlo_push_shopify_to_whatsapp",
    {
      description: "Push synced Shopify products to WhatsApp commerce catalog.",
      inputSchema: {
        waba_id: z.string(),
        catalog_id: z.string().optional(),
        product_ids: z.array(z.string()).optional(),
      },
    },
    async (body) =>
      textResult(await client.post("/api/shopify/push-to-whatsapp", body))
  );

  server.registerTool(
    "messlo_disconnect_shopify",
    {
      description:
        "Disconnect Shopify integration. Requires confirm: true.",
      inputSchema: {
        confirm: z.boolean().optional(),
      },
    },
    async ({ confirm }) => {
      if (!confirm) {
        return textResult({
          error: "Set confirm: true to disconnect Shopify.",
        });
      }
      return textResult(await client.delete("/api/shopify/config"));
    }
  );
}
