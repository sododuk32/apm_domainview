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

## 설치

```sh
# 글로벌 CLI
npm i -g apm-domainview

# 또는 npx 일회 실행
npx apm-domainview --help
```

## 사용 방법

### A. CLI (사람 직접 편집)

```sh
# 도메인 생성
apm-domainview create 결제 --desc "결제 처리 도메인"

# 브랜치/기능 추가 (마지막 인자가 새 노드 이름, 그 앞은 부모 경로)
apm-domainview add 결제 결제수단
apm-domainview add 결제 결제수단 카드결제
apm-domainview add 결제 환불 전체환불

# 트리 출력 (JSON)
apm-domainview read 결제

# 자체포함 HTML 생성 후 브라우저로 열기
apm-domainview render 결제
# → 결제/index.html

# 노드 이름 변경
apm-domainview rename 결제 결제수단 결제방식

# 노드 삭제 (cascade)
apm-domainview rm 결제 환불

# 도메인 목록
apm-domainview list

# 도메인 description 갱신
apm-domainview set-meta 결제 --desc "결제·환불 전반"
```

### B. JSON 직접 편집

에디터에서 `결제/index.json` 을 손수 수정해도 된다. 다음 명령(CLI 또는 MCP)에서 자동 검증·반영.

### C. HTML 조회 (읽기 전용)

`apm-domainview render <도메인>` → `index.html` 생성. 브라우저로 연다.
3색 태그(도메인/브랜치/기능), 들여쓰기 + 가지선, 접기/펼치기 토글 내장.

### D. AI 통합 (옵션)

[APM (microsoft/apm)](https://github.com/microsoft/apm) 을 사용하면 한 줄로 모든 AI 하네스에 등록된다.

프로젝트 루트의 `apm.yml`:

```yaml
name: my-project
version: 1.0.0

dependencies:
  mcp:
    - name: sododuk32/apm_domainview
      transport: stdio
```

```sh
apm install
```

이후 Claude Code / Cursor / Copilot 등에서 자연어로 같은 도메인을 편집·조회 가능.

```
사용자: "결제 도메인에 환불 브랜치 추가해줘"
→ 하네스가 apm-domainview MCP 서버를 stdio 로 호출
→ 같은 결제/index.json 갱신
```

사람 채널과 AI 채널이 같은 SSOT (`index.json`) 에 작용한다.
한 채널의 변경은 다른 채널 다음 read 에서 자연스럽게 인식.

자세한 예시: [`examples/apm.yml`](./examples/apm.yml)

#### MCP 단독 모드 (apm 없이 직접 등록)

apm 을 쓰지 않는 환경이면 각 하네스의 MCP 설정에 직접 추가:

```json
{
  "mcpServers": {
    "apm-domainview": {
      "command": "apm-domainview",
      "args": ["mcp"]
    }
  }
}
```

## 비즈니스 규칙 (R1~R12)

요약:
- R1 깊이 ≤ 3 / R2 형제 유일 / R3 폴더명=루트 name / R4 도메인 중복 금지
- R5 루트만 description / R6 자식은 name+nodes / R7 빈 nodes 정규화
- R8 경로 식별 (id 없음) / R9 이름 변경 재검증 / R10 cascade 삭제
- R11 파일명 고정 (index.json/html) / R12 가이드는 resource + --help 양 채널

전체: MCP resource `feature-tree://guide/rules` 또는 코드 `src/guides.ts`.

## 개발

```sh
git clone https://github.com/sododuk32/apm_domainview
cd apm_domainview
npm install
npm test       # pretest 가 자동 tsc
npm run build
```

## 참고

- 패키지 관리: [APM (microsoft/apm)](https://github.com/microsoft/apm)
- 프로토콜: [Model Context Protocol](https://modelcontextprotocol.io/)

## 라이선스

미정 (v0.0.1 출시 전 결정).
