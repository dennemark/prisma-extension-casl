import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'
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
export const applyIncludeSelectQuery = (
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    model: string,
) => {
    ;["include", "select"].forEach((method) => {
        if (args && args[method]) {
            for (const relation in args[method]) {
                if (model in relationFieldsByModel && relation in relationFieldsByModel[model]) {
                    const relationField = relationFieldsByModel[model][relation]
                    if (relationField) {
                        if (relationField.isList) {
                            const methodQuery = applyWhereQuery(abilities, args[method][relation], 'read', relationField.type)
                            // if select function is empty, we do not query the relation
                            args[method][relation] = methodQuery.select && Object.keys(methodQuery.select).length === 0 ? false : methodQuery
                        } else {
                            args = applyWhereQuery(abilities, args, 'read', relationField.type, relation)
                        }

                        args[method][relation] = applyIncludeSelectQuery(abilities, args[method][relation], relationField.type)
                    }
                }
            }
        }
    })

    return args

}