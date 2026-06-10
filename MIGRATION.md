
---

## Migrating from v1 to v2 

This library version **2.0.0** bumps both Prisma and CASL to their next major versions: from Prisma 6 + CASL v1 to Prisma 7 + CASL v2. Below is the complete migration guide. 

### Update dependencies

| Package | Old | New |
|---|---|---|
| `@prisma/client` | `^6.5.0` | `^7.0.0` |
| `prisma` | `^6.x` | `^7.0.0` |
| `@casl/ability` | `^6.7.3` | `^7.0.0` |
| `@casl/prisma` | `^1.5.1` | `^2.0.0` |
| `prisma-extension-casl` | `^1.x` | `^2.0.0` |

**⚠️ Important:** `@casl/prisma` v2 only works with `@casl/ability` v7 and `@prisma/client` v7 — they must be upgraded together.


### useCaslAbilities needs modelsMeta

Prisma 7 does not export DMMF like Prisma 6, so we generate it. 

In your prisma schema add generator:
```prisma
generator metadata {
    provider = "node ./node_modules/prisma-extension-casl/prisma/generators/metadata.js"
    output   = "../src/generated/prisma"
}
```

Run

```bash
pnpm prisma generate
```


```
import { modelsMeta } from '../src/generated/prisma/metadata'

prismaClient.$extends(useCaslAbilities(builderFactory, { 
    modelsMeta,
    permissionField: 'casl'
  }))
```

### `$casl` now uses a generic parameter for type inference

The `$casl` method on the extended client requires a generic type parameter to preserve Prisma model methods:

```diff
- const result = await client.$casl((e) => { ... }).post.findMany()
+ const result = await client.$casl<typeof client>((e) => { ... }).post.findMany()
```
