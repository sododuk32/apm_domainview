# apm_domainview

Feature Tree MCP 서버 — 도메인별 세부기능을 가지(브랜치) 형태로 구조화하는 MCP 라이브러리.

어떤 AI 하네스(Claude Code, Cursor 등)든 표준 MCP(JSON-RPC 2.0)로 연결되며, [APM (microsoft/apm)](https://github.com/microsoft/apm) 을 통해 배포된다.

## 상태

WIP. 설계 완료, 구현 진입 직전.

## 핵심

- 스키마: `name` + `nodes` 단 2키 (루트 노드만 `description` 메타 허용)
- 3단계: 도메인 / 브랜치 / 기능
- 식별: 경로(이름 시퀀스), id 없음
- 저장: 도메인 = 폴더, 폴더 루트 `index.json` 고정
- UI: 자체포함 단일 HTML

## 설치 (예정)

```yaml
# apm.yml
mcp:
  - name: io.github.sododuk32/apm_domainview
    transport: stdio
```

```sh
apm install
```

## 라이선스

미정.
