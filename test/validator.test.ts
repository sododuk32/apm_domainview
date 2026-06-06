import { describe, it, expect } from "vitest";
import {
  validateTree,
  validateSiblingUnique,
  validateDepth,
  validateNodeKeys,
  validateRootNameMatchesFolder,
} from "../src/validator.js";
import type { DomainTree, TreeNode } from "../src/types.js";

const sample: DomainTree = {
  name: "결제",
  description: "결제 처리 도메인",
  nodes: [
    {
      name: "결제수단",
      nodes: [{ name: "카드결제" }, { name: "계좌이체" }],
    },
    {
      name: "환불",
      nodes: [{ name: "전체환불" }],
    },
  ],
};

describe("validator (R1~R12)", () => {
  it("정상 트리는 통과", () => {
    expect(() => validateTree(sample)).not.toThrow();
  });

  it("R1 깊이 초과(자식 depth=3) 거부", () => {
    const deep: DomainTree = {
      name: "결제",
      description: "",
      nodes: [
        {
          name: "결제수단",
          nodes: [
            {
              name: "카드결제",
              nodes: [{ name: "너무깊음" }],
            },
          ],
        },
      ],
    };
    expect(() => validateTree(deep)).toThrowError(/R1/);
  });

  it("R2 형제 간 이름 중복 거부", () => {
    const dup: DomainTree = {
      name: "결제",
      description: "",
      nodes: [{ name: "결제수단" }, { name: "결제수단" }],
    };
    expect(() => validateTree(dup)).toThrowError(/R2/);
  });

  it("R3 폴더명 = 루트 name 일치 통과", () => {
    expect(() => validateRootNameMatchesFolder("결제", sample)).not.toThrow();
  });

  it("R3 폴더명 ≠ 루트 name 거부", () => {
    expect(() => validateRootNameMatchesFolder("주문", sample)).toThrowError(/R3/);
  });

  it.todo("R4 도메인 폴더명 중복 금지 (storage/operations 단계)");

  it("R5 루트는 description 키 허용", () => {
    const rootLike = { name: "결제", description: "ok", nodes: [] } as unknown as TreeNode;
    expect(() => validateNodeKeys(rootLike, true)).not.toThrow();
  });

  it("R6 자식 노드에 description 키 거부", () => {
    const child = { name: "x", description: "안 됨" } as unknown as TreeNode;
    expect(() => validateNodeKeys(child, false)).toThrowError(/R6/);
  });

  it("R6 자식 노드에 임의 키 거부", () => {
    const child = { name: "x", extra: 1 } as unknown as TreeNode;
    expect(() => validateNodeKeys(child, false)).toThrowError(/R6/);
  });

  it("R6 노드 name 비어 있으면 거부", () => {
    const empty = { name: "" } as TreeNode;
    expect(() => validateNodeKeys(empty, false)).toThrowError(/R6/);
  });

  it("validateSiblingUnique 직접 — 중복 거부", () => {
    expect(() => validateSiblingUnique([{ name: "a" }, { name: "a" }])).toThrowError(/R2/);
  });

  it("validateDepth 깊이 초과 거부", () => {
    expect(() => validateDepth({ name: "x" }, 3)).toThrowError(/R1/);
  });

  it.todo("R7 빈 nodes 정규화 (storage 단계)");
  it.todo("R8 경로 기반 식별 — id 없음 (path-resolver 단계)");
  it.todo("R9 update_node 후 형제 유일성 재검증 (operations 단계)");
  it.todo("R10 delete cascade (operations 단계)");
  it.todo("R11 파일명 고정 (storage 단계)");
  it.todo("R12 가이드는 resource 채널 (Phase 4)");
});
