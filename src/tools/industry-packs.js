import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerIndustryPackTools(server, client) {
  server.registerTool(
    "messlo_list_industry_packs",
    {
      description:
        "List industry packs (real estate, school, NGO, etc.) with slugs for apply/preview. Uses public catalog (no admin required).",
      inputSchema: {
        authenticated_list: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, GET /api/industry-packs (admin/settings permission)"),
      },
    },
    async ({ authenticated_list }) => {
      if (authenticated_list) {
        return textResult(await client.get("/api/industry-packs"));
      }
      return textResult(await client.get("/api/industry-packs/public"));
    }
  );

  server.registerTool(
    "messlo_preview_industry_pack",
    {
      description:
        "Preview what an industry pack provisions (flows, tags, segments) with optional personalization.",
      inputSchema: {
        pack_slug: z.string().describe("e.g. real_estate_builder, school, ngo"),
        personalization: z
          .record(z.unknown())
          .optional()
          .describe("e.g. { company_name, city } — passed as query params"),
      },
    },
    async ({ pack_slug, personalization }) => {
      const qs = new URLSearchParams();
      if (personalization) {
        for (const [k, v] of Object.entries(personalization)) {
          if (v !== undefined && v !== null) qs.set(k, String(v));
        }
      }
      const q = qs.toString();
      return textResult(
        await client.get(
          `/api/industry-packs/public/${encodeURIComponent(pack_slug)}/preview${q ? `?${q}` : ""}`
        )
      );
    }
  );

  server.registerTool(
    "messlo_apply_industry_pack",
    {
      description:
        "Apply an industry pack to the workspace: tags, segments, custom fields, automation flows, chatbot, etc.",
      inputSchema: {
        pack_slug: z.string(),
        personalization: z
          .record(z.unknown())
          .optional()
          .describe("company_name, city, and other pack fields"),
        setup_overrides: z
          .record(z.unknown())
          .optional()
          .describe("projects, property_types, integrations overrides"),
        confirm: z
          .boolean()
          .optional()
          .default(false)
          .describe("Must be true to apply (mutates workspace)"),
      },
    },
    async ({ pack_slug, personalization, setup_overrides, confirm }) => {
      if (!confirm) {
        return textResult({
          applied: false,
          hint: "Set confirm: true after reviewing messlo_preview_industry_pack.",
          pack_slug,
        });
      }
      return textResult(
        await client.post("/api/industry-packs/apply", {
          pack_slug,
          personalization,
          setup_overrides,
        })
      );
    }
  );

  server.registerTool(
    "messlo_resync_industry_pack",
    {
      description:
        "Re-sync automation flows from the applied industry pack (e.g. after updating projects/personalization).",
      inputSchema: {
        personalization: z.record(z.unknown()).optional(),
        setup_overrides: z
          .record(z.unknown())
          .optional()
          .describe("projects, property_types, integrations"),
        confirm: z
          .boolean()
          .optional()
          .default(false)
          .describe("Must be true to resync flows"),
      },
    },
    async ({ personalization, setup_overrides, confirm }) => {
      if (!confirm) {
        return textResult({
          resynced: false,
          hint: "Set confirm: true to resync pack flows for this workspace.",
        });
      }
      return textResult(
        await client.post("/api/industry-packs/resync-flows", {
          personalization,
          setup_overrides,
        })
      );
    }
  );
}
