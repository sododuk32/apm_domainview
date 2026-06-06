#!/usr/bin/env node
import { Command } from "commander";
import { promises as fs } from "node:fs";
import path from "node:path";
import * as ops from "./operations.js";
import { render } from "./html-renderer.js";
import { workspaceRoot } from "./storage.js";

const program = new Command();

program
  .name("apm-domainview")
  .description("Feature Tree — 도메인 지식을 가지(브랜치) 트리로 보관·조회")
  .version("0.0.1");

program
  .command("list")
  .description("워크스페이스 내 도메인 목록")
  .action(async () => {
    await run(async () => {
      const names = await ops.listTrees();
      if (names.length === 0) {
        console.log("(도메인 없음)");
      } else {
        for (const n of names) console.log(n);
      }
    });
  });

program
  .command("create <name>")
  .description("도메인 생성")
  .option("--desc <text>", "도메인 설명", "")
  .action(async (name: string, opts: { desc: string }) => {
    await run(async () => {
      await ops.createTree(name, opts.desc);
      console.log(`도메인 "${name}" 생성됨`);
    });
  });

program
  .command("read <name>")
  .description("도메인 트리 JSON 출력")
  .action(async (name: string) => {
    await run(async () => {
      const tree = await ops.readTree(name);
      console.log(JSON.stringify(tree, null, 2));
    });
  });

program
  .command("set-meta <name>")
  .description("도메인 description 갱신")
  .requiredOption("--desc <text>", "새 설명")
  .action(async (name: string, opts: { desc: string }) => {
    await run(async () => {
      await ops.updateMeta(name, opts.desc);
      console.log(`도메인 "${name}" description 갱신됨`);
    });
  });

program
  .command("add <domain> <pathThenName...>")
  .description("노드 추가 — 마지막 인자가 새 노드 이름, 그 앞은 부모 경로")
  .action(async (domain: string, args: string[]) => {
    await run(async () => {
      if (args.length === 0) {
        throw new Error("새 노드 이름이 필요합니다 (마지막 인자)");
      }
      const name = args[args.length - 1]!;
      const parentPath = args.slice(0, -1);
      await ops.addNode(domain, parentPath, name);
      console.log(
        `노드 "${name}" 을 [${parentPath.join(" / ") || "(루트)"}] 아래에 추가`,
      );
    });
  });

program
  .command("rename <domain> <pathThenNewName...>")
  .description("노드 이름 변경 — 마지막 인자가 새 이름, 그 앞은 대상 경로")
  .action(async (domain: string, args: string[]) => {
    await run(async () => {
      if (args.length < 2) {
        throw new Error("기존 경로와 새 이름이 필요합니다");
      }
      const newName = args[args.length - 1]!;
      const target = args.slice(0, -1);
      await ops.updateNode(domain, target, newName);
      console.log(`노드 [${target.join(" / ")}] → "${newName}"`);
    });
  });

program
  .command("rm <domain> <path...>")
  .description("노드 삭제 (cascade)")
  .action(async (domain: string, p: string[]) => {
    await run(async () => {
      if (p.length === 0) {
        throw new Error("삭제할 노드 경로가 필요합니다");
      }
      await ops.deleteNode(domain, p);
      console.log(`노드 [${p.join(" / ")}] 삭제됨`);
    });
  });

program
  .command("render <name>")
  .description("도메인 트리를 자체포함 HTML 로 렌더 (조회용)")
  .action(async (name: string) => {
    await run(async () => {
      const tree = await ops.readTree(name);
      const html = render(tree);
      const outPath = path.join(workspaceRoot(), name, "index.html");
      await fs.writeFile(outPath, html, "utf8");
      console.log(`렌더링 완료: ${outPath}`);
    });
  });

program
  .command("mcp")
  .description("MCP stdio 서버 시작 (AI 하네스에서 호출, apm.yml 의존 통해 자동)")
  .action(async () => {
    await run(async () => {
      const { startMcpServer } = await import("./mcp-server.js");
      await startMcpServer();
    });
  });

async function run(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

await program.parseAsync(process.argv);
