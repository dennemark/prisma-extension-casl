import { AbilityTuple, PureAbility } from '@casl/ability'
import { accessibleBy, PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import { applyAccessibleQuery } from './applyAccessibleQuery'
import { CreationTree } from './convertCreationTreeToSelect'
import { caslNestedOperationDict, getPermittedFields, propertyFieldsByModel, relationFieldsByModel } from './helpers'

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
    action: string,
    model: string,
    creationTree: CreationTree = { type: 'create', children: {} }
) {
    creationTree.type = action
    const permittedFields = getPermittedFields(abilities, action, model)

    const accessibleQuery = accessibleBy(abilities, action)[model as Prisma.ModelName]
    const mutationArgs: any[] = []
        ; (Array.isArray(args) ? args : [args]).map((argsEntry) => {
            let hasWhereQuery = false
                // opt 1.:  we either have mutations within data/create/update
                // order is important for where query
                ;['update', 'create', 'data'].forEach((nestedAction) => {
                    if (nestedAction in argsEntry) {
                        const nestedArgs = argsEntry[nestedAction]
                        Array.isArray(nestedArgs) ? mutationArgs.push(...nestedArgs) : mutationArgs.push(nestedArgs)
                        // if the mutation are not within args, we might also have a where query that needs to consider abilities
                        if (!hasWhereQuery && 'where' in argsEntry) {
                            hasWhereQuery = true
                            // if nestedAction is update, we probably have upsert
                            // if nestedAction is create, we probably have connectOrCreate
                            // therefore we check for 'update' accessibleQuery
                            argsEntry.where = applyAccessibleQuery(argsEntry.where,
                                nestedAction !== 'update' && nestedAction !== 'create' ? accessibleQuery : accessibleBy(abilities, 'update')[model as Prisma.ModelName]
                            )
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
        const queriedFields = (mutation ? Object.keys(mutation) : []).map((field) => {
            const relationModelId = propertyFieldsByModel[model][field]
            if (relationModelId) {
                mutation[relationModelId] = { connect: { id: mutation[field] } }
                delete mutation[field]
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
            } else if (relationModel) {
                // if additional relations are found, we apply data query on them, too
                Object.entries(mutation[field]).forEach(([nestedAction, nestedArgs]) => {
                    if (nestedAction in caslNestedOperationDict) {
                        const mutationAction = caslNestedOperationDict[nestedAction]
                        const isConnection = nestedAction === 'connect' || nestedAction === 'disconnect'

                        creationTree.children[field] = { type: mutationAction, children: {} }
                        const dataQuery = applyDataQuery(abilities, nestedArgs, mutationAction, relationModel.type, creationTree.children[field])
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
                    } else {
                        throw new Error(`Unknown nested action ${nestedAction} on ${model}`)
                    }
                })
            }
        })

    })
    return { args, creationTree }
}
