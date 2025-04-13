# read-structure-dir

## 📦HOW INSTALL

1. add import in **`deno.json`**

```json
    {
        "imports": {
            "@mod-by-cis/read-structure-dir": "https://raw.githubusercontent.com/mod-by-cis/read-structure-dir/refs/tags/v0.1.1/mod.ts"
        }
    }
```

2. or add import in **any `*.ts` files**

```ts
import {
  StructurePaths,
  type StructurePathsOptions,
} from "https://raw.githubusercontent.com/mod-by-cis/read-structure-dir/refs/tags/v0.1.1/mod.ts";

```

## 🧠 HOW USED

```ts
const AA: StructurePathsOptions = {
  includeDirs: true,
  skip: [
    /\.git(\/|\\)?/,
  ],
};
const A = new StructurePaths(AA);
await A.pathsGET();
A.logPLOT();

```

---

## ⚠️ KNOWN ISSUES 
### IN VERSION `v0.1.1`
- [🔴 WRONGLY PLOTS STRUCTURE](https://github.com/mod-by-cis/read-structure-dir/issues/1)
