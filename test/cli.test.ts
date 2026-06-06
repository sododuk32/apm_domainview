import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const cliPath = path.resolve("dist/cli.js");

interface RunResult {
  stdout: string;
  stderr: string;
  status: number;
}

function run(args: string[], cwd?: string): RunResult {
  try {
    const stdout = execFileSync("node", [cliPath, ...args], {
      encoding: "utf8",
      cwd: cwd ?? process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { stdout, stderr: "", status: 0 };
  } catch (err) {
    const e = err as { stdout?: Buffer | string; stderr?: Buffer | string; status?: number };
    return {
      stdout: typeof e.stdout === "string" ? e.stdout : (e.stdout?.toString("utf8") ?? ""),
      stderr: typeof e.stderr === "string" ? e.stderr : (e.stderr?.toString("utf8") ?? ""),
      status: e.status ?? 1,
    };
  }
}

let workspace: string;

beforeAll(() => {
  workspace = mkdtempSync(path.join(tmpdir(), "cli-test-"));
});

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true });
});

describe("cli (commander)", () => {
  it("--help 출력에 9 서브커맨드 모두 포함 (mcp 포함)", () => {
    const { stdout } = run(["--help"]);
    for (const cmd of ["list", "create", "read", "set-meta", "add", "rename", "rm", "render", "mcp"]) {
      expect(stdout).toContain(cmd);
    }
  });

  it("--version → 0.0.1", () => {
    const { stdout } = run(["--version"]);
    expect(stdout.trim()).toBe("0.0.1");
  });

  it("create + list + read 시나리오", () => {
    const c = run(["create", "테스트", "--desc", "hi"], workspace);
    expect(c.status).toBe(0);
    const l = run(["list"], workspace);
    expect(l.stdout).toContain("테스트");
    const r = run(["read", "테스트"], workspace);
    expect(r.stdout).toContain('"name": "테스트"');
    expect(r.stdout).toContain('"description": "hi"');
  });

  it("add 다중 path → render → index.html 파일 생성", () => {
    expect(run(["create", "결제", "--desc", "처리"], workspace).status).toBe(0);
    expect(run(["add", "결제", "결제수단"], workspace).status).toBe(0);
    expect(run(["add", "결제", "결제수단", "카드결제"], workspace).status).toBe(0);
    expect(run(["render", "결제"], workspace).status).toBe(0);
    expect(existsSync(path.join(workspace, "결제", "index.html"))).toBe(true);
  });

  it("rename → 이름 변경 반영", () => {
    expect(run(["create", "주문", "--desc", ""], workspace).status).toBe(0);
    expect(run(["add", "주문", "결제수단"], workspace).status).toBe(0);
    expect(run(["rename", "주문", "결제수단", "결제방식"], workspace).status).toBe(0);
    const r = run(["read", "주문"], workspace);
    expect(r.stdout).toContain("결제방식");
    expect(r.stdout).not.toContain('"결제수단"');
  });

  it("rm → cascade 삭제", () => {
    expect(run(["create", "배송", "--desc", ""], workspace).status).toBe(0);
    expect(run(["add", "배송", "방식"], workspace).status).toBe(0);
    expect(run(["add", "배송", "방식", "택배"], workspace).status).toBe(0);
    expect(run(["rm", "배송", "방식"], workspace).status).toBe(0);
    const r = run(["read", "배송"], workspace);
    expect(r.stdout).not.toContain("방식");
    expect(r.stdout).not.toContain("택배");
  });

  it("형제 중복 → exit 1 + stderr 에 R2", () => {
    expect(run(["create", "재고", "--desc", ""], workspace).status).toBe(0);
    expect(run(["add", "재고", "입고"], workspace).status).toBe(0);
    const r = run(["add", "재고", "입고"], workspace);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/R2/);
  });
});
