import { AbilityTuple, PureAbility } from '@casl/ability'
import { accessibleBy, PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import { applyDataQuery } from "./applyDataQuery"
import { applyIncludeSelectQuery } from "./applyIncludeSelectQuery"
import { applyRuleRelationsQuery } from './applyRuleRelationsQuery'
import { applyWhereQuery } from "./applyWhereQuery"
import { caslOperationDict, PrismaCaslOperation } from "./helpers"
import { transformDataToWhereQuery } from "./transformDataToWhereQuery"

/**
 * Applies CASL authorization logic to prisma query
 * 
 * @param operation Prisma Operation `findUnique` etc
 * @param args Prisma query
 * @param abilities Casl prisma abilities
 * @param model Prisma model
 * @returns Enriched query with casl authorization
 */
export function applyCaslToQuery(operation: PrismaCaslOperation, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: Prisma.ModelName, queryAllRuleRelations?: boolean) {
    const operationAbility = caslOperationDict[operation]

    accessibleBy(abilities, operationAbility.action)[model]

    let creationTree = undefined
    if (operationAbility.dataQuery && args.data) {
        if (operationAbility.whereQuery && !args.where) {
            args.where = {}
        }
        const { args: dataArgs, creationTree: dataCreationTree } = applyDataQuery(abilities, args, operation, operationAbility.action, model)
        creationTree = dataCreationTree
        args = dataArgs
        if (operation === 'updateMany' || operation === 'updateManyAndReturn') {
            args = transformDataToWhereQuery(args, model)
        }
    } else if (operationAbility.whereQuery) {
        args = applyWhereQuery(abilities, args, operationAbility.action, model)
    }


    if (operationAbility.includeSelectQuery) {
        args = applyIncludeSelectQuery(abilities, args, model)
        if (!operationAbility.whereQuery && args.where) {
            delete args.where
        }
    } else {
        delete args.include
        delete args.select
    }

    const result = operationAbility.includeSelectQuery
        ? applyRuleRelationsQuery(args, abilities, queryAllRuleRelations ? 'all' : operationAbility.action, model, creationTree)
        : { args, mask: undefined, creationTree }

    return result
}