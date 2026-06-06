import type { DomainTree, Path, TreeNode } from "./types.js";

export class PathError extends Error {
  constructor(public readonly path: Path, message: string) {
    super(`[R8 path] ${message}: ${JSON.stringify(path)}`);
    this.name = "PathError";
  }
}

/** 경로(이름 시퀀스)로 노드 찾기. 빈 경로 = 루트. 없으면 undefined. (R8) */
export function findNode(tree: DomainTree, p: Path): TreeNode | undefined {
  if (p.length === 0) return tree;
  let cur: TreeNode = tree;
  for (const name of p) {
    if (!cur.nodes) return undefined;
    const next = cur.nodes.find((n) => n.name === name);
    if (!next) return undefined;
    cur = next;
  }
  return cur;
}

/** 경로의 부모 노드 찾기. 루트의 부모 = undefined. */
export function findParent(tree: DomainTree, p: Path): TreeNode | undefined {
  if (p.length === 0) return undefined;
  return findNode(tree, p.slice(0, -1));
}

/** 경로 유효성 검증. 없으면 throw PathError. (R8) */
export function validatePath(tree: DomainTree, p: Path): void {
  if (!findNode(tree, p)) {
    throw new PathError(p, "path does not exist");
  }
}
