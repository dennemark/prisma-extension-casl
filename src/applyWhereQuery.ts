
import { AbilityTuple, PureAbility } from '@casl/ability'
import { accessibleBy, PrismaQuery } from '@casl/prisma'
import type { Prisma } from '@prisma/client'
import { applyAccessibleQuery } from './applyAccessibleQuery'
import { relationFieldsByModel } from './helpers'

/**
 * applies casl authorization conditions to where query for model
 * 
 * if include or select have a relation
 * its where condition needs to be applied to the main where clause, too
 * this is possible, by optionally setting the relation prop
 * with the name of its field in the include / select query
 * 
 * @param abilities Casl prisma abilities
 * @param args query with { where }
 * @param action Casl action - preferably create/read/update/delete
 * @param model prisma model
 * @param relation (optional) relation field
 * @returns enriched query with casl authorization
 */
export function applyWhereQuery<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(
    prismaInstance: T,
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    action: string,
    model: string,
    relation?: string,
    requiredRelation?: boolean
) {
    const relationByModel = relationFieldsByModel(prismaInstance)
    const prismaModel = model in relationByModel ? model as M : undefined
    if (!prismaModel) {
        throw new Error(`Model ${model} does not exist on Prisma Client`)
    }

    const accessibleQuery = accessibleBy(abilities, action)[prismaModel]
    if (accessibleQuery && Object.keys(accessibleQuery).length > 0) {
        if (args === true) {
            args = {}
        }

        if (!args.where) {
            args.where = {}
        }


        const relationQuery = relation && accessibleQuery ? requiredRelation ? { [relation]: accessibleQuery }
            : { OR: [{ [relation]: null }, { [relation]: accessibleQuery }] }
            : accessibleQuery
        // Add the accessibleBy conditions to the where clause
        args.where = applyAccessibleQuery<T, M>(prismaInstance, args.where, relationQuery)
    }

    return args

}