import { AbilityTuple, PureAbility } from '@casl/ability'
import { accessibleBy, PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import { applyDataQuery } from "./applyDataQuery"
import { applyIncludeSelectQuery } from "./applyIncludeSelectQuery"
import { applyRuleRelationsQuery } from './applyRuleRelationsQuery'
import { applyWhereQuery } from "./applyWhereQuery"
import { caslOperationDict, PrismaCaslOperation } from "./helpers"

/**
 * Applies CASL authorization logic to prisma query
 * 
 * @param operation Prisma Operation `findUnique` etc
 * @param args Prisma query
 * @param abilities Casl prisma abilities
 * @param model Prisma model
 * @returns Enriched query with casl authorization
 */
export function applyCaslToQuery(operation: PrismaCaslOperation, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: Prisma.ModelName) {
    const operationAbility = caslOperationDict[operation]

    accessibleBy(abilities, operationAbility.action)[model]

    if (operationAbility.dataQuery && args.data) {
        args.data = applyDataQuery(abilities, args.data, operationAbility.action, model)
    }


    if (operationAbility.whereQuery) {
        args = applyWhereQuery(abilities, args, operationAbility.action, model)
    }


    if (operationAbility.includeSelectQuery) {
        args = applyIncludeSelectQuery(abilities, args, model)
    } else {
        delete args.include
        delete args.select
    }

    const result = operationAbility.includeSelectQuery
        ? applyRuleRelationsQuery(args, abilities, operationAbility.action, model)
        : { args, mask: undefined }

    return result
}