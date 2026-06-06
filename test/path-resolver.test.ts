import { describe, it, expect } from "vitest";
import { findNode, findParent, validatePath, PathError } from "../src/path-resolver.js";
import type { DomainTree } from "../src/types.js";

const tree: DomainTree = {
  name: "결제",
  description: "",
  nodes: [
    { name: "결제수단", nodes: [{ name: "카드결제" }, { name: "계좌이체" }] },
    { name: "환불", nodes: [{ name: "전체환불" }] },
  ],
};

describe("path-resolver", () => {
  it("findNode 빈 경로 = 루트", () => {
    expect(findNode(tree, [])?.name).toBe("결제");
  });

  it("findNode 1 depth (브랜치)", () => {
    expect(findNode(tree, ["결제수단"])?.name).toBe("결제수단");
  });

  it("findNode 2 depth (기능)", () => {
    expect(findNode(tree, ["결제수단", "카드결제"])?.name).toBe("카드결제");
  });

  it("findNode 존재하지 않는 경로 → undefined", () => {
    expect(findNode(tree, ["없음"])).toBeUndefined();
    expect(findNode(tree, ["결제수단", "없음"])).toBeUndefined();
  });

  it("findParent 루트의 부모 → undefined", () => {
    expect(findParent(tree, [])).toBeUndefined();
  });

  it("findParent 1 depth 의 부모 = 루트", () => {
    expect(findParent(tree, ["결제수단"])?.name).toBe("결제");
  });

  it("findParent 2 depth 의 부모 = 1 depth", () => {
    expect(findParent(tree, ["결제수단", "카드결제"])?.name).toBe("결제수단");
  });

  it("validatePath 정상", () => {
    expect(() => validatePath(tree, ["결제수단", "카드결제"])).not.toThrow();
  });

  it("validatePath 존재하지 않으면 throw PathError (R8 마커)", () => {
    expect(() => validatePath(tree, ["없음"])).toThrowError(PathError);
    expect(() => validatePath(tree, ["없음"])).toThrowError(/R8/);
  });
});
