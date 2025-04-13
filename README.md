# read-structure-dir

## HOW INSTALL

1. add import in **`deno.json`**
    ```json
    {
        "imports": {  
            "@mod-by-cis/read-structure-dir": "https://raw.githubusercontent.com/mod-by-cis/read-structure-dir/refs/tags/v0.1.0-rc.1/mod.ts"
        }
    }
    ```
2. or add import in **any `*.ts` files**
    ```typescript
    import { 
      StructurePaths,
      type StructurePathsOptions
    } from "https://raw.githubusercontent.com/mod-by-cis/read-structure-dir/refs/tags/v0.1.0-rc.1/mod.ts";
    ```

## HOW USED

```typescript
const AA: StructurePathsOptions = {
  includeDirs: true,
  skip: [
    /\.git(\/|\\)?/
  ]
}
const A = new StructurePaths(AA);
await A.pathsGET();
A.logPLOT();
```

---
