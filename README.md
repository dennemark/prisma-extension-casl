# Prisma Extension CASL

[Prisma client extension](https://www.prisma.io/docs/orm/prisma-client/client-extensions) that utilizes [CASL](https://casl.js.org/) to enforce authorization logic on most queries.

> [!CAUTION]
>
> WIP - some abstractions might change in the future and lead to different interpretation of CASL rules.
>
> Please be very careful using this library in production! Test your endpoints on your own and raise an issue if some case is not supported by this library!

- Supports only CRUD actions `create`, `read`, `update` and `delete`.
- The permissions on fields of the query result are filtered by `read` ability.
- Rule conditions are automatically applied via `accessibleBy` and if `include` or `select` are used, this will even be applied to the nested relations.
- Mutating queries will throw errors in a similar format as CASL. `It's not allowed to "update" "email" on "User"`.
- On nested `connect`, `disconnect`, `upsert` or `connectOrCreate` mutation queries the client assumes an `update` action for insertion or connection.

### Examples

Now how does it work?

```ts
const { can, build } = abilityBuilder();
can("read", "Post", {
  thread: {
    creatorId: 0,
  },
});
can("read", "Thread", "id");
const caslClient = prismaClient.$extends(useCaslAbilities(build));
const result = await caslClient.post.findMany({
  include: {
    thread: true,
  },
});
/**
 * creates a query under the hood with assistance of @casl/prisma
 *
 *{
 *   where: {
 *       AND: [{
 *           OR: [{
 *               thread: {
 *                   creatorId: 0
 *                   }
 *                }]
 *            }]
 *        }
 *   include: {
 *       thread: true
 *    }
 *
 * and result will be filtered and should look like
 * { id: 0, threadId: 0, thread: { id: 0 } }
 */
```

Mutations will only run, if abilities allow it.

```ts
const { can, build } = abilityBuilder();
can("update", "Post");
cannot("update", "Post", "text");
const caslClient = prismaClient.$extends(useCaslAbilities(build));
const result = await caslClient.post.update({
  data: { text: "-" },
  where: { id: 0 },
});
/**
 * will throw an error
 * because update on text is not allowed
 */
```

Check out tests for some other examples.

### Debugging queries

To debug queries add `debugCasl: true` to the query like this `caslClient.post.findUnique({ debugCasl: true })`

### Limitations and Constraints

#### Avoid columns with prisma naming

When using prisma probably no one will use columns named `data`, `create`, `update`, `select` or `where`. However, if this should be the case, then this library most probably won't work.

#### Filtering properties happens in prisma extension and not on database

A prisma query should result in the queried data with only permitted fields.
Since conditional filtering of fields cannot be done within a database query by prisma, the extension does this after querying the data. However, to get permitted fields per queried data, all the fields mentioned in rule conditions need to be available to, within the extension. Therefore the extension gathers all the necessary fields even if no `read` rights exist for them. The query itself and the data might be large and performance slower than a simple query, but now we can apply the CASL abilities to remove all restricted fields. Within this process we also remove all the additional queried data, so that the final result represents permittedd data of the actual prisma query.

```ts
can("read", "User", "email", {
  posts: {
    some: {
      authorId: 0,
    }
  },
});
cannot('read', 'Post') // !!! we cannot read post

const result = client.user.findMany();

console.log(result) // [{ email: "-" }]


/**
 * internally this query is used:
 *
 * {
 *        where: {
 *          AND: [{
 *              OR: [{
 *                posts: { some: { authorId: 0 } }
 *                }]
 *            }]
 *        },
 *        include: { posts: { select: { authorId: true } } }
 *      }
 * /
```

Here are some performance metrics for the above query for the small test sqlite db:

- plain prisma query: **0.533909**
- casl prisma query: **3.269526**
  - create abilities: **0.446727**
  - enrich query with casl: **1.080605**
  - prisma query: **1.175109**
  - filtering query results: **0.567084**

#### Nested fields and wildcards are not supported / tested

`can('read', 'User', ['nested.field', 'field.*'])` probably won't work.
