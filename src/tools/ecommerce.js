import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerEcommerceTools(server, client) {
  server.registerTool(
    "messlo_list_catalogs",
    {
      description:
        "List WhatsApp commerce catalogs linked to a WABA (for catalog_picker / product automations).",
      inputSchema: {
        waba_id: z.string(),
        linked_only: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, only catalogs linked to this WABA"),
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
      },
    },
    async ({ waba_id, linked_only, page, limit, search }) => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (limit) qs.set("limit", String(limit));
      if (search) qs.set("search", search);
      const q = qs.toString();
      const path = linked_only
        ? `/api/ecommerce-catalog/waba/${waba_id}/linked-catalogs`
        : `/api/ecommerce-catalog/waba/${waba_id}/catalogs`;
      return textResult(await client.get(q ? `${path}?${qs}` : path));
    }
  );

  server.registerTool(
    "messlo_sync_catalogs",
    {
      description:
        "Pull catalogs from Meta Commerce Manager into Messlo for a WABA.",
      inputSchema: { waba_id: z.string() },
    },
    async ({ waba_id }) => {
      return textResult(
        await client.post(`/api/ecommerce-catalog/waba/${waba_id}/sync-catalogs`, {})
      );
    }
  );

  server.registerTool(
    "messlo_list_catalog_products",
    {
      description:
        "List products in a catalog (Mongo catalog _id from messlo_list_catalogs).",
      inputSchema: {
        catalog_id: z.string(),
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
      },
    },
    async ({ catalog_id, page, limit, search }) => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (limit) qs.set("limit", String(limit));
      if (search) qs.set("search", search);
      const q = qs.toString();
      const path = `/api/ecommerce-catalog/catalog/${catalog_id}/products`;
      return textResult(await client.get(q ? `${path}?${qs}` : path));
    }
  );

  server.registerTool(
    "messlo_link_catalog",
    {
      description: "Link a Meta catalog to a WABA for WhatsApp product messages.",
      inputSchema: {
        waba_id: z.string(),
        catalog_id: z.string().describe("Meta catalog id from sync/list"),
      },
    },
    async (body) => {
      return textResult(
        await client.post("/api/ecommerce-catalog/link-catalog", body)
      );
    }
  );
}
