
import { applyWhereQuery } from '../src/applyWhereQuery'
import { abilityBuilder } from './abilities'


describe('apply where query', () => {
    it('adds where query if args are true', () => {
        const { can, cannot, build } = abilityBuilder()
        cannot('read', 'User', {
            id: 0
        })
        can('read', 'User', {
            id: 1
        })
        const args = applyWhereQuery(build(), true, 'read', 'User')
        expect(args).toEqual({ where: { AND: [{ OR: [{ id: 1 }], AND: [{ NOT: { id: 0 } }] }] } })
    })
    it('adds where query if missing', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', {
            id: 0
        })
        const args = applyWhereQuery(build(), {}, 'read', 'User')
        expect(args).toEqual({ where: { AND: [{ OR: [{ id: 0 }] }] } })
    })
    it('does not add where query if there is no condition', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User')
        can('read', 'User', ['email'], {
            id: 0
        })
        const args = applyWhereQuery(build(), {}, 'read', 'User')
        expect(args).toEqual({})
    })
    it('adds to existing where query', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', {
            id: 0
        })
        const args = applyWhereQuery(build(), {
            where: {
                id: 1,
                AND: [{ id: 1 }]
            }
        }, 'read', 'User')
        expect(args).toEqual({ where: { id: 1, AND: [{ id: 1 }, { OR: [{ id: 0 }] }] } })
    })
    it('does not alter where query if there is not condition', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email'])
        can('read', 'Post')
        const args = applyWhereQuery(build(), {
            include: {
                posts: true
            },
            where: {
                id: 1,
                AND: [{ id: 1 }]
            }
        }, 'read', 'User')
        expect(args).toEqual({
            where: {
                id: 1, AND: [{ id: 1 }]
            },
            include: {
                posts: true
            }
        })
    })
})
