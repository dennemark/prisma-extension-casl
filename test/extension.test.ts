
import { seedClient } from './client'
import { seed } from './seed'

import { prismaQuery } from '@casl/prisma'
import { useCaslAbilities } from '../src/index'
import { abilityBuilder } from './abilities'


beforeEach(async () => {
    await seed(seedClient)
})


describe('prisma extension casl', () => {
    describe('override rules', () => {
        it('overwrites abilities', async () => {
            function builderFactory() {
                const builder = abilityBuilder()

                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )


            const result = await client.$casl((a) => {
                a.can('read', 'User')
                return a
            }).user.findMany()
            expect(result.length).toEqual(2)
            await expect(client.user.findMany()).rejects.toThrow()
            await expect(client.$casl((a) => a).user.findMany()).rejects.toThrow()
        })
    })
    describe('transaction', () => {
        it('reverts create within an existing batch transaction', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User', {
                    email: 'third-mail'
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.create({
                data: {
                    email: 'first-mail',
                }
            })).rejects.toThrow()
            await expect(
                client.$transaction([
                    client.user.create({
                        data: {
                            email: 'third-mail'
                        }
                    }),
                    client.user.create({
                        data: {
                            email: 'second-mail',
                        }
                    }),
                ])
            ).rejects.toThrow()
            const firstResult = await client.user.findFirst({
                where: {
                    email: 'first-mail'
                }
            })
            const secondResult = await client.user.findFirst({
                where: {
                    email: 'second-mail'
                }
            })
            const thirdResult = await client.user.findFirst({
                where: {
                    email: 'third-mail'
                }
            })
            expect(firstResult).toBeNull()
            expect(secondResult).toBeNull()
            expect(thirdResult).toBeNull()
        })
        it('read and delete work with an existing batch transaction', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                can('create', 'User')
                can('delete', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            expect(await client.user.count()).toEqual(2)
            expect(
                await client.$transaction([
                    client.user.delete({
                        where: {
                            id: 0
                        }
                    }),
                    client.user.findUnique({ where: { id: 0 } }),
                ])
            ).toEqual([{ email: '0', id: 0 }, null])
            expect(await client.user.count()).toEqual(1)

        })
        it('reverts read and delete if they error with an existing batch transaction', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                can('create', 'User')
                can('delete', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            expect(await client.user.count()).toEqual(2)
            await expect(
                client.$transaction([
                    client.user.delete({
                        where: {
                            id: 0
                        }
                    }),
                    //@ts-ignore
                    client.user.findUnique({ where: { email: 0 } }),
                ])
            ).rejects.toThrow()
            expect(await client.user.count()).toEqual(2)

        })
        it('creates within an existing batch transaction fails', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User')
                cannot('create', 'User', {
                    email: 'first-mail'
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.create({
                data: {
                    email: 'first-mail',
                }
            })).rejects.toThrow()
            const firstResult = await client.user.findFirst({
                where: {
                    email: 'first-mail'
                }
            })
            expect(firstResult).toBeNull()
            await expect(
                client.$transaction([
                    client.user.create({
                        data: {
                            email: 'second-mail',
                        }
                    }),
                    client.user.create({
                        data: {
                            email: 'third-mail'
                        }
                    })
                ])
            ).rejects.toThrow('Sequential transactions are not supported in prisma-extension-casl.')
        })
        it('reverts create within an existing interactive transaction', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User', {
                    email: 'third-mail'
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.create({
                data: {
                    email: 'first-mail',
                }
            })).rejects.toThrow()
            await expect(
                client.$transaction(async (tx) => {
                    await tx.user.create({
                        data: {
                            email: 'third-mail'
                        }
                    }),
                        await tx.user.create({
                            data: {
                                email: 'second-mail',
                            }
                        })
                })
            ).rejects.toThrow()
            const firstResult = await client.user.findFirst({
                where: {
                    email: 'first-mail'
                }
            })
            const secondResult = await client.user.findFirst({
                where: {
                    email: 'second-mail'
                }
            })
            const thirdResult = await client.user.findFirst({
                where: {
                    email: 'third-mail'
                }
            })
            expect(firstResult).toBeNull()
            expect(secondResult).toBeNull()
            expect(thirdResult).toBeNull()
        })
        it('creates within an existing interactive transaction', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User')
                cannot('create', 'User', {
                    email: 'first-mail'
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.create({
                data: {
                    email: 'first-mail',
                }
            })).rejects.toThrow()
            const firstResult = await client.user.findFirst({
                where: {
                    email: 'first-mail'
                }
            })
            expect(firstResult).toBeNull()
            expect(await
                client.$transaction(async (tx) => {
                    return [await tx.user.create({
                        data: {
                            email: 'second-mail',
                        }
                    }),
                    await tx.user.create({
                        data: {
                            email: 'third-mail'
                        }
                    })]
                })
            ).toEqual([{ "email": "second-mail" }, { "email": "third-mail" }])


        })
        it('creates within an existing interactive transaction with $casl application on transaction', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            expect(await
                client.$casl((abilities) => {
                    abilities.can('read', 'User', 'email')
                    abilities.can('create', 'User')
                    return abilities
                }).$transaction(async (tx) => {
                    return [await tx.user.create({
                        data: {
                            email: 'second-mail',
                        }
                    }),
                    await tx.user.create({
                        data: {
                            email: 'third-mail'
                        }
                    })]
                })
            ).toEqual([{ "email": "second-mail" }, { "email": "third-mail" }])


        })
    })
    describe('findUnique', () => {


        it('returns only permitted fields  with conditional cannot rule', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder
                can('read', 'User', ['email', 'id'])

                cannot('read', 'User', ['email'], {
                    posts: {
                        some: {
                            threadId: 2
                        }
                    }
                })

                return builder
            }
            const client = seedClient.$extends(
                //@ts-ignore
                useCaslAbilities(builderFactory)
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

            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', ['email'])

                can('read', 'User', ['email', 'id'], {
                    posts: {
                        some: {
                            threadId: 2
                        }
                    }
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', ['email', 'id'], {
                    id: 1
                })
                can('read', 'User', ['email'])
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                cannot('read', 'User', ['email'])
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            expect(await client.user.findUnique({
                where: {
                    id: 0
                }
            })).toEqual({ id: 0 })
        })
        it('select with limited fields for selects', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

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
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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

        it('does include nested fields if query does not include properties to check for rules', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

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
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            expect(result).toEqual({ author: { email: '1', posts: [{ id: 1 }] } })
        })

        it('includes nested fields if query does not include properties to check for rules', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

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
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

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
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User' as any)
                can('read', 'User', ['email'], {
                    id: 0
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: '0', id: 0 }, { email: '1', id: 1 }])
        })

        it('ignores conditional rule', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                cannot('read', 'User', 'email', {
                    id: 0
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ id: 0 }, { email: '1', id: 1 }])
        })
        it('applies filter props and ignores weaker can rule', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('read', 'User', {
                    id: 0
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: '0', id: 0 }, { email: '1' }])
        })
        it('allows to see more props on a condition', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('read', 'User', ['id'], { id: 0 })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: '0', id: 0 }, { email: '1' }])
        })
        it('allows to see only specified props on a condition', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder


                can('read', 'User', 'email', { id: 0 })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.findMany()

            expect(result).toEqual([{ 'email': '0' }])
        })
        it('allows to see more props on a condition', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder


                can('read', 'User', 'id', { id: 1 })
                can('read', 'User', 'email', { id: 0 })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.findMany()

            expect(result).toEqual([{ 'email': '0' }, { id: 1 }])
        })
        it('can findUnique if nested id is correct and included', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'Post', {
                    thread: {
                        is: {
                            creatorId: 0
                        }
                    }
                })
                can('read', 'Thread', 'id')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.post.findUnique({ where: { id: 0 }, include: { thread: true } })
            expect(result).toEqual({ authorId: 0, id: 0, threadId: 0, text: '', thread: { id: 0 } })
        })
        it('cannot findUnique if nested id is correct and included, but nested has no read rights', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'Post', {
                    thread: {
                        is: {
                            creatorId: 0
                        }
                    }
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.post.findUnique({ where: { id: 0 }, include: { thread: true } })).rejects.toThrow()
        })
        it('cannot findUnique if nested id is not correct and included', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'Post', {
                    thread: {
                        is: {
                            creatorId: 0
                        }
                    }
                })
                can('read', 'Thread', 'id')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )

            expect(await client.post.findUnique({
                where: { id: 2 },
                include: {
                    thread: true
                }
            })).toBeNull()
        })
        it('cannot findUnique if nested id is not readable', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'Post', {
                    thread: {
                        is: {
                            creatorId: 0
                        }
                    }
                })
                can('read', 'Thread', 'id')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )

            expect(await client.post.findUnique({
                where: { id: 2 },
            })).toBeNull()
        })
        it('can findUnique include', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

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
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'Post')
                cannot('read', 'Post', {
                    thread: {
                        is: {
                            creatorId: 0
                        }
                    }
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'Post', {
                    thread: {
                        is: {
                            creatorId: 0
                        }
                    }
                })
                can('read', 'Thread', 'id')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.post.findMany({ include: { thread: true } })
            expect(result).toEqual([{ authorId: 0, id: 0, text: '', threadId: 0, thread: { id: 0 } }, { authorId: 1, id: 1, text: '', threadId: 0, thread: { id: 0 } }, { authorId: 0, id: 3, text: '', threadId: 2, thread: { id: 2 } }])
        })
        it('checks post permission but does not include it in output', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email', {
                    posts: {
                        some: {
                            authorId: 0
                        }
                    }
                })
                cannot('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const t1 = performance.now()
            await seedClient.user.findMany({
                where: {
                    posts: {
                        some: {
                            authorId: 0
                        }
                    }
                }
            })
            console.log("plain prisma performance", performance.now() - t1)
            const result = await client.user.findMany({
                //@ts-ignore
                debugCasl: true
            })
            expect(result).toEqual([{ email: "0" }])
        })
    })

    describe('update', () => {
        it('cannot update if no abiltiy exists', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                const { build } = builder

                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('update', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', ['email'])
                can('update', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                can('update', 'User', ['email'])
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('update', 'User', ['id'])
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('update', 'User')
                cannot('update', 'User', ['email'])
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', ['email'])
                can('update', 'User', ['email'])
                can('read', 'Post', ['id'])
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('update', 'User')
                can('update', 'Post')
                can('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
        it('can do nested updates with conditions', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('update', 'User')
                can('update', 'Post', {
                    id: 0
                })
                can('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
        it('cannot do nested updates with failing conditions', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('update', 'User')
                can('update', 'Post', {
                    id: 1
                })
                can('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.update({
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
            })).rejects.toThrow()

        })
        it('cannot do nested updates if no ability exists', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('update', 'User')
                can('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.delete({
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('can delete if ability exists, but cannot read result', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('delete', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                can('delete', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                can('delete', 'User', {
                    id: 0
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('delete', 'User', {
                    id: 1
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.deleteMany({
                where: {
                    id: 0
                }
            })).rejects.toThrow()
        })
        it('can delete many if ability exists', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('delete', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('delete', 'User', {
                    id: {
                        gte: 0
                    }
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('delete', 'User', {
                    id: {
                        lte: 0
                    }
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
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
    describe('create', () => {
        it('cant do nested create with conditions', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User')
                can('update', 'Thread')
                can('create', 'Post', {
                    text: '1'
                })
                can('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.create({
                data: {
                    email: 'new',

                    posts: {
                        create: {
                            threadId: 0,
                            text: '1'
                        }
                    }
                }
            })
            expect(result).toEqual({ email: 'new' })
        })
        it('can do nested create with conditions', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User')
                can('update', 'Thread')
                can('create', 'Post', {
                    author: {
                        is: {
                            email: 'old'
                        }
                    }
                })
                can('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            expect(await client.user.create({
                data: {
                    email: 'old',
                    posts: {
                        create: {
                            threadId: 0,
                            text: '1'
                        }
                    }
                }
            })).toEqual({ email: 'old' })
        })
        it('cannot do nested create with failing conditions', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User')
                can('update', 'Thread')
                can('create', 'Post', {
                    author: {
                        is: {
                            email: 'old'
                        }
                    }
                })
                can('read', 'Post')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.create({
                data: {
                    email: 'new',

                    posts: {
                        create: {
                            threadId: 0,
                            text: '1'
                        }
                    }
                }
            })).rejects.toThrow()
        })
        it('cannot do create with failing conditions', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', 'email')
                can('create', 'User', {
                    email: 'old'
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.create({
                data: {
                    email: 'new',
                }
            })).rejects.toThrow()
        })

    })
    describe('fluent api queries', () => {
        it('can do chained queries if abilities exist', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User', {
                    id: 0
                })
                can('read', 'Thread')
                can('read', 'Post', { id: 0 })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            const result = await client.user.findUnique({ where: { id: 0 } }).posts()
            expect(result).toEqual([{ authorId: 0, text: '', id: 0, threadId: 0 }])
        })
        it('can do chained queries if abilities exist', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('read', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            await expect(client.user.findUnique({ where: { id: 0 } }).posts()).rejects.toThrow()

        })
        it('can do chained queries with local abilities', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder
                can('read', 'User')
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory)
            )
            // await expect(await client.user.findUnique({ where: { id: 0 } }).posts()).rejects.toThrow()

            const result = await client.$casl((abilities) => {
                abilities.can('read', 'Post')
                return abilities
            }).user.findUnique({ where: { id: 0 } }).posts()
            expect(result).toEqual([{ authorId: 0, text: '', id: 0, threadId: 0 },
            {
                authorId: 0,
                id: 3,
                text: '',
                threadId: 2,
            },
            ])
        })
    })
    describe('store permissions', () => {
        it('has permissions on custom prop on chained queries', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('create', 'User')
                can('read', 'User')
                can('delete', 'User', {
                    posts: {
                        some: {
                            id: 0
                        }
                    }
                })
                can('update', 'User', {
                    posts: {
                        some: {
                            id: 0
                        }
                    }
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory, 'casl')
            )
            const result = await client.user.findMany()
            expect(result).toEqual([{ email: '0', id: 0, 'casl': ['create', 'read', 'update', 'delete'] }, { email: '1', id: 1, 'casl': ['create', 'read'] }])
        })
        it('has permissions on custom prop on chained queries', async () => {
            function builderFactory() {
                const builder = abilityBuilder()
                const { can, cannot } = builder

                can('create', 'User')
                can('read', 'Post')
                can('read', 'User')
                can('delete', 'User', {
                    posts: {
                        some: {
                            id: 0
                        }
                    }
                })
                can('update', 'User', {
                    posts: {
                        some: {
                            id: 0
                        }
                    }
                })
                return builder
            }
            const client = seedClient.$extends(
                useCaslAbilities(builderFactory, 'casl')
            )
            const result = await client.post.findUnique({ where: { id: 0 } }).author()
            expect(result).toEqual({ email: '0', id: 0, casl: ['create', 'read'] })
        })
    })

})
afterAll(async () => {
    await seedClient.$disconnect()

})