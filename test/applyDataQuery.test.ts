
import { applyDataQuery } from '../src/applyDataQuery'
import { abilityBuilder } from './abilities'


describe('apply data query', () => {

    it('converts id to connect', () => {
        const { can, build } = abilityBuilder()
        can('update', 'Post')
        can('update', 'User')
        const result = applyDataQuery(build(), { data: { authorId: 0 }, where: { id: 0 } }, 'update', 'Post')
        expect(result).toEqual({ data: { author: { connect: { id: 0, AND: [{}] } } }, where: { id: 0, AND: [{}] } })
    })
    it('throws error if update on connection is not allowed', () => {
        const { can, cannot, build } = abilityBuilder()
        can('update', 'Post')
        cannot('update', 'User')
        expect(() => applyDataQuery(build(), { data: { authorId: 0 }, where: { id: 0 } }, 'update', 'Post')).toThrow(`It's not allowed to run "update" on "User"`)
    })
        ;['update', 'create'].map((mutation) => {
            describe('mutation', () => {

                it('adds where clause to query', () => {
                    const { can, build } = abilityBuilder()
                    can(mutation, 'User', {
                        id: 0
                    })
                    const result = applyDataQuery(build(), { data: { id: 0 }, where: { id: 1 } }, mutation, 'User')
                    expect(result).toEqual({
                        data: { id: 0 },
                        where: { id: 1, AND: [{ OR: [{ id: 0 }] }] }
                    })
                })

                it('throws error if mutation of property is omitted', () => {
                    const { can, cannot, build } = abilityBuilder()
                    can(mutation, 'User')
                    cannot(mutation, 'User', 'email')
                    expect(() => applyDataQuery(build(), {
                        data: { email: '-1' }, where: {
                            id: 0
                        }
                    }, mutation, 'User')).toThrow(`It's not allowed to "${mutation}" "email" on "User"`)
                })

                it('throws error if mutation of property is not permitted', () => {
                    const { can, build } = abilityBuilder()
                    can(mutation, 'User', 'id')
                    expect(() => applyDataQuery(build(), {
                        data: { email: '-1' }, where: {
                            id: 0
                        }
                    }, mutation, 'User')).toThrow(`It's not allowed to "${mutation}" "email" on "User"`)
                })
            })
        })
    describe('upsert', () => {
        it('adds where clause to query', () => {
            const { can, build } = abilityBuilder()
            can('update', 'Thread')
            can('update', 'User', { id: 0 })
            can('create', 'User')
            const result = applyDataQuery(build(), { data: { creator: { upsert: { create: { email: '-1' }, update: { email: '-1' }, where: { id: 1 } } } }, where: { id: 0 } }, 'update', 'Thread')
            expect(result).toEqual({ data: { creator: { upsert: { create: { email: '-1' }, update: { email: '-1' }, where: { id: 1, AND: [{ OR: [{ id: 0 }] }] } } } }, where: { id: 0, AND: [{}] } })
        })
        it('throws error if creation is not allowed', () => {
            const { can, cannot, build } = abilityBuilder()
            can('update', 'Thread')
            can('update', 'User', { id: 0 })
            can('create', 'User')
            cannot('create', 'User', 'email')

            expect(() => applyDataQuery(build(), { data: { creator: { upsert: { create: { email: '-1' }, update: { email: '-1' }, where: { id: 1 } } } }, where: { id: 0 } }, 'update', 'Thread'))
                .toThrow(`It's not allowed to "create" "email" on "User"`)
        })
    })

    describe('connect', () => {
        it('adds where and connection clause in nested connection update', () => {
            const { can, build } = abilityBuilder()
            can('update', 'User', {
                id: 0
            })
            can('update', 'Post', {
                id: 1
            })
            const result = applyDataQuery(build(), { data: { id: 1, posts: { connect: { id: 0 } } }, where: { id: 0 } }, 'update', 'User')
            expect(result).toEqual({ data: { id: 1, posts: { connect: { id: 0, AND: [{ OR: [{ id: 1 }] }] } } }, where: { id: 0, AND: [{ OR: [{ id: 0 }] }] } })
        })
        it('adds where and connection clause in nested array connection update', () => {
            const { can, build } = abilityBuilder()
            can('update', 'User', {
                id: 0
            })
            can('update', 'Post', {
                id: 1
            })
            const result = applyDataQuery(build(), { data: { id: 1, posts: { connect: [{ id: 0 }] } }, where: { id: 0 } }, 'update', 'User')
            expect(result).toEqual({ data: { id: 1, posts: { connect: [{ id: 0, AND: [{ OR: [{ id: 1 }] }] }] } }, where: { id: 0, AND: [{ OR: [{ id: 0 }] }] } })
        })
        it('throws error if data in nested connection is not allowed', () => {
            const { can, cannot, build } = abilityBuilder()
            can('update', 'User')

            cannot('update', 'Post')
            expect(() => applyDataQuery(build(), { data: { id: 1, posts: { connect: { id: 0 } } }, where: { id: 0 } }, 'update', 'User'))
                .toThrow(`It's not allowed to run "update" on "Post"`)
        })

    })
    describe('connectOrCreate', () => {
        it('adds where and connection clause in nested connection update', () => {
            const { can, build } = abilityBuilder()
            can('update', 'User', {
                id: 0
            })
            can('create', 'Post', {
                id: 1
            })
            can('update', 'Post', {
                id: 2
            })

            const result = applyDataQuery(build(), {
                data: {
                    id: 1, posts: {
                        connectOrCreate: {
                            create: { text: '' },
                            where: {
                                id: 1
                            }
                        }
                    }
                },
                where: {
                    id: 0
                }
            }, 'update', 'User')

            expect(result).toEqual({ data: { id: 1, posts: { connectOrCreate: { create: { text: '' }, where: { id: 1, AND: [{ OR: [{ id: 2 }] }] } } } }, where: { id: 0, AND: [{ OR: [{ id: 0 }] }] } })
        })

        it('adds where and connection clause in nested array connection update', () => {
            const { can, build } = abilityBuilder()
            can('update', 'User', {
                id: 0
            })
            can('create', 'Post', {
                id: 1
            })
            can('update', 'Post', {
                id: 2
            })
            const result = applyDataQuery(build(), {
                data: {
                    id: 1, posts: {
                        connectOrCreate: [{
                            create: { text: '' },
                            where: {
                                id: 0
                            }
                        }]
                    }
                },
                where: {
                    id: 0
                }
            }, 'update', 'User')
            expect(result).toEqual({ data: { id: 1, posts: { connectOrCreate: [{ create: { text: '' }, where: { id: 0, AND: [{ OR: [{ id: 2 }] }] } }] } }, where: { id: 0, AND: [{ OR: [{ id: 0 }] }] } })
        })
        it('throws error if data in nested connection is not allowed', () => {
            const { can, cannot, build } = abilityBuilder()
            can('update', 'User', {
                id: 0
            })
            cannot('create', 'Post', {
                id: 1
            })
            can('update', 'Post', {
                id: 2
            })


            expect(() => applyDataQuery(build(), {
                data: {
                    id: 1, posts: {
                        connectOrCreate: [{
                            create: { text: '' },
                            where: {
                                id: 0
                            }
                        }]
                    }
                },
                where: {
                    id: 0
                }
            }, 'update', 'User'))
                .toThrow(`It's not allowed to run "create" on "Post"`)
        })
        it('throws error if data in nested create property in connection is not allowed', () => {
            const { can, build } = abilityBuilder()
            can('update', 'User', {
                id: 0
            })
            can('create', 'Post', 'id', {
                id: 1
            })
            can('update', 'Post', {
                id: 2
            })


            expect(() => applyDataQuery(build(), {
                data: {
                    id: 1, posts: {
                        connectOrCreate: [{
                            create: { text: '' },
                            where: {
                                id: 0
                            }
                        }]
                    }
                },
                where: {
                    id: 0
                }
            }, 'update', 'User'))
                .toThrow(`It's not allowed to "create" "text" on "Post"`)
        })
    })
    describe('nested update', () => {
        it('can update nested nested update', () => {
            const { can, build } = abilityBuilder()
            can('update', 'User')
            can('update', 'Post')
            can('update', 'Thread')

            const result = applyDataQuery(build(), { data: { id: 1, posts: { update: { data: { thread: { update: { id: 0 } } }, where: { id: 0 } } } }, where: { id: 0 } }, 'update', 'User')
            expect(result).toEqual({ data: { id: 1, posts: { update: { data: { thread: { update: { id: 0 } } }, where: { id: 0, AND: [{}] } } } }, where: { id: 0, AND: [{}] } })
        })
        it('throws error if data in nested nested update is not allowed', () => {
            const { can, cannot, build } = abilityBuilder()
            can('update', 'User')
            can('update', 'Post')
            cannot('update', 'Thread')

            expect(() => applyDataQuery(build(), { data: { id: 1, posts: { update: { data: { thread: { update: { id: 0 } } }, where: { id: 0 } } } }, where: { id: 0 } }, 'update', 'User'))
                .toThrow(`It's not allowed to run "update" on "Thread"`)
        })
    })
    describe('createMany', () => {
        it('adds where and connection clause in nested connection update', () => {
            const { can, build } = abilityBuilder()
            can('create', 'User')
            can('create', 'Post')

            expect(applyDataQuery(build(), {
                data: {
                    id: 0,
                    posts: {
                        createMany: {
                            data: {
                                text: ''
                            }
                        }
                    }
                }
            }, 'create', 'User'))
                .toEqual({ data: { id: 0, posts: { createMany: { data: { text: '' } } } } })
        })
        it('throws error if data in nested create is not allowed', () => {
            const { can, cannot, build } = abilityBuilder()
            can('create', 'User')
            can('create', 'Post')
            cannot('create', 'Post', 'text')

            expect(() => applyDataQuery(build(), {
                data: {
                    email: '-',
                    posts: {
                        createMany: {
                            data: [
                                {
                                    id: 0
                                },
                                {
                                    text: ''
                                }
                            ]
                        }
                    }
                }
            }, 'create', 'User'))
                .toThrow(`It's not allowed to "create" "text" on "Post"`)
        })
    })
})


