import { promises as fs } from "node:fs";
import path from "node:path";
import type { DomainTree, TreeNode } from "./types.js";
import { validateRootNameMatchesFolder, validateTree } from "./validator.js";

const INDEX_FILE = "index.json";

/** 워크스페이스 루트 — 기본 process.cwd(). `FEATURE_TREE_WORKSPACE` 환경변수로 override. */
export function workspaceRoot(): string {
  return process.env["FEATURE_TREE_WORKSPACE"] ?? process.cwd();
}

function domainDir(name: string): string {
  return path.join(workspaceRoot(), name);
}

function domainIndexPath(name: string): string {
  return path.join(domainDir(name), INDEX_FILE);
}

/** 도메인 폴더의 index.json 읽기 + R3 폴더명 일치 + 전체 검증 + R7 정규화 */
export async function readDomain(name: string): Promise<DomainTree> {
  let raw: string;
  try {
    raw = await fs.readFile(domainIndexPath(name), "utf8");
  } catch (err) {
    if (isNotFound(err)) {
      throw new Error(`도메인 "${name}" 이 존재하지 않습니다`);
    }
    throw err;
  }
  const parsed = JSON.parse(raw) as DomainTree;
  validateRootNameMatchesFolder(name, parsed);
  validateTree(parsed);
  return normalizeTree(parsed);
}

/** R3/R1/R2/R5/R6 검증 + R7 정규화 후 폴더 + index.json 쓰기 (R11 파일명 고정) */
export async function writeDomain(name: string, tree: DomainTree): Promise<void> {
  validateRootNameMatchesFolder(name, tree);
  validateTree(tree);
  const normalized = normalizeTree(tree);
  await fs.mkdir(domainDir(name), { recursive: true });
  await fs.writeFile(domainIndexPath(name), JSON.stringify(normalized, null, 2) + "\n", "utf8");
}

/** 워크스페이스 내 도메인 목록 — index.json 가진 폴더만, 알파벳 정렬 */
export async function listDomains(): Promise<string[]> {
  const root = workspaceRoot();
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (err) {
    if (isNotFound(err)) return [];
    throw err;
  }
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const names: string[] = [];
  for (const d of dirs) {
    if (await exists(d)) names.push(d);
  }
  return names.sort();
}

/** 도메인 폴더에 index.json 존재 여부 */
export async function exists(name: string): Promise<boolean> {
  try {
    await fs.access(domainIndexPath(name));
    return true;
  } catch {
    return false;
  }
}

// — 내부 —

function isNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "ENOENT";
}

/** R7 — 빈 nodes 배열을 가진 자식 노드에서 nodes 키 제거. 루트의 nodes 는 유지(빈 배열 OK). */
function normalizeTree(tree: DomainTree): DomainTree {
  return { ...tree, nodes: tree.nodes.map(normalizeNode) };
}

function normalizeNode(node: TreeNode): TreeNode {
  if (Array.isArray(node.nodes)) {
    if (node.nodes.length === 0) {
      const { nodes: _ignored, ...rest } = node;
      return rest;
    }
    return { ...node, nodes: node.nodes.map(normalizeNode) };
  }
  return { ...node };
}
