/**
 * This file is a type-checking test that simulates how an external consumer
 * would use the prisma-extension-casl library.
 *
 * It is never executed — only type-checked with `tsc --noEmit`.
 */

import { Ability, AbilityBuilder } from '@casl/ability'
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma'
import { applyCaslToQuery, useCaslAbilities } from 'prisma-extension-casl'
import { Post, PrismaClient, User } from './generated/client'

// ---------------------------------------------------------------------------
// 1. Define ability types
// ---------------------------------------------------------------------------

type AppAbility = Ability<
  [string, Subjects<{ User: User; Post: Post }>],
  PrismaQuery
>

function buildAbilities() {
  const builder = new AbilityBuilder<AppAbility>(createPrismaAbility)
  builder.can('read', 'User', ['id', 'email'])
  builder.can('read', 'Post', ['id', 'title'])
  builder.can('create', 'User')
  return builder
}

// ---------------------------------------------------------------------------
// 2. Create a Prisma client and extend it
// ---------------------------------------------------------------------------

const prisma = new PrismaClient({} as any)

// Basic usage — no options
const client1 = prisma.$extends(useCaslAbilities(buildAbilities))

// With options
const client2 = prisma.$extends(
  useCaslAbilities(buildAbilities, {
    permissionField: '_permissions',
    addPermissionActions: ['manage'],
  })
)

// ---------------------------------------------------------------------------
// 3. Type-check that the extended client still has all Prisma methods
// ---------------------------------------------------------------------------

async function checkTypes() {
  // --- findMany ---
  const users: User[] = await client1.user.findMany()
  const posts: Post[] = await client1.post.findMany()

  // --- findFirst ---
  const user: User | null = await client1.user.findFirst({ where: { id: 1 } })
  const post: Post | null = await client1.post.findFirst({ where: { id: 1 } })

  // --- findUnique ---
  const userById: User | null = await client1.user.findUnique({ where: { id: 1 } })

  // --- create ---
  const newUser: User = await client1.user.create({
    data: { email: '[EMAIL]' },
  })

  // --- update ---
  const updatedUser: User = await client1.user.update({
    where: { id: 1 },
    data: { email: '[EMAIL]' },
  })

  // --- delete ---
  const deletedUser: User = await client1.user.delete({ where: { id: 1 } })

  // --- count ---
  const count: number = await client1.user.count()

  // --- with include ---
  const userWithPosts = await client1.user.findMany({
    include: { posts: true },
  })
  // posts should be typed as Post[]
  const firstPostIncluded: Post = userWithPosts[0].posts[0]

  // --- with select ---
  const userSelect = await client1.user.findMany({
    select: { id: true, email: true },
  })
  const selectedId: number = userSelect[0].id

  // --- $transaction (interactive) ---
  const txResult = await client1.$transaction(async (tx) => {
    const txUsers = await tx.user.findMany()
    const txPosts = await tx.post.findMany()
    return { txUsers, txPosts }
  })
  const resultUsers: User[] = txResult.txUsers
  const resultPosts: Post[] = txResult.txPosts

  // --- $transaction (batch) ---
  const batchResult = await client1.$transaction([
    client1.user.findMany(),
    client1.post.findMany(),
  ])
  const batchUsers: User[] = batchResult[0]
  const batchPosts: Post[] = batchResult[1]

  // --- $casl override ---
  // Pass the client type as a generic to preserve model methods.
  const caslClient = client1.$casl<typeof client1>((builder) => {
    builder.can('read', 'User')
    return builder
  })
  const caslUsers: User[] = await caslClient.user.findMany()

  // --- $transaction on $casl client ---
  // @ts-ignore - $casl is dynamically attached; tx type is implicit any
  const caslTxResult = await caslClient.$transaction(async (tx) => {
    const txUsers = await tx.user.findMany()
    return txUsers
  })
  const caslTxUsers: User[] = caslTxResult

  // --- with options (permissionField) ---
  const clientWithPerms = prisma.$extends(
    useCaslAbilities(buildAbilities, {
      permissionField: '_permissions',
    })
  )
  const usersWithPerms = await clientWithPerms.user.findMany()
  const firstUser: User = usersWithPerms[0]
}

// ---------------------------------------------------------------------------
// 4. Type-check applyCaslToQuery standalone
// ---------------------------------------------------------------------------

const abilities = buildAbilities().build()
const queryResult = applyCaslToQuery(
  'findMany',
  { where: { id: 1 } },
  abilities,
  'User',
  false
)