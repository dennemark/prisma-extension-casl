import { AbilityTuple, PureAbility } from '@casl/ability'
import { accessibleBy, createPrismaAbility, PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import { applyAccessibleQuery } from './applyAccessibleQuery'
import { applyWhereQuery } from './applyWhereQuery'
import { CreationTree } from './convertCreationTreeToSelect'
import { caslNestedOperationDict, getPermittedFields, PrismaCaslOperation, propertyFieldsByModel, relationFieldsByModel } from './helpers'
import './polyfills'

/**
 * checks if mutation query is authorized by CASL
 * and throws error if not
 * 
 * applies casl where queries to the necessary data and where queries
 * 
 * considers if query is array or not
 * and if query is upsert or connectOrCreate 
 * it checks for `update` capabilities instead of create capabilities
 * 
 * @param abilities Casl prisma abilities
 * @param args query with { data/create/update/where }
 * @param action Casl action - preferably create/read/update/delete
 * @param model prisma model
 * @returns enriched query with casl authorization or Error
 */
export function applyDataQuery(
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    operation: PrismaCaslOperation,
    action: string,
    model: string,
    creationTree?: CreationTree
) {
    const tree = creationTree ? creationTree : { action: action, model: model, children: {}, mutation: [] } as CreationTree

    const permittedFields = getPermittedFields(abilities, action, model)

    const mutationArgs: any[] = []
        ; (Array.isArray(args) ? args : [args]).map((argsEntry) => {
            let hasWhereQuery = false
                // opt 1.:  we either have mutations within data/create/update
                // order is important for where query
                ;['update', 'create', 'data'].forEach((nestedAction) => {
                    if (nestedAction in argsEntry) {
                        const nestedArgs = Array.isArray(argsEntry[nestedAction]) ? argsEntry[nestedAction] : [argsEntry[nestedAction]]
                        mutationArgs.push(...nestedArgs)
                        // if the mutation are not within args, we might also have a where query that needs to consider abilities
                        if (!hasWhereQuery && 'where' in argsEntry) {
                            hasWhereQuery = true
                            /** 
                             * for our where query we only want to consider conditions
                             * that match the fields of our mutation args
                             * 
                             * i.e. {field: 'a', anotherField:'b'} should not consider conditions of a rule which is only applied on 'field'
                             */
                            const argFields = new Set(nestedArgs.flatMap((arg) => {
                                return Object.keys(arg).filter((field) => {
                                    return field in propertyFieldsByModel[model]
                                })
                            }))
                            tree.mutation.push({ fields: [...argFields], where: argsEntry.where })
                            const nestedAbilities = createPrismaAbility(abilities.rules.filter((rule) => {
                                if (rule.fields && rule.subject === model) {
                                    if (rule.inverted) {
                                        return argFields.isDisjointFrom(new Set(rule.fields))
                                        // if (!rule.conditions && !hasNoForbiddenFields) {
                                        //     throw new Error(`It's not allowed to "${action}" "${rule.fields.toString()}" on "${model}"`)
                                        // }
                                        // return hasNoForbiddenFields
                                    } else {
                                        return argFields.isSubsetOf(new Set(Array.isArray(rule.fields) ? rule.fields : [rule.fields]))
                                    }
                                } else {
                                    return true
                                }
                            }))
                            // if nestedAction is update, we probably have upsert
                            // if nestedAction is create, we probably have connectOrCreate
                            // therefore we check for 'update' accessibleQuery
                            applyWhereQuery(nestedAbilities, argsEntry, nestedAction !== 'update' && nestedAction !== 'create' ? action : 'update', model)

                        }
                    }
                })
            // opt 2.: or the argsEntry themselves are the mutation
            if (mutationArgs.length === 0) {
                mutationArgs.push(argsEntry)
            }
        })

    /** now we go trough all mutation args and throw error if they have not permitted fields or continue in nested mutations */
    mutationArgs.map((mutation: any) => {

        // get all mutation arg fields and if they are short code connect (userId instead of user: { connect: id }), we convert it
        // except if it is a createMany or updateMany operation
        const queriedFields = (mutation ? Object.keys(mutation) : []).map((field) => {
            const relationModelId = propertyFieldsByModel[model][field]
            if (relationModelId && mutation[field] !== null) {
                const fieldId = relationFieldsByModel[model][relationModelId].relationToFields?.[0]
                if (fieldId && operation !== 'createMany' && operation !== 'createManyAndReturn') {
                    mutation[relationModelId] = { connect: { [fieldId]: mutation[field] } }
                    delete mutation[field]
                }
                return relationModelId
            } else {
                return field
            }
        })

        queriedFields.forEach((field) => {
            const relationModel = relationFieldsByModel[model][field]
            // omit relation models also through i.e. stat
            if (permittedFields?.includes(field) === false && !relationModel) {
                // if fields are not permitted we throw an error and exit
                throw new Error(`It's not allowed to "${action}" "${field}" on "${model}"`)
            } else if (relationModel && mutation[field]) {
                // if additional relations are found, we apply data query on them, too
                Object.entries(mutation[field]).forEach(([nestedAction, nestedArgs]) => {
                    if (nestedAction in caslNestedOperationDict) {
                        const mutationAction = caslNestedOperationDict[nestedAction]
                        const isConnection = nestedAction === 'connect' || nestedAction === 'disconnect'

                        tree.children[field] = { action: mutationAction, model: relationModel.type as Prisma.ModelName, children: {}, mutation: [] }
                        if (nestedAction !== 'disconnect' && nestedArgs !== true) {
                            const dataQuery = applyDataQuery(abilities, nestedArgs, operation, mutationAction, relationModel.type, tree.children[field])
                            mutation[field][nestedAction] = dataQuery.args
                            // connection works like a where query, so we apply it
                            if (isConnection) {
                                const accessibleQuery = accessibleBy(abilities, mutationAction)[relationModel.type as Prisma.ModelName]

                                if (Array.isArray(mutation[field][nestedAction])) {
                                    mutation[field][nestedAction] = mutation[field][nestedAction].map((q) => applyAccessibleQuery(q, accessibleQuery))
                                } else {
                                    mutation[field][nestedAction] = applyAccessibleQuery(mutation[field][nestedAction], accessibleQuery)
                                }
                            }
                        }
                    } else {
                        throw new Error(`Unknown nested action ${nestedAction} on ${model}`)
                    }
                })
            }
        })

    })
    return { args, creationTree: tree }
}
