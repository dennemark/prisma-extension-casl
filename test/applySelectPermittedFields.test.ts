
import { abilityBuilder } from './abilities'
import { applySelectPermittedFields } from '../src/applySelectPermittedFields'



describe('apply select to permitted fields', () => {
    it('adds all permitted fields to select if args are true', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), true, 'User')
        expect(args.select).toEqual({ email: true, id: true })
    })
    it('adds all permitted fields to select if query if missing ', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), {}, 'User')
        expect(args.select).toEqual({ email: true, id: true })
    })
    
    it('converts include to select ', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        can('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), { include: { x: 0 } }, 'User')
        expect(args.select).toEqual({ email: true, id: true })
    })
    it('does not add restricted fields to select query', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], {
            id: 0
        })
        cannot('read', 'User', ['email'])
        const args = applySelectPermittedFields(build(), { }, 'User')
        expect(args.select).toEqual({ id: true })
    })
    it('does not consider restricted fields when condition applies', () => {
        // conditional fields need to be filtered after query
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email'], {
            id: 0
        })
        cannot('read', 'User', ['email'], {
            id: 1
        })
        const args = applySelectPermittedFields(build(), { }, 'User')
        expect(args.select).toEqual({ email: true})
    })

})