/**
 * Teamleader Files Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

const SUBJECT_TYPES = [
  "company",
  "contact",
  "deal",
  "invoice",
  "creditNote",
  "nextgenProject",
  "product",
  "project",
  "ticket",
] as const;

const UPLOAD_SUBJECT_TYPES = [
  ...SUBJECT_TYPES,
  "temporary",
] as const;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function registerFileTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Files ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_files",
    "List files attached to a Teamleader entity (company, contact, deal, invoice, project, ticket, etc.). Returns file names, sizes, and IDs.",
    {
      subject_type: z
        .enum(SUBJECT_TYPES)
        .describe("Type of entity to list files for"),
      subject_id: z.string().describe("ID of the entity"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z
        .number()
        .optional()
        .describe("Page size (default: 20)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        filter: {
          subject: {
            type: params.subject_type,
            id: params.subject_id,
          },
        },
      };

      if (params.page || params.page_size) {
        body.page = {
          number: params.page ?? 1,
          size: params.page_size ?? 20,
        };
      }

      const result = await client.request<{
        data: Array<{
          id: string;
          subject: { type: string; id: string } | null;
          name: string;
          mime_type: string;
          size: number;
          updated_at: string;
          uploaded_by: { type: string; id: string } | null;
          folder: string;
        }>;
      }>({
        endpoint: "files.list",
        body,
      });

      const files = result.data ?? [];
      if (files.length === 0) {
        return respond("No files found.");
      }

      const lines = files.map(
        (f, i) =>
          `${i + 1}. ${f.name} (${formatFileSize(f.size)}, ${f.mime_type})\n   ID: ${f.id} | Folder: ${f.folder} | Updated: ${f.updated_at}`
      );

      return respond(
        `Found ${files.length} file(s):\n\n${lines.join("\n")}`
      );
    }
  );

  // ── Get File Info ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_file",
    "Get details for a single file in Teamleader Focus (name, size, mime type, folder, subject).",
    {
      id: z.string().describe("The file ID"),
    },
    async (params) => {
      const result = await client.request<{
        data: {
          id: string;
          subject: { type: string; id: string } | null;
          name: string;
          mime_type: string;
          size: number;
          updated_at: string;
          uploaded_by: { type: string; id: string } | null;
          folder: string;
        };
      }>({
        endpoint: "files.info",
        body: { id: params.id },
      });

      const f = result.data;
      const lines = [
        `Name: ${f.name}`,
        `ID: ${f.id}`,
        `Size: ${formatFileSize(f.size)}`,
        `MIME: ${f.mime_type}`,
        `Folder: ${f.folder}`,
        `Updated: ${f.updated_at}`,
      ];
      if (f.subject) {
        lines.push(`Subject: ${f.subject.type} (${f.subject.id})`);
      }
      if (f.uploaded_by) {
        lines.push(`Uploaded by: ${f.uploaded_by.type} (${f.uploaded_by.id})`);
      }

      return respond(lines.join("\n"));
    }
  );

  // ── Download File ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_download_file",
    "Get a temporary download URL for a file in Teamleader Focus. The URL expires after a short period.",
    {
      id: z.string().describe("The file ID"),
    },
    async (params) => {
      const result = await client.request<{
        data: {
          location: string;
          expires_at: string;
        };
      }>({
        endpoint: "files.download",
        body: { id: params.id },
      });

      return respond(
        `Download URL: ${result.data.location}\nExpires at: ${result.data.expires_at}`
      );
    }
  );

  // ── Delete File ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_file",
    "Delete a file from Teamleader Focus. This action is irreversible.",
    {
      id: z.string().describe("The file ID to delete"),
    },
    async (params) => {
      await client.request({
        endpoint: "files.delete",
        body: { id: params.id },
      });

      return respond(`File ${params.id} deleted.`);
    }
  );

  // ── Upload File ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_upload_file",
    "Upload a file to a Teamleader entity. Two-step process: requests an upload URL from the API, then uploads the binary content to that URL. Returns the upload URL and expiry if no content is provided (for manual upload).",
    {
      name: z
        .string()
        .describe(
          "Filename including extension (e.g. 'report.pdf')"
        ),
      subject_type: z
        .enum(UPLOAD_SUBJECT_TYPES)
        .describe(
          "Type of entity to attach file to. Use 'temporary' for unlinked files (auto-deleted after 24h)"
        ),
      subject_id: z
        .string()
        .optional()
        .describe(
          "ID of the entity. Not required if subject_type is 'temporary'"
        ),
      folder: z
        .string()
        .optional()
        .describe(
          "Folder name to store file in (defaults to 'General')"
        ),
      content_base64: z
        .string()
        .optional()
        .describe(
          "Base64-encoded file content. If provided, the file is uploaded automatically. If omitted, only the upload URL is returned."
        ),
    },
    async (params) => {
      // Step 1: Get upload URL from Teamleader API
      const uploadBody: Record<string, unknown> = {
        name: params.name,
        subject: {
          type: params.subject_type,
          ...(params.subject_id ? { id: params.subject_id } : {}),
        },
      };
      if (params.folder) uploadBody.folder = params.folder;

      const result = await client.request<{
        data: {
          location: string;
          expires_at: string;
        };
      }>({
        endpoint: "files.upload",
        body: uploadBody,
      });

      const { location, expires_at } = result.data;

      // Step 2: If base64 content provided, upload the binary
      if (params.content_base64) {
        const binary = Buffer.from(params.content_base64, "base64");

        const uploadResponse = await fetch(location, {
          method: "POST",
          body: binary,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(
            `File upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`
          );
        }

        return respond(
          `File '${params.name}' uploaded successfully (${formatFileSize(binary.length)}).`
        );
      }

      // No content provided — return URL for manual upload
      return respond(
        `Upload URL obtained. POST binary file content to:\n${location}\nExpires at: ${expires_at}`
      );
    }
  );
}
