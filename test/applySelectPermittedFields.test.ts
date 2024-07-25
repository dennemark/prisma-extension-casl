
import { abilityBuilder } from './abilities'
import { applySelectPermittedFields, } from '../dist'



describe('apply select to permitted fields', () => {
    it('adds select if args are true', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), true, 'User')
        expect(args.select).toEqual({ email: true })
    })
    it('adds select query if missing ', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), {}, 'User')
        expect(args.select).toEqual({ email: true })
    })
    it('removes unwanted fields', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), { select: { x: 0 } }, 'User')
        expect(args.select).toEqual({ email: true })
    })
    it('converts include to select ', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), { include: { x: 0 } }, 'User')
        expect(args.select).toEqual({ email: true })
    })
    it('allows more permitted fields, if query matches', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), { where: { id: 0 } }, 'User')
        expect(args.select).toEqual({ email: true, id: true })
    })
    it('allows permitted fields if cannot rule does not apply', () => {
        const { can, cannot, build } = abilityBuilder()
        cannot('read', 'User', ['email'], {
            id: 0
        })
        can('read', 'User', ['email'], {
            id: 1
        })
        const args = applySelectPermittedFields(build(), { where: { id: 0 } }, 'User')
        expect(args).toEqual({ select: {}, where: { id: 0 } })
        const args2 = applySelectPermittedFields(build(), { where: { id: 1 } }, 'User')
        expect(args2).toEqual({ where: { id: 1 }, select: { email: true } })
    })
})