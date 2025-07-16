import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
import type { Prisma } from '@prisma/client'
import { applyWhereQuery } from './applyWhereQuery'
import { relationFieldsByModel } from './helpers'


/**
 * applies casl authorization to include and select queries
 * for the specified model
 * if queries include relations, this function will be recursed on those models
 * 
 * if necessary, where query will be added
 * 
 * @param abilities Casl prisma abilities
 * @param args query with { include, select} 
 * @param model prisma model
 * @returns enriched query with casl authorization
 */
export function applyIncludeSelectQuery<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(
    prismaInstance: T,
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    model: string,
) {
    const relationByModel = relationFieldsByModel(prismaInstance)

        ;["include", "select"].forEach((method) => {
            if (args && args[method]) {
                for (const relation in args[method]) {
                    if (model in relationByModel && relation in relationByModel[model]) {
                        const relationField = relationByModel[model][relation]
                        if (relationField) {
                            if (relationField.isList) {
                                try {
                                    const methodQuery = applyWhereQuery<T, M>(prismaInstance, abilities, args[method][relation], 'read', relationField.type)
                                    // if select function is empty, we do not query the relation
                                    args[method][relation] = methodQuery.select && Object.keys(methodQuery.select).length === 0 ? false : methodQuery
                                } catch (e) {
                                    args[method][relation] = false
                                }
                            }

                            args[method][relation] = applyIncludeSelectQuery<T, M>(prismaInstance, abilities, args[method][relation], relationField.type)
                        }
                    }
                }
            }
        })

    return args

}