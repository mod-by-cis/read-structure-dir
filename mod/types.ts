export type { 
  // WalkEntry, 
  WalkOptions as StructurePathsOptions
} from "jsr:@std/fs@1.0.16/walk";

export interface Paths {
  index: number;
  level: number;
  path: string[];
  name: string;
  root: boolean;
  type: {
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
  };
}

export interface TreePathsNESTED {
  dirs: TreePaths;
  file: string[];
}

export type TreePaths = Map<string, TreePathsNESTED>;
