
import { abilityBuilder } from './abilities'
import { applyIncludeSelectQuery } from '../src/applyIncludeSelectQuery'

describe('apply include select query', () => {
    it('applies select method', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email'], {})
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            select: {
                author: true
            }
        }, 'Post')
        expect(args).toEqual({
            select: {
                author: {
                    select: {
                        email: true
                    }
                }
            },
            where: {
                AND: [{
                    author: {
                        OR: [{ id: 0 }, {}]
                    }
                }]
            }
        })
    })
    it.todo('applies select method'/*, () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', {
            id: 1
        })
        cannot('read', 'User', 'email', {
            id: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            select: {
                author: true
            }
        }, 'Post')
        expect(args).toEqual({
            select: {
                author: {
                    select: {
                        email: true
                    }
                }
            },
            where: {
                AND: [{
                    author: {
                        OR: [{ id: 1 }],
                        AND: [{ NOT: { id: 0 } }]
                    }
                }]
            }
        })
    }*/)
    it('applies select method on array', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'Post', 'id', {
            authorId: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            select: {
                posts: true
            }
        }, 'User')
        expect(args).toEqual({
            select: {
                posts: false
            }
        })
    })
    it('applies select method on array and exposes permitted fields on specific query', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'Post', 'id', {
            authorId: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            select: {
                posts: {
                    // this equals rule and therefore id is a visible field
                    where: { authorId: 0 }
                }
            }
        }, 'User')
        expect(args).toEqual({
            select: {
                posts: {
                    where: {
                        authorId: 0,
                        AND: [{ OR: [{ authorId: 0 }] }]
                    },
                    select: {
                        id: true
                    }
                }
            }
        })
    })
    it('applies include method', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email'], {})
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            include: {
                author: true
            }
        }, 'Post')
        expect(args).toEqual({
            include: {
                author: {
                    select: {
                        email: true
                    }
                }
            },
            where: {
                AND: [{
                    author: {
                        OR: [{ id: 0 }, {}]
                    }
                }]
            }
        })
    })
    
    it('applies select method on array', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'Post', 'id', {
            authorId: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            include: {
                posts: true
            }
        }, 'User')
        expect(args).toEqual({
            include: {
                posts: false
            }
        })
    })

    it('applies select method on array and exposes permitted fields on specific query', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'Post', 'id', {
            authorId: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            include: {
                posts: {
                    // this equals rule and therefore id is a visible field
                    where: { authorId: 0 }
                }
            }
        }, 'User')
        expect(args).toEqual({
            include: {
                posts: {
                    where: {
                        authorId: 0,
                        AND: [{ OR: [{ authorId: 0 }] }]
                    },
                    select: {
                        id: true
                    }
                }
            }
        })
    })
})
