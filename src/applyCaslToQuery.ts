import { AbilityTuple, PureAbility } from '@casl/ability'
import { accessibleBy, PrismaQuery } from '@casl/prisma'
import type { Prisma } from '@prisma/client'
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
export function applyCaslToQuery<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, operation: PrismaCaslOperation, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: M, queryAllRuleRelations?: boolean) {
    const operationAbility = caslOperationDict[operation]

    accessibleBy(abilities, operationAbility.action)[model]

    let creationTree = undefined
    if (operationAbility.dataQuery && args.data) {
        if (operationAbility.whereQuery && !args.where) {
            args.where = {}
        }
        const { args: dataArgs, creationTree: dataCreationTree } = applyDataQuery<T, M>(prismaInstance, abilities, args, operation, operationAbility.action, model)
        creationTree = dataCreationTree
        args = dataArgs
        if (operation === 'updateMany' || operation === 'updateManyAndReturn') {
            args = transformDataToWhereQuery<T, M>(prismaInstance, args, model)
        }
    } else if (operationAbility.whereQuery) {
        args = applyWhereQuery<T, M>(prismaInstance, abilities, args, operationAbility.action, model)
    }


    if (operationAbility.includeSelectQuery) {
        args = applyIncludeSelectQuery<T, M>(prismaInstance, abilities, args, model)
        if (!operationAbility.whereQuery && args.where) {
            delete args.where
        }
    } else {
        delete args.include
        delete args.select
    }

    const result = operationAbility.includeSelectQuery
        ? applyRuleRelationsQuery<T, M>(prismaInstance, args, abilities, queryAllRuleRelations ? 'all' : operationAbility.action, model, creationTree)
        : { args, mask: undefined, creationTree }

    return result
}