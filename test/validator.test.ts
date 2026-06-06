import { describe, it } from "vitest";

describe("validator (R1~R12)", () => {
  it.todo("R1 깊이 ≤ 3 — 4 depth 시도 거부");
  it.todo("R2 형제 간 이름 유일 — 중복 거부");
  it.todo("R3 폴더명 = 루트 name");
  it.todo("R4 도메인 폴더명 중복 금지");
  it.todo("R5 루트만 description 허용 — 자식에 description 거부");
  it.todo("R6 자식 노드는 name + nodes 만 — 다른 키 거부");
  it.todo("R7 말단은 nodes 생략 — 빈 nodes 정규화");
  it.todo("R8 경로 기반 식별 — id 없음");
  it.todo("R9 update_node 후 형제 유일성 재검증");
  it.todo("R10 delete cascade");
  it.todo("R11 파일명 고정 — index.json / index.html");
  it.todo("R12 가이드는 resource 채널");
});
