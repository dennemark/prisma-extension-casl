import { Prisma } from '@prisma/client'
import { accessibleBy } from "@casl/prisma"
import { caslOperationDict, PrismaCaslOperation } from "./helpers"
import { applyDataQuery } from "./applyDataQuery"
import { applyWhereQuery } from "./applyWhereQuery"
import { applyIncludeSelectQuery } from "./applyIncludeSelectQuery"
import { AbilityTuple, PureAbility } from '@casl/ability'
import { PrismaQuery } from '@casl/prisma'

/**
 * Applies CASL authorization logic to prisma query
 * 
 * @param operation Prisma Operation `findUnique` etc
 * @param args Prisma query
 * @param abilities Casl prisma abilities
 * @param model Prisma model
 * @returns Enriched query with casl authorization
 */
export function applyCaslToQuery(operation: any, args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: Prisma.ModelName) {
    const operationAbility = caslOperationDict[operation as PrismaCaslOperation]
    if (args.caslAction) {
        operationAbility.action = args.caslAction
    }

    accessibleBy(abilities, operationAbility.action)[model]
    
    if(operationAbility.dataQuery && args.data) {
        args.data = applyDataQuery(abilities, args.data, operationAbility.action, model)
    }


    if (operationAbility.whereQuery) {
        args = applyWhereQuery(abilities, args, operationAbility.action, model)
    }

    if (operationAbility.includeSelectQuery) {
        args = applyIncludeSelectQuery(abilities, args, model)
    }
    return args
}