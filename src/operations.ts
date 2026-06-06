import type { DomainTree, Path } from "./types.js";

const NOT_IMPLEMENTED = "operations: not implemented (Phase 3)";

/** 워크스페이스의 도메인명 목록 */
export async function listTrees(): Promise<string[]> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 도메인 폴더 + index.json 생성. 중복 시 throw. */
export async function createTree(_name: string, _description?: string): Promise<DomainTree> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 도메인 트리 전체 반환 */
export async function readTree(_name: string): Promise<DomainTree> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 루트 description 갱신 */
export async function updateMeta(_name: string, _description: string): Promise<DomainTree> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 경로의 자식으로 새 노드 추가 (R1 R2 R6 검증) */
export async function addNode(_domain: string, _parentPath: Path, _name: string): Promise<DomainTree> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 경로 노드의 이름 변경 (R2 R9 검증) */
export async function updateNode(_domain: string, _path: Path, _newName: string): Promise<DomainTree> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 경로 노드 cascade 삭제 (R10) */
export async function deleteNode(_domain: string, _path: Path): Promise<DomainTree> {
  throw new Error(NOT_IMPLEMENTED);
}
