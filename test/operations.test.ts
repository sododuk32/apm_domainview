import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import * as ops from "../src/operations.js";

let workspace: string;
let prevCwd: string;

beforeEach(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), "apm-domainview-ops-"));
  prevCwd = process.cwd();
  process.chdir(workspace);
});

afterEach(async () => {
  process.chdir(prevCwd);
  await fs.rm(workspace, { recursive: true, force: true });
});

describe("operations (CRUD)", () => {
  it("listTrees 빈 워크스페이스 → []", async () => {
    expect(await ops.listTrees()).toEqual([]);
  });

  it("createTree 새 도메인 + listTrees 반영", async () => {
    const tree = await ops.createTree("결제", "결제 처리");
    expect(tree.name).toBe("결제");
    expect(tree.description).toBe("결제 처리");
    expect(tree.nodes).toEqual([]);
    expect(await ops.listTrees()).toEqual(["결제"]);
  });

  it("createTree 중복 도메인 → throw (R4)", async () => {
    await ops.createTree("결제");
    await expect(ops.createTree("결제")).rejects.toThrow(/R4/);
  });

  it("readTree 정상", async () => {
    await ops.createTree("결제", "처리");
    const tree = await ops.readTree("결제");
    expect(tree.name).toBe("결제");
    expect(tree.description).toBe("처리");
  });

  it("updateMeta description 갱신 + 디스크 반영", async () => {
    await ops.createTree("결제", "초기");
    const updated = await ops.updateMeta("결제", "새 설명");
    expect(updated.description).toBe("새 설명");
    const re = await ops.readTree("결제");
    expect(re.description).toBe("새 설명");
  });

  it("addNode 1 depth (브랜치) 추가", async () => {
    await ops.createTree("결제", "");
    const tree = await ops.addNode("결제", [], "결제수단");
    expect(tree.nodes).toHaveLength(1);
    expect(tree.nodes[0]?.name).toBe("결제수단");
  });

  it("addNode 2 depth (기능) 추가", async () => {
    await ops.createTree("결제", "");
    await ops.addNode("결제", [], "결제수단");
    const tree = await ops.addNode("결제", ["결제수단"], "카드결제");
    expect(tree.nodes[0]?.nodes?.[0]?.name).toBe("카드결제");
  });

  it("addNode 깊이 4 시도 → throw (R1)", async () => {
    await ops.createTree("결제", "");
    await ops.addNode("결제", [], "결제수단");
    await ops.addNode("결제", ["결제수단"], "카드결제");
    await expect(
      ops.addNode("결제", ["결제수단", "카드결제"], "너무깊음"),
    ).rejects.toThrow(/R1/);
  });

  it("addNode 형제 중복 → throw (R2)", async () => {
    await ops.createTree("결제", "");
    await ops.addNode("결제", [], "결제수단");
    await expect(ops.addNode("결제", [], "결제수단")).rejects.toThrow(/R2/);
  });

  it("addNode 부모 경로 없음 → throw (R8)", async () => {
    await ops.createTree("결제", "");
    await expect(ops.addNode("결제", ["없음"], "x")).rejects.toThrow(/R8/);
  });

  it("updateNode 이름 변경 + R9 통과", async () => {
    await ops.createTree("결제", "");
    await ops.addNode("결제", [], "결제수단");
    await ops.addNode("결제", [], "환불");
    const tree = await ops.updateNode("결제", ["결제수단"], "결제방식");
    expect(tree.nodes.map((n) => n.name)).toEqual(["결제방식", "환불"]);
  });

  it("updateNode 새 이름이 형제와 중복 → throw (R9/R2)", async () => {
    await ops.createTree("결제", "");
    await ops.addNode("결제", [], "결제수단");
    await ops.addNode("결제", [], "환불");
    await expect(ops.updateNode("결제", ["결제수단"], "환불")).rejects.toThrow(/R2/);
  });

  it("deleteNode cascade — 자식 트리 통째 사라짐 (R10)", async () => {
    await ops.createTree("결제", "");
    await ops.addNode("결제", [], "결제수단");
    await ops.addNode("결제", ["결제수단"], "카드결제");
    await ops.addNode("결제", ["결제수단"], "계좌이체");
    const tree = await ops.deleteNode("결제", ["결제수단"]);
    expect(tree.nodes).toEqual([]);
  });

  it("deleteNode 기능 노드 한 개만 삭제 (형제 유지)", async () => {
    await ops.createTree("결제", "");
    await ops.addNode("결제", [], "결제수단");
    await ops.addNode("결제", ["결제수단"], "카드결제");
    await ops.addNode("결제", ["결제수단"], "계좌이체");
    const tree = await ops.deleteNode("결제", ["결제수단", "카드결제"]);
    const names = tree.nodes[0]?.nodes?.map((n) => n.name);
    expect(names).toEqual(["계좌이체"]);
  });
});
