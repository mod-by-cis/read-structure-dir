import { normalize } from "jsr:@std/path@1.0.8";
import { walk } from "jsr:@std/fs@1.0.16/walk";
import type { StructurePathsOptions, Paths, PathsStructure, PathsStructureNESTED } from "./types.ts";
import { pathsStructureITER } from "./utils.ts";


export class StructurePaths {
  paths: Paths[] = [];

  #baseDir: string = Deno.cwd();
  #pathsToINCLUDE: StructurePathsOptions;

  constructor(pathsToINCLUDE?: StructurePathsOptions) {
    this.#pathsToINCLUDE = {
      includeDirs: true,            // ✅ uwzględnia foldery
      skip: [
        /\.git(\/|\\)?/,            // ⛔️ pomijamy folder `.git` oraz jego zawartość
        /\.vscode(\/|\\)?/,         // ⛔️ pomijamy folder `.vscode` oraz jego zawartość
        /\.history(\/|\\)?/,        // ⛔️ pomijamy folder `.history` oraz jego zawartość
        /node_modules(\/|\\)?/      // ⛔️ pomijamy folder `node_modules` oraz jego zawartość
      ],
      ...pathsToINCLUDE,
    };
  }

  #trimCWD(path: string): string {
    return normalize(path).replace(this.#baseDir, "");
  }

  #level(path: string): string[] {
    const normalizedPath = normalize(path);
    const separator = normalizedPath.includes("/") ? "/" : "\\";
    return normalizedPath.split(separator).filter(Boolean);
  }

  async pathsGET(): Promise<void> {
    const elements: Paths[] = [];
    let ii = 0;

    for await (const entry of walk(this.#baseDir, this.#pathsToINCLUDE)) {
      const el: Paths = {
        index: ii,
        level: this.#level(this.#trimCWD(entry.path)).length,
        path: this.#level(this.#trimCWD(entry.path)),
        name: entry.name,
        root: this.#trimCWD(entry.path).length === 0,
        type: {
          isFile: entry.isFile,
          isDirectory: entry.isDirectory,
          isSymlink: entry.isSymlink,
        },
      };
      elements.push(el);
      ii++;
    }

    this.paths = elements;
  }

  get TREE(): PathsStructure {
    const paths = this.paths;
    const root = paths.find((p) => p.root);
    if (!root) throw new Error("Brak katalogu głównego");

    const result: PathsStructure = new Map();

    const rootData: PathsStructureNESTED = {
      dirs: new Map(),
      file: [],
    };

    const insert = (
      map: PathsStructure,
      path: string[],
      name: string,
      isFile: boolean,
    ) => {
      if (path.length === 0) {
        if (isFile) rootData.file.push(name);
        return;
      }

      const [current, ...rest] = path;
      let currentMap = map.get(current);

      if (!currentMap) {
        currentMap = { dirs: new Map(), file: [] };
        map.set(current, currentMap);
      }

      if (rest.length === 0) {
        if (isFile) currentMap.file.push(name);
      } else {
        insert(currentMap.dirs, rest, name, isFile);
      }
    };

    for (const entry of paths) {
      const { path, name, type, root: isRoot } = entry;

      if (isRoot) {
        if (type.isFile) rootData.file.push(name);
        continue;
      }

      const pathToParent = [...path];
      pathToParent.pop();

      if (type.isDirectory) {
        insert(rootData.dirs, path, name, false);
      } else {
        insert(rootData.dirs, pathToParent, name, true);
      }
    }

    result.set(root.name, rootData);
    return result;
  }

  get PLOT(): string {
    const tree = this.TREE;
    let structure = "";

    pathsStructureITER(tree, (text) => structure += text);

    return structure;
  }

  savePLOT(saveAS: string): void {
    const plot = this.PLOT;
    Deno.writeTextFileSync(saveAS + ".pgsql", plot);
  }
  
  logTREE(): void {
    const tree = this.TREE;
    console.log(tree);
  }
  
  logPLOT(): void {
    const plot = this.PLOT;
    console.log(plot);
  }
}
