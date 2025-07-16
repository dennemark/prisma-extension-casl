import { subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { Prisma } from '@prisma/client'
import { getPermittedFields } from '../src/helpers'
import { abilityBuilder } from './abilities'

describe('getPermittedFields', () => {


    it('includes permitted fields', () => {
        const { can, build } = abilityBuilder()
        can('read', 'User', 'email')
        const fields = getPermittedFields(Prisma, build(), 'read', 'User')
        expect(fields).toEqual(['email'])
    })
    it('does not include restricted fields', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User')
        cannot('read', 'User', 'id')
        expect(getPermittedFields(Prisma, build(), 'read', 'User')).toEqual(['email', 'favoriteId'])
    })
    it('does not include restricted fields even if they exist in can', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'])
        cannot('read', 'User', 'id')
        expect(getPermittedFields(Prisma, build(), 'read', 'User')).toEqual(['email'])
    })
    it('does not include restricted fields even if can condition applies', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], { id: 0 })
        cannot('read', 'User', 'id')
        expect(getPermittedFields(Prisma, build(), 'read', 'User', { id: 0 })).toEqual(['email'])
    })
    it('does not include restricted fields even if they exist in can', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', ['email', 'id'], { id: 0 })
        cannot('read', 'User', 'id')
        expect(getPermittedFields(Prisma, build(), 'read', 'User', { id: 0 })).toEqual(['email'])
    })
    it('includes permitted fields if nested relation is valid', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'Post', 'id', {
            thread: {
                is: {
                    creatorId: 0
                }
            }
        })
        //@ts-ignore
        expect(permittedFieldsOf(build(), 'read', subject('Post', { thread: { creatorId: 0 } }), { fieldsFrom: (rule: any) => rule.fields || ['id', 'authorId', 'threadId'] })).toEqual(['id'])
        expect(getPermittedFields(Prisma, build(), 'read', 'Post', { thread: { creatorId: 0 } })).toEqual(['id'])
    })
    it('prefers cannot conditions over can conditions ', () => {
        const { can, cannot, build } = abilityBuilder()
        can('read', 'User', 'email')
        can('read', 'User', ['email', 'id'], { id: 0 })
        cannot('read', 'User', 'id', { email: '0' })
        expect(getPermittedFields(Prisma, build(), 'read', 'User', { id: 0, email: '0' })).toEqual(['email'])
        expect(getPermittedFields(Prisma, build(), 'read', 'User', { id: 0, email: '1' })).toEqual(['email', 'id'])
        expect(getPermittedFields(Prisma, build(), 'read', 'User', { id: 1, email: '0' })).toEqual(['email'])
    })
})