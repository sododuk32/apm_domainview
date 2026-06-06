import type { DomainTree, TreeNode } from "./types.js";

/** 깊이 상한: 루트=0 / 브랜치=1 / 기능=2. 자식 노드는 depth 1~2 만 허용. */
export const MAX_CHILD_DEPTH = 2;

export class ValidationError extends Error {
  constructor(public readonly rule: string, message: string) {
    super(`[${rule}] ${message}`);
    this.name = "ValidationError";
  }
}

/**
 * 트리 전체 검증.
 * 적용 규칙: R1 깊이 / R2 형제 유일 / R5 루트 메타 / R6 자식 키 + 스키마 형.
 * R3 폴더명 일치는 `validateRootNameMatchesFolder` 로.
 * R7 빈 nodes 정규화는 storage 단계에서.
 */
export function validateTree(tree: DomainTree): void {
  validateRootShape(tree);
  validateSiblingUnique(tree.nodes);
  for (const child of tree.nodes) {
    validateNodeRec(child, 1);
  }
}

/** R2 형제 간 이름 유일 검증 */
export function validateSiblingUnique(siblings: ReadonlyArray<TreeNode>): void {
  const seen = new Set<string>();
  for (const s of siblings) {
    if (seen.has(s.name)) {
      throw new ValidationError("R2", `duplicate sibling name: ${s.name}`);
    }
    seen.add(s.name);
  }
}

/** R1 깊이 제한 (자식 노드 depth ≤ MAX_CHILD_DEPTH) */
export function validateDepth(_node: TreeNode, depth: number): void {
  if (depth > MAX_CHILD_DEPTH) {
    throw new ValidationError("R1", `depth ${depth} exceeds max ${MAX_CHILD_DEPTH}`);
  }
}

/** R5 루트만 description 허용 + R6 자식 노드는 name + nodes 만 허용 */
export function validateNodeKeys(node: TreeNode, isRoot: boolean): void {
  const allowed = isRoot
    ? new Set(["name", "description", "nodes"])
    : new Set(["name", "nodes"]);
  for (const key of Object.keys(node)) {
    if (!allowed.has(key)) {
      throw new ValidationError(
        isRoot ? "R5" : "R6",
        `disallowed key "${key}" on ${isRoot ? "root" : "child"} node`,
      );
    }
  }
  if (typeof node.name !== "string" || node.name.length === 0) {
    throw new ValidationError("R6", "node name must be non-empty string");
  }
  if (node.nodes !== undefined && !Array.isArray(node.nodes)) {
    throw new ValidationError("R6", "nodes must be array when present");
  }
}

/** R3 폴더명과 루트 name 일치 검증 */
export function validateRootNameMatchesFolder(folderName: string, tree: DomainTree): void {
  if (folderName !== tree.name) {
    throw new ValidationError(
      "R3",
      `folder name "${folderName}" != root name "${tree.name}"`,
    );
  }
}

// — 내부 —

function validateRootShape(tree: DomainTree): void {
  if (typeof tree.name !== "string" || tree.name.length === 0) {
    throw new ValidationError("R5", "root name must be non-empty string");
  }
  if (typeof tree.description !== "string") {
    throw new ValidationError("R5", "root description must be string");
  }
  if (!Array.isArray(tree.nodes)) {
    throw new ValidationError("R5", "root nodes must be array");
  }
}

function validateNodeRec(node: TreeNode, depth: number): void {
  validateDepth(node, depth);
  validateNodeKeys(node, false);
  if (node.nodes && node.nodes.length > 0) {
    validateSiblingUnique(node.nodes);
    for (const child of node.nodes) {
      validateNodeRec(child, depth + 1);
    }
  }
}
