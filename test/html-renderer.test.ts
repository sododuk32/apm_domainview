import { describe, it, expect } from "vitest";
import { render } from "../src/html-renderer.js";
import type { DomainTree } from "../src/types.js";

const empty: DomainTree = { name: "결제", description: "결제 설명", nodes: [] };

const oneDepth: DomainTree = {
  name: "결제",
  description: "",
  nodes: [{ name: "결제수단" }],
};

const twoDepth: DomainTree = {
  name: "결제",
  description: "결제 처리 전반",
  nodes: [
    { name: "결제수단", nodes: [{ name: "카드결제" }, { name: "계좌이체" }] },
    { name: "환불", nodes: [{ name: "전체환불" }] },
  ],
};

describe("html-renderer", () => {
  it("빈 트리 — 도메인 헤더만, name + description 표시", () => {
    const html = render(empty);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("결제");
    expect(html).toContain("결제 설명");
    expect(html).toMatch(/<span class="tag domain">/);
  });

  it("1 depth — 브랜치 태그", () => {
    const html = render(oneDepth);
    expect(html).toContain("결제수단");
    expect(html).toMatch(/<span class="tag branch">/);
  });

  it("2 depth — 기능 태그", () => {
    const html = render(twoDepth);
    expect(html).toContain("카드결제");
    expect(html).toMatch(/<span class="tag function">/);
  });

  it("description 헤더에 표시", () => {
    const html = render(twoDepth);
    expect(html).toContain("결제 처리 전반");
  });

  it("자체포함 — 외부 http(s) URL / 외부 stylesheet / 외부 script 없음", () => {
    const html = render(twoDepth);
    expect(html).not.toMatch(/http(s)?:\/\//);
    expect(html).not.toMatch(/<link[^>]*rel=["']stylesheet["']/);
    expect(html).not.toMatch(/<script[^>]*src=/);
  });

  it("3색 태그 클래스 (domain / branch / function) 존재", () => {
    const html = render(twoDepth);
    expect(html).toMatch(/class="tag domain"/);
    expect(html).toMatch(/class="tag branch"/);
    expect(html).toMatch(/class="tag function"/);
  });

  it("접기/펼치기 vanilla JS + toolbar 버튼 내장", () => {
    const html = render(twoDepth);
    expect(html).toContain("function toggle");
    expect(html).toContain("expandAll");
    expect(html).toContain("collapseAll");
    expect(html).toContain("모두 펼치기");
    expect(html).toContain("모두 접기");
  });

  it("HTML 이스케이프 — 노드 이름의 <script> 가 raw 로 들어가지 않음", () => {
    const xss: DomainTree = {
      name: "test",
      description: "",
      nodes: [{ name: "<script>alert(1)</script>" }],
    };
    const html = render(xss);
    expect(html).not.toContain("alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});
