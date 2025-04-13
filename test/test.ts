import {
  type StructurePathsOptions,
  StructurePaths 
} from "../mod.ts"

const AA: StructurePathsOptions = {
  includeDirs: true,
  skip: [
    /\.git(\/|\\)?/
  ]
}
const A = new StructurePaths(AA);
await A.pathsGET();
A.logPLOT();
