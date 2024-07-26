
import { abilityBuilder } from './abilities'
import { applyCaslToQuery } from '../src/applyCaslToQuery'
import { caslOperationDict, PrismaCaslOperation } from '../src/helpers'

describe('apply casl to query', () => {

    it('adds permitted field to query and turns include into select', async () => {
        const { can, build } = abilityBuilder()
        can('read', 'Post', ['id'])
        can('read', 'User')
        const abilities = build()
        const result = applyCaslToQuery('findUnique', {
            where: {
                id: 1
            },
            include: {
                posts: true
            }
        }, abilities, 'User')
        expect(result).toEqual({
            include: {
                posts: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                id: 1
            }
        })

    })

    it('applies nested select and where and removes model if query does not fit', async () => {
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
        const abilities = build()
        const result = applyCaslToQuery('findUnique', {
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
        expect(result).toEqual({
            select: {
                author: {
                    select: {
                        email: true,
                        posts: false
                    }
                }
            },
            where: {
                AND: [{
                    OR: [{
                        thread: {
                            creatorId: 0
                        }
                    }
                    ]
                }],
                id: 1,
            }
        })

    })
    it('applies nested select and where and adds property if query fits', async () => {
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
        const abilities = build()
        const result = applyCaslToQuery('findUnique', {
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
        }, abilities, 'Post')
        expect(result).toEqual({
            select: {
                author: {
                    select: {
                        email: true,
                        posts: {
                            select: {
                                id: true,
                            },
                            where: {
                                thread: {
                                    creatorId: 0
                                },
                                AND: [{
                                    OR: [{
                                        thread: {
                                            creatorId: 0
                                        }
                                    }
                                    ]
                                }],
                            }

                        }
                    }
                }
            },
            where: {
                AND: [{
                    OR: [{
                        thread: {
                            creatorId: 0
                        }
                    }
                    ]
                }],
                id: 1,
            }
        })
    })
    it('ignores conditional rule, if not part of query', ()=>{
        const { can, build } = abilityBuilder()
        can('read', 'all' as any)
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        const abilities = build()
        const result = applyCaslToQuery('findUnique', {}, abilities, 'User')
        expect(result).toEqual({})
    })

    it('applies filter props and ignores weaker can rule', ()=>{
        const { can, build } = abilityBuilder()
        can('read', 'User', {
            id: 0
        })
        can('read', 'User', ['email', 'id'])
        const abilities = build()
        const result = applyCaslToQuery('findUnique', {}, abilities, 'User')
        expect(result).toEqual({ select: { email: true, id: true }})
    })
    it('allows to see more props on a condition', ()=>{
        const { can, build } = abilityBuilder()
        can('read', 'User', 'email')
        can('read', 'User', ['email', 'id'], {id:0})
        const abilities = build()
        const result = applyCaslToQuery('findUnique', { where: { id: 0 } }, abilities, 'User')
        expect(result).toEqual({ where: { id: 0 }, select: { email: true, id: true }})
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
            const result = applyCaslToQuery(operation as PrismaCaslOperation, {
                ...(settings.dataQuery ? { data: { id: 0 } }: {}),
                ...(settings.includeSelectQuery ? { include: { posts: true } } : {})
            }, abilities, 'User')


            if (settings.dataQuery) {
                expect(result.data).toEqual({ id: 0})
            }else {
                expect(result.data).toBeUndefined()
            }
            if (settings.whereQuery) {
                expect(result.where).toEqual({ AND: [{ OR: [{ id: 0 }] }] })
            } else {
                expect(result.where).toBeUndefined()
            }
            if (settings.includeSelectQuery) {
                expect(result.include).toEqual({ posts: { select: { id: true } } })
                expect(result.select).toBeUndefined()
            } else {
                expect(result.include).toBeUndefined()
                expect(result.select).toBeUndefined()
            }
        })
    })

})