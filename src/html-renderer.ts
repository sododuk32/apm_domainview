import type { DomainTree, TreeNode } from "./types.js";

const STYLE = `
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; padding: 24px; max-width: 960px; margin: 0 auto; color: #1f2937; background: #ffffff; }
  header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
  h1 { margin: 0 0 4px 0; font-size: 22px; }
  .description { color: #6b7280; margin: 6px 0 0 0; }
  .toolbar { margin: 16px 0; }
  .toolbar button { background: #f3f4f6; border: 1px solid #d1d5db; padding: 6px 12px; cursor: pointer; border-radius: 4px; margin-right: 8px; font-family: inherit; font-size: 13px; }
  .toolbar button:hover { background: #e5e7eb; }
  ul.tree { list-style: none; padding-left: 0; margin: 0; }
  ul.tree ul { list-style: none; padding-left: 24px; border-left: 1px dashed #d1d5db; margin-left: 8px; }
  .node { padding: 4px 0; cursor: default; user-select: none; }
  .node.has-children { cursor: pointer; }
  .tag { display: inline-block; font-size: 11px; padding: 2px 6px; border-radius: 3px; margin-right: 8px; font-weight: 600; vertical-align: middle; }
  .tag.domain { background: #dbeafe; color: #1e40af; }
  .tag.branch { background: #fef3c7; color: #92400e; }
  .tag.function { background: #d1fae5; color: #065f46; }
  .name { font-size: 14px; vertical-align: middle; }
  .toggle { color: #6b7280; margin-right: 4px; font-size: 10px; width: 12px; display: inline-block; text-align: center; }
  li.collapsed > ul { display: none; }
  li.collapsed > .node .toggle::before { content: "▶"; }
  li.expanded > .node .toggle::before { content: "▼"; }
  li.leaf > .node .toggle::before { content: "·"; color: #d1d5db; }
`;

const SCRIPT = `
function toggle(li){
  if(li.classList.contains("leaf"))return;
  if(li.classList.contains("expanded")){li.classList.remove("expanded");li.classList.add("collapsed");}
  else{li.classList.remove("collapsed");li.classList.add("expanded");}
}
function expandAll(){
  document.querySelectorAll("li.collapsed").forEach(function(li){li.classList.remove("collapsed");li.classList.add("expanded");});
}
function collapseAll(){
  document.querySelectorAll("li.expanded").forEach(function(li){if(li.classList.contains("leaf"))return;li.classList.remove("expanded");li.classList.add("collapsed");});
}
document.querySelectorAll("li.node-wrap > .node").forEach(function(node){
  node.addEventListener("click",function(e){e.stopPropagation();toggle(node.parentElement);});
});
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderChildren(nodes: ReadonlyArray<TreeNode>, depth: number): string {
  return nodes
    .map((n) => {
      const hasChildren = !!n.nodes && n.nodes.length > 0;
      const liClass = hasChildren ? "node-wrap expanded" : "node-wrap leaf";
      const tag = depth === 1 ? "branch" : "function";
      const tagLabel = depth === 1 ? "브랜치" : "기능";
      const nodeClass = hasChildren ? "node has-children" : "node";
      const childrenHtml = hasChildren
        ? `<ul>${renderChildren(n.nodes!, depth + 1)}</ul>`
        : "";
      return `<li class="${liClass}"><div class="${nodeClass}"><span class="toggle"></span><span class="tag ${tag}">${tagLabel}</span><span class="name">${escapeHtml(n.name)}</span></div>${childrenHtml}</li>`;
    })
    .join("");
}

/** 도메인 트리 → 자체포함 단일 HTML 문자열 (외부 의존 0, 조회 전용) */
export function render(tree: DomainTree): string {
  const childrenHtml = renderChildren(tree.nodes, 1);
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(tree.name)}</title>
<style>${STYLE}</style>
</head>
<body>
<header>
<h1><span class="tag domain">도메인</span><span class="name">${escapeHtml(tree.name)}</span></h1>
<p class="description">${escapeHtml(tree.description)}</p>
</header>
<div class="toolbar">
<button onclick="expandAll()">모두 펼치기</button>
<button onclick="collapseAll()">모두 접기</button>
</div>
<ul class="tree">
${childrenHtml}
</ul>
<script>
${SCRIPT}
</script>
</body>
</html>
`;
}
