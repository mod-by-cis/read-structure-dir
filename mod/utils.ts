import type { TreePaths } from "./types.ts";

export function pathsStructureITER(map: TreePaths, addToStructurePLOT: (txt: string) => void, level: number = 0): void {
  if (map.size !== 0) {
    for (const [key, val] of map) {
      // Dodajemy nazwę folderu, uwzględniając wcięcie tylko jeśli folder ma podfoldery
      addToStructurePLOT(
        level === 0
          ? `${key}/\n`
          : textDIR(`${key}/\n`, level - 1, val.dirs.size > 0),
      );

      // Rekurencyjne wywołanie dla podfolderów
      if (val.dirs.size > 0) {
        pathsStructureITER(val.dirs, addToStructurePLOT, level + 1);
      }

      // Dodajemy listę plików
      addToStructurePLOT(textFILES(val.file, level, val.dirs.size > 0));
    }
  }
}

function textForRow(name: string, level: number, hasChildOrSibling: boolean, { forceExtraIndent = false, extraIndentIfChild = false }: { forceExtraIndent?: boolean; extraIndentIfChild?: boolean; } = {}): string {
  const baseIndent = "│   ".repeat(Math.max(level > 1 ? level - 1 : level, 0));
  const extraIndent = level > 1 && forceExtraIndent
    ? extraIndentIfChild ? "│   " : "    "
    : "";

  const connector = level === 0 ? "├── " : hasChildOrSibling ? "├── " : "└── ";

  return `${baseIndent}${extraIndent}${connector}${name}`;
}

function textDIR(nameDIR: string, level: number, hasCHILD: boolean): string {
  const newlineAbove = `${"│   ".repeat(level + 1)}\n`;
  const line = textForRow(nameDIR, level, hasCHILD);
  return newlineAbove + line;
}

function textFILES(filesLIST: string[], fileLEVEL: number, hasCHILD: boolean): string {
  return filesLIST.map((file, i) => {
    const isLast = i === filesLIST.length - 1;
    return textForRow(file, fileLEVEL, !isLast, {
      forceExtraIndent: true,
      extraIndentIfChild: hasCHILD,
    }) + "\n";
  }).join("");
}
