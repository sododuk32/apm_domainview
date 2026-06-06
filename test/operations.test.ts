import { describe, it } from "vitest";

describe("operations (CRUD)", () => {
  it.todo("listTrees 빈 워크스페이스 → []");
  it.todo("createTree 새 도메인 — 폴더 + index.json 생성");
  it.todo("createTree 중복 도메인 → throw (R4)");
  it.todo("readTree 정상 반환");
  it.todo("updateMeta description 갱신");
  it.todo("addNode 정상 추가 + 파일 반영");
  it.todo("addNode 4 depth 시도 → throw (R1)");
  it.todo("addNode 형제 중복 → throw (R2)");
  it.todo("updateNode 이름 변경 + 형제 유일성 재검증 (R9)");
  it.todo("deleteNode cascade — 자식까지 삭제 (R10)");
});
