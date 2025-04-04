
import { applyIncludeSelectQuery } from '../src/applyIncludeSelectQuery'
import { abilityBuilder } from './abilities'

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
                author: true
            }
        })
    })
    it('applies select method', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', {
            id: 1
        })
        // this has to be filtered after query.
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
                author: true
            }
        })
    })
    it('applies select method for non-required relation', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'Thread', {
            id: 1
        })
        const args = applyIncludeSelectQuery(build(), {
            select: {
                thread: true
            }
        }, 'Post')
        expect(args).toEqual({
            select: {
                thread: true
            }
        })
    })
    it('applies select method and does not allow reading of field', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User')
        cannot('read', 'User', 'email', {
            id: 0
        })
        const args = applyIncludeSelectQuery(build(), {
            where: {
                author: {
                    id: 0
                }
            },
            select: {
                author: true
            }
        }, 'Post')
        expect(args).toEqual({
            select: {
                author: true
            },
            where: {
                author: {
                    id: 0
                }
            }
        })
    })
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
                posts: {
                    where: {
                        AND: [{ OR: [{ authorId: 0 }] }]
                    }
                }
            }
        })
    })
    it('applies select method on array even if null', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'Post', 'id', {
            threadId: null
        })
        const args = applyIncludeSelectQuery(build(), {
            select: {
                posts: true
            }
        }, 'User')
        expect(args).toEqual({
            select: {
                posts: {
                    where: {
                        AND: [{ OR: [{ threadId: null }] }]
                    }
                }
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
                author: true
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
                posts: {
                    where: {
                        AND: [{ OR: [{ authorId: 0 }] }]
                    }
                }
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
                    }
                }
            }
        })
    })
})
