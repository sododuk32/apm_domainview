# apm_domainview (Feature Tree)

도메인 지식을 가지(브랜치) 트리로 **보관·조회** 하는 도구.

- 1차 사용자는 **사람**. 도메인 지식을 직접 만들고 본다.
- AI 하네스에서 가져다 쓰는 것은 **옵션** (MCP 인터페이스).
- 어떤 채널로 편집하든 도메인 폴더의 `index.json` 한 파일이 진실의 원천 (SSOT).

## 핵심

- 스키마: 자식 노드는 `name + nodes` 2키, 루트(=도메인)는 `name + description + nodes`
- 3단계: 도메인 / 브랜치 / 기능
- 식별: 경로(이름 시퀀스), id 없음
- 저장: 도메인 = 폴더, 폴더 루트 `index.json` 고정명
- 조회: 자체포함 단일 HTML (읽기 전용)

## 사용 방법

### A. CLI (사람 직접 편집)

```sh
apm-domainview create 결제 --desc "결제 처리 도메인"
apm-domainview add    결제 결제수단 카드결제
apm-domainview rename 결제 결제수단 카드결제 카드
apm-domainview rm     결제 결제수단
apm-domainview render 결제
```

### B. JSON 직접 편집

에디터에서 `결제/index.json` 을 직접 수정. 다음 명령(CLI 또는 MCP)에서 자동 검증·반영.

### C. HTML 조회 (읽기 전용)

```sh
apm-domainview render 결제
```
→ `결제/index.html` 생성. 브라우저로 연다 (조회 전용, 편집 불가).

### D. AI 통합 (옵션)

프로젝트의 `apm.yml`:

```yaml
dependencies:
  mcp:
    - name: sododuk32/apm_domainview
      transport: stdio
```

```sh
apm install
```

이후 Claude / Cursor 등 AI 하네스에서 자연어로 같은 도메인을 편집·조회 가능. 사람 채널과 같은 `index.json` 에 작용.

## 상태

WIP. 설계 완료(v2), 구현 진입 직전.

## 참고

- 패키지 관리: [APM (microsoft/apm)](https://github.com/microsoft/apm)
- 프로토콜: [Model Context Protocol](https://modelcontextprotocol.io/)

## 라이선스

미정.
