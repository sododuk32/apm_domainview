export type Path = readonly string[];

export interface TreeNode {
  name: string;
  nodes?: TreeNode[];
}

export interface DomainTree {
  name: string;
  description: string;
  nodes: TreeNode[];
}
