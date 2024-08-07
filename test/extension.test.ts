
import { seedClient } from './client'
import { seed } from './seed'

import { prismaQuery } from '@casl/prisma'
import { useCaslAbilities } from '../src/index'
import { abilityBuilder } from './abilities'


beforeEach(async () => {
    await seed(seedClient)
})


describe('prisma extension casl', () => {
    describe('findUnique', () => {

        it('returns only permitted fields  with conditional cannot rule', async () => {
            const { can, cannot, build } = abilityBuilder()
            can('read', 'User', ['email', 'id'])

            cannot('read', 'User', ['email'], {
                posts: {
                    some: {
                        threadId: 2
                    }
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(build)
            )

            const result = await client.user.findUnique({
                where: {
                    id: 0
                }
            })
            expect(result).toEqual({ id: 0 })
            const result2 = await client.user.findUnique({
                where: {
                    id: 1
                }
            })
            expect(result2).toEqual({ email: '1', id: 1 })
        })
        it('returns only permitted fields with conditional can rule', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', ['email'])

            can('read', 'User', ['email', 'id'], {
                posts: {
                    some: {
                        threadId: 2
                    }
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(build)
            )
            const result = await client.user.findUnique({
                where: {
                    id: 0
                }
            })
            expect(result).toEqual({ email: '0', id: 0 })
            const result2 = await client.user.findUnique({
                where: {
                    id: 1
                }
            })
            expect(result2).toEqual({ email: '1' })
        })







        it('returns limited fields only', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', ['email', 'id'], {
                id: 1
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(build)
            )
            const result = await client.user.findUnique({
                where: {
                    id: 0
                }
            })
            expect(result).toEqual({ email: '0' })

            const result2 = await client.user.findUnique({
                where: {
                    id: 1
                }
            })
            expect(result2).toEqual({ email: '1', id: 1 })
        })
        it('cannot return omitted property', async () => {
            const { can, cannot, build } = abilityBuilder()
            can('read', 'User')
            cannot('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            expect(await client.user.findUnique({
                where: {
                    id: 0
                }
            })).toEqual({ id: 0 })
        })
        it('select with limited fields for selects', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', ['id'], {
                thread: {
                    //https://casl.js.org/v6/en/package/casl-prisma#note-on-prisma-query-runtime-interpreter
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'User', ['email', 'id'], {
                id: 1
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )

            const result = await client.post.findUnique({
                where: {
                    id: 1
                },
                select: {
                    id: true,
                    author: true
                },

            })

            expect(result).toEqual({ id: 1, author: { email: '1', id: 1 } })

            const result2 = await client.post.findUnique({
                where: {
                    id: 0
                },
                select: {
                    id: true,
                    author: true
                },

            })

            expect(result2).toEqual({ id: 0, author: { email: '0' } })
        })



        it('does not include nested fields if query does not include properties to check for rules', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', ['id'], {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'Thread', ['creatorId'])
            can('read', 'User', ['email', 'id'], {
                id: 2
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )


            const result = await client.post.findUnique({
                where: {
                    id: 1
                },
                select: {
                    author: {
                        select: {
                            email: true,
                            posts: true
                        },
                    }
                },
            })
            expect(result).toEqual({ author: { email: '1' } })
        })

        it('includes nested fields if query does not include properties to check for rules', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', ['id'], {
                thread: {
                    is: {
                        creatorId: { lte: 0 }
                    }
                }
            })
            can('read', 'Thread', ['creatorId'])
            can('read', 'User', ['email', 'id'], {
                id: 2
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result2 = await client.post.findUnique({
                where: {
                    id: 1
                },
                select: {
                    author: {
                        select: {
                            email: true,
                            posts: {
                                include: {
                                    thread: {
                                        select: {
                                            creatorId: true
                                        }
                                    }
                                },
                                where: {
                                    thread: {
                                        creatorId: 0
                                    }
                                }
                            }
                        },
                    }
                },
            })

            expect(result2).toEqual({ author: { email: '1', posts: [{ 'id': 1, thread: { creatorId: 0 } }] } })
        })
        it('includes nested fields if query does not include properties to check for rules', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', ['id'], {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'Thread', ['id'])
            can('read', 'User', ['email', 'id'], {
                id: 2
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result2 = await client.post.findUnique({
                where: {
                    id: 1
                },
                select: {
                    author: {
                        select: {
                            email: true,
                            posts: {
                                include: {
                                    thread: true
                                },
                                where: {
                                    thread: {
                                        creatorId: 0
                                    }
                                }
                            }
                        },
                    }
                },
            })

            expect(result2).toEqual({ author: { email: '1', posts: [{ 'id': 1, thread: { id: 0 } }] } })
        })

        it('ignores conditional rule', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User' as any)
            can('read', 'User', ['email'], {
                id: 0
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: '0', id: 0 }, { email: '1', id: 1 }])
        })

        it('ignores conditional rule', async () => {
            const { can, cannot, build } = abilityBuilder()
            can('read', 'User')
            cannot('read', 'User', 'email', {
                id: 0
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ id: 0 }, { email: '1', id: 1 }])
        })
        it('applies filter props and ignores weaker can rule', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', 'email')
            can('read', 'User', {
                id: 0
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: '0', id: 0 }, { email: '1' }])
        })
        it('allows to see more props on a condition', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', 'email')
            can('read', 'User', ['id'], { id: 0 })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: '0', id: 0 }, { email: '1' }])
        })
        it('allows to see only specified props on a condition', async () => {
            const { can, build } = abilityBuilder()

            can('read', 'User', 'email', { id: 0 })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.findMany()

            expect(result).toEqual([{ 'email': '0' }])
        })
        it('allows to see more props on a condition', async () => {
            const { can, build } = abilityBuilder()

            can('read', 'User', 'id', { id: 1 })
            can('read', 'User', 'email', { id: 0 })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.findMany()

            expect(result).toEqual([{ 'email': '0' }, { id: 1 }])
        })
        it('can findUnique if nested id is correct and included', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'Thread', 'id')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.post.findUnique({ where: { id: 0 }, include: { thread: true } })
            expect(result).toEqual({ authorId: 0, id: 0, threadId: 0, text: '', thread: { id: 0 } })
        })
        it('cannot findUnique if nested id is correct and included, but nested has no read rights', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await expect(client.post.findUnique({ where: { id: 0 }, include: { thread: true } })).rejects.toThrow()
        })
        it('cannot findUnique if nested id is not correct and included', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'Thread', 'id')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )

            expect(await client.post.findUnique({
                where: { id: 2 },
                include: {
                    thread: true
                }
            })).toBeNull()
        })
        it('cannot findUnique if nested id is not readable', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'Thread', 'id')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )

            expect(await client.post.findUnique({
                where: { id: 2 },
            })).toBeNull()
        })
        it('can findUnique include', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'User', {
                id: 0
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.post.findUnique({
                where: { id: 0 },
                include: {
                    author: true
                }
            })
            expect(result?.author?.id).toBe(0)

            expect(await client.post.findUnique({
                where: { id: 1 },
                include: {
                    author: true
                }
            })).toBeNull()
        })

        it('cannot findUnique', async () => {
            const { can, cannot, build } = abilityBuilder()
            can('read', 'Post')
            cannot('read', 'Post', {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.post.findUnique({ where: { id: 2 } })
            expect(result?.authorId).toBe(1)
            expect(await client.post.findUnique({
                where: { id: 1 }
            })).toBeNull()
        })
    })
    describe('findMany', () => {
        it('filters only readable posts', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    is: {
                        creatorId: 0
                    }
                }
            })
            can('read', 'Thread', 'id')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.post.findMany({ include: { thread: true } })
            expect(result).toEqual([{ authorId: 0, id: 0, text: '', threadId: 0, thread: { id: 0 } }, { authorId: 1, id: 1, text: '', threadId: 0, thread: { id: 0 } }, { authorId: 0, id: 3, text: '', threadId: 2, thread: { id: 2 } }])
        })
        it('checks post permission but does not include it in output', async () => {
            const { can, cannot, build } = abilityBuilder()
            can('read', 'User', 'email', {
                posts: {
                    some: {
                        authorId: 0
                    }
                }
            })
            cannot('read', 'Post')
            const client = seedClient.$extends(
                useCaslAbilities(build)
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: "0" }])
        })
    })

    describe('update', () => {
        it('cannot update if no abiltiy exists', async () => {
            const { build } = abilityBuilder()

            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )

            await expect(client.user.update({
                data: {
                    email: '2'
                },
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('can update with ability, but cannot read', async () => {
            const { can, build } = abilityBuilder()
            can('update', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.update({
                data: {
                    email: 'new'
                },
                where: {
                    id: 0
                }
            })
            expect(result).toBeNull()
        })
        it('can update with ability but only read permitted values', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', ['email'])
            can('update', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.update({
                data: {
                    email: 'new'
                },
                where: {
                    id: 0
                }
            })
            expect(result).toEqual({ email: 'new' })
        })
        it('can update permitted property with ability', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User')
            can('update', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.update({
                data: {
                    email: 'new'
                },
                where: {
                    id: 0
                }
            })
            expect(result).toEqual({ id: 0, email: 'new' })
        })
        it('cannot update non-permitted property with ability', async () => {
            const { can, build } = abilityBuilder()
            can('update', 'User', ['id'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await expect(client.user.update({
                data: {
                    email: 'new'
                },
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('cannot update omitted property with ability', async () => {
            const { can, cannot, build } = abilityBuilder()
            can('update', 'User')
            cannot('update', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await expect(client.user.update({
                data: {
                    email: 'new'
                },
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('can update permitted property with ability and query included data', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', ['email'])
            can('update', 'User', ['email'])
            can('read', 'Post', ['id'])
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.update({
                data: {
                    email: 'new'
                },
                where: {
                    id: 0
                },
                include: {
                    posts: true
                }
            })
            expect(result).toEqual({ email: 'new', posts: [{ id: 0 }, { id: 3 }] })
        })
        it('can do nested updates', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', 'email')
            can('update', 'User')
            can('update', 'Post')
            can('read', 'Post')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.update({
                data: {
                    email: 'new',
                    posts: {
                        update: {
                            data: {
                                text: '1'
                            },
                            where: {
                                id: 0
                            }
                        }
                    }
                },
                where: {
                    id: 0
                },
                include: {
                    posts: {
                        select: { id: true, text: true }
                    }
                }
            })
            expect(result).toEqual({ email: 'new', posts: [{ id: 0, text: '1' }, { id: 3, text: '' }] })
        })
        it('cannot do nested updates if no ability exists', async () => {
            const { can, build } = abilityBuilder()
            can('update', 'User')
            can('read', 'Post')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )

            await expect(client.user.update({
                data: {
                    email: 'new',
                    posts: {
                        connect: {
                            id: 0
                        }
                    }
                },
                where: {
                    id: 0
                },
                include: {
                    posts: {
                        select: { id: true, text: true }
                    }
                }
            })).rejects.toThrow()
        })
    })

    describe('delete', () => {
        it('cannot delete if not ability exists', async () => {
            const { can, build } = abilityBuilder()
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await expect(client.user.delete({
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('can delete if ability exists, but cannot read result', async () => {
            const { can, build } = abilityBuilder()
            can('delete', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.delete({
                where: {
                    id: 0
                }
            })
            const deleted = await seedClient.user.findUnique({ where: { id: 0 } })
            expect(deleted).toBeNull()
            expect(result).toBeNull()
        })
        it('can delete if ability exists and can read result if ability exists', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User')
            can('delete', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.delete({
                where: {
                    id: 0
                }
            })
            const deleted = await seedClient.user.findUnique({ where: { id: 0 } })
            expect(deleted).toBeNull()
            expect(result).toEqual({ id: 0, email: '0' })
        })
        it('can delete if ability exists and condition applies', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User')
            can('delete', 'User', {
                id: 0
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.delete({
                where: {
                    id: 0
                }
            })
            const deleted = await seedClient.user.findUnique({ where: { id: 0 } })
            expect(deleted).toBeNull()
            expect(result).toEqual({ id: 0, email: '0' })
        })
        it('cannot delete if ability exists and condition does not apply', async () => {
            const { can, build } = abilityBuilder()
            can('delete', 'User', {
                id: 1
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await expect(client.user.delete({
                where: {
                    id: 0
                }
            })).rejects.toThrow()
            const deleted = await seedClient.user.findUnique({ where: { id: 0 } })
            expect(deleted).toBeDefined()
        })
    })
    describe('deleteMany', () => {
        it('cannot delete many if not ability exists', async () => {
            const { can, build } = abilityBuilder()
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await expect(client.user.deleteMany({
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('can delete many if ability exists', async () => {
            const { can, build } = abilityBuilder()
            can('delete', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await client.user.deleteMany({
                where: {
                    id: {
                        gte: 0
                    }
                }
            })
            expect(await seedClient.user.count()).toBe(0)
        })
        it('can delete many if ability exists and condition applies', async () => {
            const { can, build } = abilityBuilder()
            can('delete', 'User', {
                id: {
                    gte: 0
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await client.user.deleteMany({
                where: {
                    id: {
                        gte: 0
                    }
                }
            })
            expect(await seedClient.user.count()).toBe(0)
        })
        it('cannot delete many if ability exists and condition does not applies', async () => {
            const { can, build } = abilityBuilder()
            can('delete', 'User', {
                id: {
                    lte: 0
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await client.user.deleteMany({
                where: {
                    id: {
                        gte: 0
                    }
                }
            })
            expect(await seedClient.user.count()).toBe(1)
        })
    })
    describe('fluent api queries', () => {
        it('can do chained queries if abilities exist', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User')
            can('read', 'Thread')
            can('read', 'Post', { id: 0 })
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            const result = await client.user.findUnique({ where: { id: 0 } }).posts()
            expect(result).toEqual([{ authorId: 0, id: 0, text: '', threadId: 0 }])
        })
        it('can do chained queries if abilities exist', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(() => build())
            )
            await expect(client.user.findUnique({ where: { id: 0 } }).posts()).rejects.toThrow()

        })
    })

})
afterAll(async () => {
    await seedClient.$disconnect()

})