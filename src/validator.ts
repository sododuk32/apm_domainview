import type { DomainTree, TreeNode } from "./types.js";

const NOT_IMPLEMENTED = "validator: not implemented (Phase 3)";

/** R1 깊이 ≤ 3 + R2 형제 유일 + R5 루트 메타 + R6 자식 키 제약 + R7 빈 nodes 정규화 + R8 경로 식별. 위반 시 throw. */
export function validateTree(_tree: DomainTree): void {
  throw new Error(NOT_IMPLEMENTED);
}

/** R2 형제 간 이름 유일 검증 */
export function validateSiblingUnique(_siblings: ReadonlyArray<TreeNode>): void {
  throw new Error(NOT_IMPLEMENTED);
}

/** R1 깊이 제한 (루트=0, 브랜치=1, 기능=2 까지) */
export function validateDepth(_node: TreeNode, _depth: number): void {
  throw new Error(NOT_IMPLEMENTED);
}

/** R5 루트만 description 허용 + R6 자식 노드는 name+nodes 만 */
export function validateNodeKeys(_node: TreeNode, _isRoot: boolean): void {
  throw new Error(NOT_IMPLEMENTED);
}

/** R3 폴더명과 루트 name 일치 검증 */
export function validateRootNameMatchesFolder(_folderName: string, _tree: DomainTree): void {
  throw new Error(NOT_IMPLEMENTED);
}
