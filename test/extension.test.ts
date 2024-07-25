
import { seedClient } from './client'
import { seed } from './seed'

import { abilityBuilder } from './abilities'
import { applyCaslToQuery, useCaslAbilities } from '../dist'


beforeEach(async () => {
    await seed(seedClient)
})


describe('prisma extension casl', () => {
    describe('findUnique', () => {

        it('returns limited fields only', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', ['email', 'id'], {
                id: 1
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
                    creatorId: 0
                }
            })
            can('read', 'User', ['email', 'id'], {
                id: 1
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(build())
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

            expect(result).toEqual({ author: { email: '1' } })

            const result2 = await client.post.findUnique({
                where: {
                    id: 1,
                    thread: {
                        creatorId: 0
                    }
                },
                select: {
                    id: true,
                    author: true
                },

            })

            expect(result2).toEqual({ id: 1, author: { email: '1' } })
        })

        it('only adds permitted fields in nested select if where clause matche abilities', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', ['id'], {
                thread: {
                    creatorId: 0
                }
            })
            can('read', 'User', ['email', 'id'], {
                id: 2
            })
            can('read', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(build())
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

            const t1 = performance.now()
            const result2 = await client.post.findUnique({
                where: {
                    id: 1
                },
                select: {
                    author: {
                        select: {
                            email: true,
                            posts: {
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
            const t2 = performance.now()
            const result3 = await seedClient.post.findUnique({
                where: {
                    id: 1
                },
                select: {
                    author: {
                        select: {
                            email: true,
                            posts: {
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
            const t3 = performance.now()

            console.log("performance", t3 - t2, t2 - t1)
            expect(result2).toEqual({ author: { email: '1', posts: [{ 'id': 1 }] } })
        })



        it('can findUnique', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    creatorId: 0
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(build())
            )
            const result = await client.post.findUnique({ where: { id: 0 } })
            expect(result).toEqual({ authorId: 0, id: 0, threadId: 0, text: '' })

            // expect(result?.authorId).toBe(0)
            expect(await client.post.findUnique({
                where: { id: 2 }
            })).toBeNull()
        })
        it('can findUnique include', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    creatorId: 0
                }
            })
            can('read', 'User', {
                id: 0
            })
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
                    creatorId: 0
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(build())
            )
            const result = await client.post.findUnique({ where: { id: 2 } })
            expect(result?.authorId).toBe(1)
            expect(await client.post.findUnique({
                where: { id: 1 }
            })).toBeNull()
        })
    })
    describe('findMany', () => {
        it.only('filters only readable posts', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'Post', {
                thread: {
                    creatorId: 0
                }
            })
            const client = seedClient.$extends(
                useCaslAbilities(build())
            )
            const result = await client.post.findMany()
            expect(result).toEqual([{ authorId: 0, id: 0, text: '', threadId: 0 }, { authorId: 1, id: 1, text: '', threadId: 0 }, { authorId: 0, id: 3, text: '', threadId: 2 }])
        })
    })

    describe('update', () => {
        it('cannot update if no abiltiy exists', async () => {
            const { build } = abilityBuilder()

            const client = seedClient.$extends(
                useCaslAbilities(build())
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
        it('can update with ability', async () => {
            const { can, build } = abilityBuilder()
            can('update', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
        it('can update with ability but only read permitted values', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User', ['email'])
            can('update', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
            can('update', 'User', ['email'])
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
            can('update', 'User', ['email'])
            can('read', 'Post', ['id'])
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
            expect(result).toEqual({ email: 'new', id: 0, posts: [{ id: 0 }, { id: 3 }] })
        })
        it('can do nested updates', async () => {
            const { can, build } = abilityBuilder()
            can('update', 'User')
            can('update', 'Post')
            can('read', 'Post')
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
            expect(result).toEqual({ email: 'new', id: 0, posts: [{ id: 0, text: '1' }, { id: 3, text: '' }] })
        })
        it('cannot do nested updates if no ability exists', async () => {
            const { can, build } = abilityBuilder()
            can('update', 'User')
            can('read', 'Post')
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
                useCaslAbilities(build())
            )
            await expect(client.user.delete({
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('can delete if ability exists', async () => {
            const { can, build } = abilityBuilder()
            can('delete', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
            can('delete', 'User', {
                id: 0
            })
            const client = seedClient.$extends(
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
                useCaslAbilities(build())
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
    describe('chained queries', () => {
        it('can do chained queries if abilities exist', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User')
            can('read', 'Post', { id: 0 })
            const client = seedClient.$extends(
                useCaslAbilities(build())
            )
            const result = await client.user.findUnique({ where: { id: 0 } }).posts()
            expect(result?.length).toBe(1)
            expect(result?.[0].threadId).toBe(0)
            expect(result?.[0].authorId).toBe(0)
        })
        it('can do chained queries if abilities exist', async () => {
            const { can, build } = abilityBuilder()
            can('read', 'User')
            const client = seedClient.$extends(
                useCaslAbilities(build())
            )
            await expect(client.user.findUnique({ where: { id: 0 } }).posts()).rejects.toThrow()

        })
    })

})
afterAll(async () => {
    await seedClient.$disconnect()

})