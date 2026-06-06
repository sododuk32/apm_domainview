import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { exists, listDomains, readDomain, writeDomain } from "../src/storage.js";
import type { DomainTree } from "../src/types.js";

const sample: DomainTree = {
  name: "결제",
  description: "결제 처리",
  nodes: [{ name: "결제수단", nodes: [{ name: "카드결제" }] }],
};

let workspace: string;
let prevCwd: string;

beforeEach(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), "apm-domainview-"));
  prevCwd = process.cwd();
  process.chdir(workspace);
});

afterEach(async () => {
  process.chdir(prevCwd);
  await fs.rm(workspace, { recursive: true, force: true });
});

describe("storage", () => {
  it("listDomains 빈 워크스페이스 → []", async () => {
    expect(await listDomains()).toEqual([]);
  });

  it("writeDomain → exists → readDomain 라운드트립", async () => {
    await writeDomain("결제", sample);
    expect(await exists("결제")).toBe(true);
    const round = await readDomain("결제");
    expect(round.name).toBe("결제");
    expect(round.description).toBe("결제 처리");
    expect(round.nodes[0]?.name).toBe("결제수단");
    expect(round.nodes[0]?.nodes?.[0]?.name).toBe("카드결제");
  });

  it("readDomain 존재하지 않음 → throw", async () => {
    await expect(readDomain("없음")).rejects.toThrow(/없음/);
  });

  it("exists false", async () => {
    expect(await exists("없음")).toBe(false);
  });

  it("listDomains 다중 도메인 — 정렬 반환", async () => {
    await writeDomain("결제", { name: "결제", description: "", nodes: [] });
    await writeDomain("주문", { name: "주문", description: "", nodes: [] });
    await writeDomain("배송", { name: "배송", description: "", nodes: [] });
    const list = await listDomains();
    expect(list).toHaveLength(3);
    expect(list).toEqual([...list].sort());
    expect(new Set(list)).toEqual(new Set(["결제", "주문", "배송"]));
  });

  it("R7 빈 nodes 자식 정규화 — 디스크에 빈 배열 없음", async () => {
    const withEmpty: DomainTree = {
      name: "x",
      description: "",
      nodes: [{ name: "br", nodes: [{ name: "leaf", nodes: [] }] }],
    };
    await writeDomain("x", withEmpty);
    const raw = await fs.readFile(path.join(workspace, "x", "index.json"), "utf8");
    expect(raw).not.toMatch(/"nodes":\s*\[\s*\]/);
  });

  it("R11 파일명 고정 — index.json", async () => {
    await writeDomain("결제", sample);
    await expect(
      fs.access(path.join(workspace, "결제", "index.json")),
    ).resolves.toBeUndefined();
  });

  it("R3 폴더명 ≠ 루트 name → write 거부", async () => {
    const wrong: DomainTree = { name: "주문", description: "", nodes: [] };
    await expect(writeDomain("결제", wrong)).rejects.toThrow(/R3/);
  });
});
