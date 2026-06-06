import type { DomainTree } from "./types.js";

const NOT_IMPLEMENTED = "html-renderer: not implemented (Phase 3)";

/** 도메인 트리를 자체포함 단일 HTML 문자열로 렌더 (외부 의존 0, 조회 전용) */
export function render(_tree: DomainTree): string {
  throw new Error(NOT_IMPLEMENTED);
}
