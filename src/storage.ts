import type { DomainTree } from "./types.js";

const NOT_IMPLEMENTED = "storage: not implemented (Phase 3)";

/** 도메인 폴더의 index.json 읽기 + 스키마 검증 */
export async function readDomain(_name: string): Promise<DomainTree> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 스키마 검증 후 index.json 쓰기 (없으면 폴더 생성) */
export async function writeDomain(_name: string, _tree: DomainTree): Promise<void> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 워크스페이스 내 도메인명 목록 */
export async function listDomains(): Promise<string[]> {
  throw new Error(NOT_IMPLEMENTED);
}

/** 도메인 폴더 존재 여부 */
export async function exists(_name: string): Promise<boolean> {
  throw new Error(NOT_IMPLEMENTED);
}
