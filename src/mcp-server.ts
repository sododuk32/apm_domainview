import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import path from "node:path";
import { promises as fs } from "node:fs";
import * as ops from "./operations.js";
import { render } from "./html-renderer.js";
import { workspaceRoot } from "./storage.js";
import { GUIDE_SCHEMA, GUIDE_RULES, GUIDE_USAGE } from "./guides.js";

const GUIDE_URIS = {
  schema: "feature-tree://guide/schema",
  rules: "feature-tree://guide/rules",
  usage: "feature-tree://guide/usage",
} as const;

/** MCP stdio 서버 시작. 호출 후 connect() 가 stdio listen 으로 진입. */
export async function startMcpServer(): Promise<void> {
  const server = new Server(
    {
      name: "apm-domainview",
      version: "0.0.1",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "list_trees",
        description: "워크스페이스 도메인 목록",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "create_tree",
        description: "도메인 생성 (R4 중복 거부)",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
          required: ["name"],
        },
      },
      {
        name: "read_tree",
        description: "도메인 트리 읽기",
        inputSchema: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        },
      },
      {
        name: "update_meta",
        description: "도메인 description 갱신",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
          required: ["name", "description"],
        },
      },
      {
        name: "add_node",
        description: "경로 부모 아래에 새 노드 추가 (R1/R2/R6)",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string" },
            parentPath: { type: "array", items: { type: "string" } },
            name: { type: "string" },
          },
          required: ["domain", "parentPath", "name"],
        },
      },
      {
        name: "update_node",
        description: "노드 이름 변경 (R9 재검증)",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string" },
            path: { type: "array", items: { type: "string" } },
            newName: { type: "string" },
          },
          required: ["domain", "path", "newName"],
        },
      },
      {
        name: "delete_node",
        description: "노드 삭제 (R10 cascade)",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string" },
            path: { type: "array", items: { type: "string" } },
          },
          required: ["domain", "path"],
        },
      },
      {
        name: "render_html",
        description: "도메인 트리를 자체포함 HTML 로 렌더 (조회용)",
        inputSchema: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: rawArgs } = request.params;
    const a = (rawArgs ?? {}) as Record<string, unknown>;
    try {
      const text = await dispatch(name, a);
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: (err as Error).message }],
        isError: true,
      };
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: GUIDE_URIS.schema,
        name: "schema",
        description: "스키마 규약",
        mimeType: "text/markdown",
      },
      {
        uri: GUIDE_URIS.rules,
        name: "rules",
        description: "비즈니스 규칙 R1~R12",
        mimeType: "text/markdown",
      },
      {
        uri: GUIDE_URIS.usage,
        name: "usage",
        description: "자연어 → 툴 매핑 + CLI 예시",
        mimeType: "text/markdown",
      },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const text = guideFor(uri);
    if (text === undefined) {
      throw new Error(`unknown resource: ${uri}`);
    }
    return { contents: [{ uri, mimeType: "text/markdown", text }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function guideFor(uri: string): string | undefined {
  switch (uri) {
    case GUIDE_URIS.schema:
      return GUIDE_SCHEMA;
    case GUIDE_URIS.rules:
      return GUIDE_RULES;
    case GUIDE_URIS.usage:
      return GUIDE_USAGE;
    default:
      return undefined;
  }
}

async function dispatch(name: string, a: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "list_trees":
      return JSON.stringify(await ops.listTrees());
    case "create_tree":
      return JSON.stringify(
        await ops.createTree(String(a["name"]), String(a["description"] ?? "")),
      );
    case "read_tree":
      return JSON.stringify(await ops.readTree(String(a["name"])));
    case "update_meta":
      return JSON.stringify(
        await ops.updateMeta(String(a["name"]), String(a["description"])),
      );
    case "add_node":
      return JSON.stringify(
        await ops.addNode(
          String(a["domain"]),
          (a["parentPath"] as string[]) ?? [],
          String(a["name"]),
        ),
      );
    case "update_node":
      return JSON.stringify(
        await ops.updateNode(
          String(a["domain"]),
          (a["path"] as string[]) ?? [],
          String(a["newName"]),
        ),
      );
    case "delete_node":
      return JSON.stringify(
        await ops.deleteNode(String(a["domain"]), (a["path"] as string[]) ?? []),
      );
    case "render_html": {
      const domain = String(a["name"]);
      const tree = await ops.readTree(domain);
      const html = render(tree);
      const outPath = path.join(workspaceRoot(), domain, "index.html");
      await fs.writeFile(outPath, html, "utf8");
      return outPath;
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}
