/**
 * Teamleader for Tendi: reuse this repo's Teamleader MCP server (dist/index.js)
 * exactly the way pidgi does, as a child process over stdio, but expose only the
 * handful of tools a proposal needs (company lookup, deal, quotation, id lookups).
 *
 * Enabled when TEAMLEADER_CLIENT_ID, TEAMLEADER_CLIENT_SECRET and
 * TEAMLEADER_REFRESH_TOKEN are all set. `npm run build` must have produced
 * dist/index.js (the Render build command does this).
 */
import path from "path";
import { existsSync } from "fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const TEAMLEADER_TOOL_ALLOWLIST = new Set<string>([
  "teamleader_list_companies",
  "teamleader_get_company",
  "teamleader_create_company",
  "teamleader_list_contacts",
  "teamleader_list_deals",
  "teamleader_get_deal",
  "teamleader_create_deal",
  "teamleader_update_deal",
  "teamleader_list_deal_phases",
  "teamleader_list_deal_pipelines",
  "teamleader_list_users",
  "teamleader_list_tax_rates",
  "teamleader_list_quotations",
  "teamleader_get_quotation",
  "teamleader_create_quotation",
  "teamleader_update_quotation",
]);

export interface AnthropicToolDef {
  name: string;
  description: string;
  input_schema: any;
}

export function teamleaderEnabled(): boolean {
  return !!(process.env.TEAMLEADER_CLIENT_ID && process.env.TEAMLEADER_CLIENT_SECRET && process.env.TEAMLEADER_REFRESH_TOKEN);
}

export class TeamleaderBridge {
  private mcp: Client | null = null;
  tools: AnthropicToolDef[] = [];

  async connect(repoRoot: string): Promise<void> {
    const serverEntry = path.join(repoRoot, "dist", "index.js");
    if (!existsSync(serverEntry)) {
      throw new Error(`Teamleader MCP server not built: ${serverEntry} is missing. Run "npm run build" first.`);
    }
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [serverEntry],
      env: { ...process.env } as Record<string, string>,
    });
    const mcp = new Client({ name: "tendi", version: "1.0.0" }, { capabilities: {} });
    await mcp.connect(transport);
    const listed = await mcp.listTools();
    this.tools = listed.tools
      .filter((t) => TEAMLEADER_TOOL_ALLOWLIST.has(t.name))
      .map((t) => ({
        name: t.name,
        description: t.description ?? "",
        input_schema: (t.inputSchema as any) ?? { type: "object", properties: {} },
      }));
    this.mcp = mcp;
  }

  has(name: string): boolean {
    return this.tools.some((t) => t.name === name);
  }

  async call(name: string, input: any): Promise<{ text: string; isError: boolean }> {
    if (!this.mcp) return { isError: true, text: "Teamleader is not connected." };
    if (!this.has(name)) return { isError: true, text: `Tool ${name} is not exposed to Tendi.` };
    try {
      const res: any = await this.mcp.callTool({ name, arguments: input || {} });
      const text = Array.isArray(res?.content)
        ? res.content.map((c: any) => (typeof c?.text === "string" ? c.text : JSON.stringify(c))).join("\n")
        : JSON.stringify(res);
      return { text: text || "(no content)", isError: !!res?.isError };
    } catch (e: any) {
      return { isError: true, text: `Teamleader tool ${name} failed: ${e?.message || e}` };
    }
  }
}
