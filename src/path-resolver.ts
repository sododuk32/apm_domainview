import type { DomainTree, Path, TreeNode } from "./types.js";

const NOT_IMPLEMENTED = "path-resolver: not implemented (Phase 3)";

/** 경로(이름 시퀀스)로 노드 찾기. 빈 경로 = 루트. 없으면 undefined. */
export function findNode(_tree: DomainTree, _path: Path): TreeNode | undefined {
  throw new Error(NOT_IMPLEMENTED);
}

/** 경로의 부모 노드 찾기. 루트의 부모는 undefined. */
export function findParent(_tree: DomainTree, _path: Path): TreeNode | undefined {
  throw new Error(NOT_IMPLEMENTED);
}

/** 경로 유효성 검증. 없으면 throw. */
export function validatePath(_tree: DomainTree, _path: Path): void {
  throw new Error(NOT_IMPLEMENTED);
}
