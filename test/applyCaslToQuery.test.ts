
import { Prisma } from '@prisma/client'
import { applyCaslToQuery } from '../src/applyCaslToQuery'
import { caslOperationDict, PrismaCaslOperation } from '../src/helpers'
import { abilityBuilder } from './abilities'
describe('apply casl to query', () => {

    it('does not add conditions if there are none on abilities', async () => {
        const { can, build } = abilityBuilder()
        can('read', 'Post', ['id'])
        can('read', 'User')
        const abilities = build()
        const result = applyCaslToQuery(Prisma, 'findUnique', {
            where: {
                id: 1
            },
            include: {
                posts: true
            }
        }, abilities, 'User')
        expect(result.args).toEqual({
            include: {
                posts: true
            },
            where: {
                id: 1
            }
        })
        expect(result.mask).toEqual({})
    })

    it('applies nested select and where', async () => {
        const { can, build } = abilityBuilder()
        can('read', 'Post', ['id'], {
            thread: {
                is: {
                    creatorId: 0
                }
            }
        })
        can('read', 'User', ['email', 'id'], {
            id: 2
        })
        can('read', 'User', ['email'])
        const abilities = build()
        const result = applyCaslToQuery(Prisma, 'findUnique', {
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
        }, abilities, 'Post')
        expect(result.args).toEqual({
            select: {
                author: {
                    select: {
                        email: true,
                        id: true,
                        posts: {
                            include: {
                                thread: {
                                    select: {
                                        creatorId: true
                                    }
                                }
                            },
                            where: {
                                AND: [{
                                    OR: [{
                                        thread: {
                                            is: {
                                                creatorId: 0
                                            }
                                        }
                                    }]
                                }]
                            }
                        }
                    }
                },
                thread: {
                    select: {
                        creatorId: true
                    }
                }
            },
            where: {
                AND: [{
                    OR: [{
                        thread: {
                            is: {
                                creatorId: 0
                            }
                        }
                    }
                    ]
                }],
                id: 1,
            }
        })
        expect(result.mask).toEqual({
            author: {
                id: true,
                posts: {
                    thread: true
                }
            },
            thread: true
        })
    })
    it('ignores conditional rule', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User' as any)
        can('read', 'User', ['email'], {
            id: 0
        })
        const abilities = build()
        const result = applyCaslToQuery(Prisma, 'findUnique', {}, abilities, 'User')
        expect(result.args).toEqual({})
        expect(result.mask).toEqual({})
    })

    it('applies where condition', () => {
        const { can, build } = abilityBuilder()

        can('read', 'User', 'email', { id: 0 })
        const abilities = build()
        const result = applyCaslToQuery(Prisma, 'findUnique', {
            select: {
                email: true
            }

        }, abilities, 'User')
        expect(result.args).toEqual({ where: { AND: [{ OR: [{ id: 0 }] }] }, select: { id: true, email: true } })
        expect(result.mask).toEqual({
            id: true
        })
    })
    it('removes where condition on create', () => {
        const { can, build } = abilityBuilder()
        can('create', 'Post')
        can('read', 'User', ['email'], {})
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        const abilities = build()
        const result = applyCaslToQuery(Prisma, 'create', {
            include: {
                author: true
            }
        }, abilities, 'Post')
        expect(result.args).toEqual({ include: { author: true } })
        expect(result.mask).toEqual({})
    })
    Object.entries(caslOperationDict).map(([operation, settings]) => {
        it(`${operation} applies ${settings.dataQuery ? 'data' : 'no data'} ${settings.whereQuery ? 'where' : 'no where'} and ${settings.includeSelectQuery ? 'include/select' : 'no include/select'} query`, () => {
            const { can, build } = abilityBuilder()

            can('update', 'User', { id: 0 })
            can('delete', 'User', { id: 0 })
            can('create', 'User', { id: 0 })
            can('read', 'User', { id: 0 })
            can('read', 'Post', ['id'])

            const abilities = build()
            const result = applyCaslToQuery(Prisma, operation as PrismaCaslOperation, {
                ...(settings.dataQuery ? { data: { id: 0 } } : {}),
                ...(settings.includeSelectQuery ? { include: { posts: true } } : {})
            }, abilities, 'User')


            if (settings.dataQuery) {
                expect(result.args.data).toEqual({ id: 0 })
            } else {
                expect(result.args.data).toBeUndefined()
            }
            if (settings.whereQuery) {
                expect(result.args.where).toEqual({ AND: [{ OR: [{ id: 0 }] }] })
            } else {
                expect(result.args.where).toBeUndefined()
            }
            if (settings.includeSelectQuery) {
                expect(result.args.include).toEqual({ posts: true })
                expect(result.args.select).toBeUndefined()
                expect(result.mask).toEqual({})
            } else {
                expect(result.args.include).toBeUndefined()
                expect(result.args.select).toBeUndefined()
                expect(result.mask).toBeUndefined()
            }
        })
    })

})