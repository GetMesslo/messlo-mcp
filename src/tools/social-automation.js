import * as z from "zod";
import { textResult } from "../utils/text.js";

const socialPlatformSchema = z.enum(["instagram", "facebook"]);
const automationTypeSchema = z.enum([
  "post_comment",
  "reel_comment",
  "story_mention",
  "story_reply",
]);
const replyTypeSchema = z.enum(["text", "media", "template", "chatbot"]);

export function registerSocialAutomationTools(server, client) {
  server.registerTool(
    "messlo_list_social_automations",
    {
      description:
        "List Instagram/Facebook comment-to-DM automations (social automation).",
      inputSchema: {
        workspace_id: z.string().optional(),
        platform: socialPlatformSchema.optional(),
      },
    },
    async ({ workspace_id, platform }) => {
      const qs = new URLSearchParams();
      if (workspace_id) qs.set("workspace_id", workspace_id);
      if (platform) qs.set("platform", platform);
      const q = qs.toString();
      return textResult(
        await client.get(`/api/social-automation${q ? `?${q}` : ""}`)
      );
    }
  );

  server.registerTool(
    "messlo_get_social_automation",
    {
      description: "Get one social automation by id.",
      inputSchema: {
        automation_id: z.string(),
      },
    },
    async ({ automation_id }) =>
      textResult(await client.get(`/api/social-automation/${automation_id}`))
  );

  server.registerTool(
    "messlo_create_social_automation",
    {
      description:
        "Create comment-to-DM automation for Instagram or Facebook. Use messlo_fetch_social_media to pick target_media_id.",
      inputSchema: {
        workspace_id: z.string(),
        platform: socialPlatformSchema,
        automation_type: automationTypeSchema,
        target_media_id: z
          .string()
          .optional()
          .describe("Post/reel/story media id, or 'all' for any post"),
        connection_id: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        matching_method: z
          .enum(["exact", "contains", "starts_with", "ends_with", "partial"])
          .optional(),
        partial_percentage: z.number().optional(),
        reply_type: replyTypeSchema.optional(),
        reply_id: z.string().optional(),
        reply_type_ref: z.string().optional(),
        auto_like_comment: z.boolean().optional(),
        auto_hide_comment: z.boolean().optional(),
        requires_following: z.boolean().optional(),
        follow_gate_message: z.string().optional(),
        delay_seconds: z.number().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...fields }) =>
      textResult(
        await client.post("/api/social-automation", {
          ...fields,
          ...(extra || {}),
        })
      )
  );

  server.registerTool(
    "messlo_update_social_automation",
    {
      description: "Update a social automation by id.",
      inputSchema: {
        automation_id: z.string(),
        extra: z.record(z.unknown()).optional().describe("Fields to update"),
      },
    },
    async ({ automation_id, extra }) =>
      textResult(
        await client.put(`/api/social-automation/${automation_id}`, extra || {})
      )
  );

  server.registerTool(
    "messlo_delete_social_automation",
    {
      description:
        "Delete a social automation. Requires confirm: true.",
      inputSchema: {
        automation_id: z.string(),
        confirm: z.boolean().optional(),
      },
    },
    async ({ automation_id, confirm }) => {
      if (!confirm) {
        return textResult({
          error: "Set confirm: true to delete the social automation.",
        });
      }
      return textResult(
        await client.delete(`/api/social-automation/${automation_id}`)
      );
    }
  );

  server.registerTool(
    "messlo_fetch_social_media",
    {
      description:
        "List Instagram/Facebook posts, reels, or stories for social automation targeting.",
      inputSchema: {
        workspace_id: z.string(),
        platform: socialPlatformSchema,
        media_type: z
          .enum(["post", "reel", "story"])
          .optional()
          .describe("Instagram media type filter"),
        page_id: z.string().optional().describe("Facebook page id filter"),
      },
    },
    async (body) =>
      textResult(await client.post("/api/social-automation/media", body))
  );

  server.registerTool(
    "messlo_retrigger_social_comments",
    {
      description:
        "Re-process comments on a post/reel for existing social automations.",
      inputSchema: {
        workspace_id: z.string(),
        platform: socialPlatformSchema,
        media_id: z.string(),
      },
    },
    async (body) =>
      textResult(await client.post("/api/social-automation/retrigger", body))
  );
}
