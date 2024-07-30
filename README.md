# Prisma Extension CASL

[Prisma client extension](https://www.prisma.io/docs/orm/prisma-client/client-extensions) that utilizes [CASL](https://casl.js.org/) to enforce authorization logic on most queries.

> [!CAUTION]
>
> WIP - some abstractions might change in the future and lead to different interpretation of CASL rules.
>
> Please be very careful using this library in production! Test your endpoints on your own and raise an issue if some case is not supported by this library!

- Supports only CRUD actions `create`, `read`, `update` and `delete`.
- Rule conditions are applied via `accessibleBy` and if `include` or `select` are used, this will even be nested.
- Mutating queries will throw errors in a similar format as CASL. `It's not allowed to "update" "email" on "User"`.
- The query result with nested entries is filtered by `read` ability.
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

### Limitations and Constraints

#### Avoid columns with prisma naming

When using prisma probably no one will use columns named `data`, `create`, `update`, `select` or `where`. However, if this should be the case, then this library most probably won't work.

#### Relational conditions need read rights on relation and include statment

To filter fields, the data of the conditions needs to be available, since filtering does not happen on the database but in our app.

```ts
can("read", "User", "email", {
  post: {
    ownerId: 0,
  },
});
can("read", "Post", ["id"]);
client.user.findMany(); // []

client.user.findMany({ include: { post: true } }); // [{ email: "-", post: { id: 0 } }]
```

#### Nested fields and wildcards are not supported / tested

`can('read', 'User', ['nested.field', 'field.*'])` probably won't work.
