
import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import type { Prisma } from '@prisma/client'
import { getPermittedFields, relationFieldsByModel } from './helpers'


/**
 * gets permitted fields for current model
 * and adds select query with only permitted properties
 * and if args has include, it will be converted to select
 * 
 * @param abilities Casl prisma abilities
 * @param args query
 * @param model prisma model
 * @returns enriched query with selection of fields considering casl authorization
 */
export function applySelectPermittedFields<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, abilities: PureAbility<AbilityTuple, PrismaQuery>, args: any, model: string) {

    const permittedFields = getPermittedFields<T, M>(prismaInstance, abilities, 'read', model)
    if (permittedFields) {
        // prepare select statement and transform include to select if necessary
        if (args === true) {
            args = {
                select: {}
            }
        }
        if (args.include) {
            args.select = { ...args.include }
            delete args.include
        }
        if (!args.select) {
            args.select = {}
        }
        const queriedFields = args.select ? Object.keys(args.select) : []
        // remove all fields that are not a relation or not permitted
        const remainingFields = queriedFields.filter((field) => {
            const isRelation = relationFieldsByModel(prismaInstance)[model][field] ? true : false
            if (!(permittedFields.includes(field)) && !isRelation) {
                delete args.select[field]
                return false
            } else if (isRelation) {
                return false
            }
            return true
        })
        // if not fields are left, we use a default query of all permitted fields of the model
        if (remainingFields.length === 0) {
            permittedFields.forEach((field) => {
                args.select = {
                    ...args.select,
                    [field]: true
                }
            })
        }
    }
    return args
}
