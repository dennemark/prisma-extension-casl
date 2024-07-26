# Prisma Extension CASL


[Prisma client extension](https://www.prisma.io/docs/orm/prisma-client/client-extensions) that utilizes [CASL](https://casl.js.org/) to enforce authorization logic on most queries. 

> [!CAUTION]
>
> WIP - some abstractions might change in the future and lead to different interpretation of CASL rules.
>
> Please be very careful using this library in production! Test your endpoints on your own and raise an issue if some case is not supported by this library!

Supports mainly/only CRUD actions `create`, `read`, `update` and `delete`, which allows us to generate and transform `include`, `select` and `where` queries to enforce nested filtering.
Mutating queries will throw errors in a similar format as CASL. `It's not allowed to "update" "email" on "User"`.

### Examples

Now how does it work?

```ts
    const { can, build } = abilityBuilder()
    can('read', 'Post', {
        thread: {
            creatorId: 0
        }
    })
    can('read', 'Thread', 'id')
    const caslClient = prismaClient.$extends(
        useCaslAbilities(build)
    )
    const result = await caslClient.post.findMany({
        include: {
            thread: true
        }
    })
    /** 
    * creates a query under the hood with assistance of @casl/prisma
    * 
    * and even adds a proper select query to thread
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
    *       thread: {
    *           select: {
    *               id: true
    *               }
    *           }
    *       }
    *    }
    */
```
Mutations will only run, if abilities allow it.

```ts
    const { can, build } = abilityBuilder()
    can('update', 'Post')
    cannot('update', 'Post', 'text')
    const caslClient = prismaClient.$extends(
        useCaslAbilities(build)
    )
    const result = await caslClient.post.update({ data: { text: '-' }, where: { id: 0 }})
    /** 
    * will throw an error
    * because update on text is not allowed
    */
```

Check out tests for some other examples.


### Limitations and Constraints

#### Nested mutations use `update` connection

On nested `connect`, `disconnect`, `upsert` or `connectOrCreate` mutation queries the client assumes an `update` action for insertion or connection.


#### CRUD actions

A limitation is the necessary use of `create`, `read`, `update` and `delete` as actions for nested queries. Since this allows us to deal with nested creations or updates. However there is an option to specify a custom `caslAction` for the highest query. It has no typing and is not tested yet. 

```ts
 client.user.findUnique({ where: { id: 0 }, caslAction: 'customAction' })
 ```

#### Avoid columns with prisma naming

When using prisma probably no one will use columns named `data`, `create`, `update` or `where`. However, if this should be the case, then this library most probably won't work.

#### Limit fields via conditions
The main use case is allowing more fields for some users:
```ts
        can('read', 'User', 'email')
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        client.user.findMany() 
        // will return all users with email
        // however
        client.user.findMany({ id: 0 })
        // will show email and id!
```
If fields should only be permitted on certain conditions, they will only be accessible, if these conditions apply. The reason is, that we do not know if it contradicts another rule.
See this example:

```ts
        can('read', 'User')
        can('read', 'User', 'email', {
            id: 0
        })
        can('read', 'User', 'id', {
            id: 1
        })
        client.user.findMany() 
        // will return all users and more than the email property
        // since we cannot check if id is 0 or 1

        // however if our query matches the condition its rule will be used
        client.user.findMany({ id: 0 })
        // will restrict access to email prop
```
This makes DX a bit inconvenient, since we have to use our condition within our query.


#### Nested fields and wildcards are not supported

`can('read', 'User', ['nested.field', 'field.*'])` won't work. Although a wildcard could be useful in the future.

#### Conditionally filter fields with cannot
Currently the following case is not supported. It is still possible to read `email`. Waithing for reply [here](https://github.com/stalniy/casl/discussions/948).

```ts
        can('read', 'User', {
            id: 1
        })
        cannot('read', 'User', 'email', {
            id: 0
        })
```
In real world application, rather consider this:
```ts
        cannot('read', 'User', 'email')
        can('read', 'User', {
            id: userId
        })
```