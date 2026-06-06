import type { DomainTree, Path } from "./types.js";
import { validateSiblingUnique } from "./validator.js";
import { findNode, findParent, validatePath } from "./path-resolver.js";
import * as storage from "./storage.js";

/** 워크스페이스의 도메인명 목록 (정렬) */
export async function listTrees(): Promise<string[]> {
  return storage.listDomains();
}

/** 도메인 폴더 + index.json 생성. R4 중복 시 throw. */
export async function createTree(name: string, description: string = ""): Promise<DomainTree> {
  if (await storage.exists(name)) {
    throw new Error(`[R4] 도메인 "${name}" 이 이미 존재합니다`);
  }
  const tree: DomainTree = { name, description, nodes: [] };
  await storage.writeDomain(name, tree);
  return tree;
}

/** 도메인 트리 전체 반환 (정규화 + 검증된 결과) */
export async function readTree(name: string): Promise<DomainTree> {
  return storage.readDomain(name);
}

/** 루트 description 갱신 */
export async function updateMeta(name: string, description: string): Promise<DomainTree> {
  const tree = await storage.readDomain(name);
  tree.description = description;
  await storage.writeDomain(name, tree);
  return tree;
}

/**
 * 경로의 자식으로 새 노드 추가.
 * R1 깊이 / R2 형제 유일 / R6 키 — 모두 writeDomain → validateTree 에서 강제.
 */
export async function addNode(
  domain: string,
  parentPath: Path,
  name: string,
): Promise<DomainTree> {
  const tree = await storage.readDomain(domain);
  const parent = findNode(tree, parentPath);
  if (!parent) {
    throw new Error(`[R8] 부모 경로 없음: ${JSON.stringify(parentPath)}`);
  }
  if (!parent.nodes) parent.nodes = [];
  parent.nodes.push({ name });
  await storage.writeDomain(domain, tree);
  return storage.readDomain(domain);
}

/** 경로 노드의 이름 변경. R9 — 새 이름의 형제 유일성 재검증. */
export async function updateNode(
  domain: string,
  p: Path,
  newName: string,
): Promise<DomainTree> {
  if (p.length === 0) {
    throw new Error("[R3] 루트 노드 이름은 변경 불가 (폴더명 일치 유지)");
  }
  const tree = await storage.readDomain(domain);
  validatePath(tree, p);
  const parent = findParent(tree, p);
  if (!parent || !parent.nodes) {
    throw new Error(`[internal] parent not found`);
  }
  const lastName = p[p.length - 1];
  const target = parent.nodes.find((n) => n.name === lastName);
  if (!target) {
    throw new Error(`[internal] target not found`);
  }
  if (target.name !== newName) {
    const others = parent.nodes.filter((n) => n !== target);
    validateSiblingUnique([...others, { name: newName }]);
  }
  target.name = newName;
  await storage.writeDomain(domain, tree);
  return storage.readDomain(domain);
}

/** 경로 노드 cascade 삭제 (R10) */
export async function deleteNode(domain: string, p: Path): Promise<DomainTree> {
  if (p.length === 0) {
    throw new Error("루트 노드는 삭제 불가");
  }
  const tree = await storage.readDomain(domain);
  validatePath(tree, p);
  const parent = findParent(tree, p);
  if (!parent || !parent.nodes) {
    throw new Error(`[internal] parent not found`);
  }
  const lastName = p[p.length - 1];
  parent.nodes = parent.nodes.filter((n) => n.name !== lastName);
  await storage.writeDomain(domain, tree);
  return storage.readDomain(domain);
}
