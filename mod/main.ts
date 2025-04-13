import { normalize } from "jsr:@std/path@1.0.8";
import { walk /*, walkSync*/ } from "jsr:@std/fs@1.0.16/walk";
import type { Paths, PathsStructure, PathsStructureNESTED } from "./types.ts";
import { pathsStructureITER } from "./utils.ts";



export async function pathsGET(): Promise<Paths[]> {
  const baseDir = Deno.cwd();
  function trimCWD(path: string): string {
    return normalize(path).replace(baseDir, "");
  }
  function level(path: string): string[] {
    // Normalizujemy ścieżkę
    const normalizedPath = normalize(path);

    // Dzielimy ścieżkę na części, ręcznie sprawdzając separator
    const separator = normalizedPath.includes("/") ? "/" : "\\";

    const levels = normalizedPath.split(separator).filter(Boolean);
    return levels;
  }
  const elements: Paths[] = [];
  let ii = 0;
  for await (const entry of walk(baseDir, { includeDirs: true })) {
    const el = {
      index: ii,
      level: level(trimCWD(entry.path)).length,
      path: level(trimCWD(entry.path)),
      name: entry.name,
      root: trimCWD(entry.path).length == 0,
      type: {
        isFile: entry.isFile,
        isDirectory: entry.isDirectory,
        isSymlink: entry.isSymlink,
      },
    };
    elements.push(el);
    ii++;
  }
  return elements;
}

export function pathsStructureTREE(paths: Paths[]): PathsStructure {
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
      if (isFile) {
        // Dodaj plik bezpośrednio do bieżącego poziomu (np. tier: 0)
        rootData.file.push(name);
      }
      return;
    }

    const [current, ...rest] = path;
    let currentMap = map.get(current);

    if (!currentMap) {
      currentMap = {
        dirs: new Map(),
        file: [],
      };
      map.set(current, currentMap);
    }

    if (rest.length === 0) {
      if (isFile) {
        currentMap.file.push(name);
      }
    } else {
      insert(currentMap.dirs, rest, name, isFile);
    }
  };

  for (const entry of paths) {
    const { path, name, type, root: isRoot } = entry;

    if (isRoot) {
      if (type.isFile) {
        rootData.file.push(name); // ←
      }
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

export function pathsStructurePLOT(paths: Paths[]): string {
  const tree: PathsStructure = pathsStructureTREE(paths);
  let structure = "";

  pathsStructureITER(
    tree,
    (text) => structure += text, 
  );

  return structure;
}

export function pathsStructureSAVE(saveAS: string, paths: Paths[]): void {
  const plot = pathsStructurePLOT(paths);
  Deno.writeTextFileSync(saveAS + ".pgsql", plot);
}
