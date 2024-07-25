
import { abilityBuilder } from './abilities'
import { applyWhereQuery } from '../dist'


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
        expect(args.where).toEqual({ AND: [{ OR: [{ id: 1 }], AND: [{ NOT: { id: 0 } }] }] })
    })
    it('adds where query if missing', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', {
            id: 0
        })
        const args = applyWhereQuery(build(), {}, 'read', 'User')
        expect(args.where).toEqual({ AND: [{ OR: [{ id: 0 }] }] })
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
        expect(args.where).toEqual({ id: 1, AND: [{ id: 1 }, { OR: [{ id: 0 }] }] })
    })
    it('adds permitted field to query and turns include into select', () => {
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
            select: {
                email: true,
                posts: true
            }
        })
    })
})
