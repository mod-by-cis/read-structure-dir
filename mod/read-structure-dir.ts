import { normalize } from "jsr:@std/path@1.0.8";
import { walk /*, walkSync*/ } from "jsr:@std/fs@1.0.16/walk";
// import type { WalkEntry, WalkOptions } from "jsr:@std/fs@1.0.16/walk";


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

export interface PathsStructure  {
  dirs: Map<string, PathsStructure>;
  file: string[];
};

//* ################################  
//* ################################  

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

//* ################################ 
//* ################################   

export function pathsStructureTREE(paths: Paths[]): Map<string, PathsStructure> {
  const root = paths.find(p => p.root);
  if (!root) throw new Error("Brak katalogu głównego");

  const result: Map<string, PathsStructure> = new Map();

  const rootData: PathsStructure = {
    dirs: new Map(),
    file: [],
  };

  const insert = (
    map: Map<string, PathsStructure>,
    path: string[],
    name: string,
    isFile: boolean
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
      insert(currentMap.dirs, rest,  name, isFile);
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

//* ################################  
//* ################################  

export function pathsStructurePLOT(paths: Paths[]): string {
  const tree: Map<string, PathsStructure> = pathsStructureTREE(paths);
  let structure = '';

  pathsStructureITER(
    tree,
    (text) => structure += text  // Nadal dodajemy tekst, ale teraz całość jest bardziej zoptymalizowana
  );
  
  return structure;
}


//* ################################  
//* ################################  

export function pathsStructureSAVE(saveAS:string, paths: Paths[]):void {  
  const plot = pathsStructurePLOT(paths);
  Deno.writeTextFileSync(saveAS+'.pgsql', plot);
}

//* ################################  
//* ################################  

function pathsStructureITER(
  map: Map<string, PathsStructure>, 
  addToStructurePLOT: (txt: string) => void, 
  level: number = 0 // Parametr level dodany do rekurencji
): void {
  if (map.size !== 0) {
    for (const [key, val] of map) {
      // Dodajemy nazwę folderu, uwzględniając wcięcie tylko jeśli folder ma podfoldery
      addToStructurePLOT(level === 0 ? `${key}/\n` : textDIR(`${key}/\n`, level - 1, val.dirs.size > 0));
      
      // Rekurencyjne wywołanie dla podfolderów
      if (val.dirs.size > 0) {
        pathsStructureITER(val.dirs, addToStructurePLOT, level + 1);
      }
      
      // Dodajemy listę plików
      addToStructurePLOT(textFILES(val.file, level, val.dirs.size > 0));
    }
  }
}


function formatLine(
  name: string,
  level: number,
  hasChildOrSibling: boolean,
  {
    forceExtraIndent = false,
    extraIndentIfChild = false
  }: {
    forceExtraIndent?: boolean,
    extraIndentIfChild?: boolean
  } = {}
): string {
  const baseIndent = "│   ".repeat(Math.max(level > 1 ? level - 1 : level, 0));
  const extraIndent =
    level > 1 && forceExtraIndent
      ? extraIndentIfChild ? "│   " : "    "
      : "";

  const connector = level === 0
    ? "├── "
    : hasChildOrSibling
      ? "├── "
      : "└── ";

  return `${baseIndent}${extraIndent}${connector}${name}`;
}


function textDIR(
  nameDIR: string, 
  level: number, 
  hasCHILD: boolean
): string {
  const newlineAbove = `${"│   ".repeat(level + 1)}\n`;
  const line = formatLine(nameDIR, level, hasCHILD);
  return newlineAbove + line;
}

function textFILES(
  filesLIST: string[], 
  fileLEVEL: number, 
  hasCHILD: boolean
): string {
  return filesLIST.map((file, i) => {
    const isLast = i === filesLIST.length - 1;
    return formatLine(file, fileLEVEL, !isLast, {
      forceExtraIndent: true,
      extraIndentIfChild: hasCHILD
    }) + '\n';
  }).join('');
}
