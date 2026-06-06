#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

const placeholder = (cmd: string) => () => {
  console.error(`[apm-domainview ${cmd}] not implemented (Phase 3)`);
  process.exit(1);
};

program
  .name("apm-domainview")
  .description("Feature Tree — store and view domain knowledge as a 3-level branch tree")
  .version("0.0.0");

program
  .command("list")
  .description("워크스페이스 내 도메인 목록")
  .action(placeholder("list"));

program
  .command("create <name>")
  .description("도메인 생성")
  .option("--desc <text>", "도메인 설명")
  .action(placeholder("create"));

program
  .command("read <name>")
  .description("도메인 트리 읽기")
  .action(placeholder("read"));

program
  .command("set-meta <name>")
  .description("도메인 메타 갱신 (description)")
  .option("--desc <text>", "새 설명")
  .action(placeholder("set-meta"));

program
  .command("add <domain> <pathThenName...>")
  .description("노드 추가 — 마지막 인자가 새 노드 이름, 그 앞은 부모 경로")
  .action(placeholder("add"));

program
  .command("rename <domain> <pathThenNewName...>")
  .description("노드 이름 변경 — 마지막 인자가 새 이름")
  .action(placeholder("rename"));

program
  .command("rm <domain> <path...>")
  .description("노드 삭제 (cascade)")
  .action(placeholder("rm"));

program
  .command("render <name>")
  .description("도메인 트리를 자체포함 HTML 로 렌더 (조회용)")
  .action(placeholder("render"));

await program.parseAsync(process.argv);
