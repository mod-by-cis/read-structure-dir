//export type { WalkEntry, WalkOptions } from "jsr:@std/fs@1.0.16/walk";

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

export interface PathsStructureNESTED {
  dirs: PathsStructure;
  file: string[];
}

export type PathsStructure = Map<string, PathsStructureNESTED>;
