import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerImportOpsTools(server, client) {
  server.registerTool(
    "messlo_import_contacts_csv",
    {
      description:
        "Import contacts from a CSV/XLSX file on the machine running MCP. Returns background job id; poll messlo_get_import_job.",
      inputSchema: {
        file_path: z
          .string()
          .describe("Absolute path to .csv, .xlsx, or .xls on local disk"),
      },
    },
    async ({ file_path }) => {
      const result = await client.uploadFile("/api/contacts/import", file_path);
      return textResult({
        ...result,
        hint: "Poll messlo_list_import_jobs or messlo_get_import_job for completion.",
      });
    }
  );

  server.registerTool(
    "messlo_list_import_jobs",
    {
      description: "List contact import jobs and status.",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(50).optional().default(10),
        status: z
          .enum(["pending", "processing", "completed", "failed"])
          .optional(),
      },
    },
    async ({ page, limit, status }) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) qs.set("status", status);
      return textResult(await client.get(`/api/import-jobs?${qs}`));
    }
  );

  server.registerTool(
    "messlo_get_import_job",
    {
      description: "Get import job details by id.",
      inputSchema: { job_id: z.string() },
    },
    async ({ job_id }) => {
      return textResult(await client.get(`/api/import-jobs/${job_id}`));
    }
  );
}
