export const GUIDE_SCHEMA = `# Feature Tree — 스키마 규약

## 노드 구조 (단 2 키)
- 루트 노드 (도메인): name + description + nodes
- 자식 노드 (브랜치/기능): name + nodes (말단은 nodes 생략)

## 3 단계 고정
- 루트(도메인) / 1depth(브랜치) / 2depth(기능)
- 자식 노드는 깊이 최대 2 (4depth 추가 거부)

## 식별
- 경로(이름 시퀀스). 빈 경로 = 루트.
- id 없음.

## 예시 (JSON)
{
  "name": "결제",
  "description": "결제 처리 도메인",
  "nodes": [
    { "name": "결제수단", "nodes": [{ "name": "카드결제" }] },
    { "name": "환불", "nodes": [{ "name": "전체환불" }] }
  ]
}
`;

export const GUIDE_RULES = `# Feature Tree — 비즈니스 규칙 R1~R12

R1. 깊이 ≤ 3 (루트 0 / 브랜치 1 / 기능 2). 4 depth 거부.
R2. 형제 간 이름 유일. 중복 거부.
R3. 도메인 폴더명 = 루트 name. 불일치 거부.
R4. 도메인 폴더명 중복 금지.
R5. 루트만 description 메타 허용.
R6. 자식 노드는 name + nodes 만. 다른 키 거부.
R7. 말단은 nodes 생략 (라이브러리 자동 정규화).
R8. 경로 기반 식별 — id 없음.
R9. 노드 이름 변경 시 형제 유일성 재검증.
R10. 노드 삭제는 cascade (자식 트리 통째).
R11. 파일명 고정 — index.json (트리) / index.html (생성된 UI).
R12. 가이드는 MCP resource / CLI --help 양 채널.
`;

export const GUIDE_USAGE = `# Feature Tree — 사용 예시

## AI 측 (자연어 → MCP 툴)
- "결제 도메인 만들어줘" → create_tree(name="결제", description="...")
- "결제에 결제수단 브랜치 추가" → add_node(domain="결제", parentPath=[], name="결제수단")
- "결제수단 아래 카드결제 추가" → add_node(domain="결제", parentPath=["결제수단"], name="카드결제")
- "결제 트리 보여줘" → read_tree(name="결제") 또는 render_html(name="결제")
- "환불 브랜치 삭제" → delete_node(domain="결제", path=["환불"])

## 사람 측 (CLI)
- apm-domainview create 결제 --desc "결제 처리"
- apm-domainview add 결제 결제수단 카드결제
- apm-domainview render 결제
- apm-domainview read 결제
- apm-domainview rm 결제 환불

## SSOT (모든 채널이 같은 곳에 작용)
모든 채널이 같은 {도메인}/index.json 에 작용.
한 채널의 변경은 다른 채널 다음 read 에서 자연스럽게 인식.
`;
