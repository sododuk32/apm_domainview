# Changelog

## v0.0.1 — 2026-06-06 (internal milestone, not published)

내부 사용 목적의 첫 마일스톤. npm publish 안 함, `private: true` 유지.

### 추가
- **코어**: TypeScript + ESM, strict + NodeNext
- **스키마**: 3단계 트리(도메인/브랜치/기능), 루트만 description 메타
- **저장**: 도메인 = 폴더, 폴더 루트 `index.json` 고정 (SSOT)
- **검증기**: R1~R12 + `ValidationError` 클래스
- **CLI** (9 서브커맨드): `list` / `create` / `read` / `set-meta` / `add` / `rename` / `rm` / `render` / `mcp`
- **HTML 렌더러**: 자체포함 단일 HTML (외부 의존 0)
  - 3색 태그(도메인/브랜치/기능) + 들여쓰기 + 가지선 + 접기/펼치기 vanilla JS + XSS escape
- **MCP 서버** (stdio): 8 tools + 3 resources(schema/rules/usage) for AI 하네스 통합
- **APM 통합**: `apm.yml` 의 `dependencies.mcp` 통해 의존 선언 가능 (`examples/apm.yml` 참조)
- **테스트**: 57 passed + 7 todo, `pretest = tsc` 자동 빌드

### 알려진 이슈
- 5 npm audit vulnerabilities — vitest transitive devDeps, production 영향 없음
- transport http 없음 (stdio 만)
- 동시 편집 경합 없음 (마지막 쓰기 우선)
- 라이선스 미정 (UNLICENSED)
