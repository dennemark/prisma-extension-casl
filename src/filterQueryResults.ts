import { AbilityTuple, PureAbility } from "@casl/ability";
import { PrismaQuery } from "@casl/prisma";
import { Prisma } from "@prisma/client";
import { CreationTree } from "./convertCreationTreeToSelect";
import { caslOperationDict, getPermittedFields, getSubject, isSubset, PrismaCaslOperation, PrismaExtensionCaslOptions, relationFieldsByModel } from "./helpers";
import { storePermissions } from "./storePermissions";

export function filterQueryResults(result: any, mask: any, creationTree: CreationTree | undefined, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: string, operation: PrismaCaslOperation, opts?: PrismaExtensionCaslOptions) {
    if (typeof result === 'number') {
        return result
    }
    const prismaModel = model in relationFieldsByModel ? model as Prisma.ModelName : undefined
    if (!prismaModel) {
        throw new Error(`Model ${model} does not exist on Prisma Client`)
    }
    const operationFields = caslOperationDict[operation].operationFields

    const filterPermittedFields = (entry: any) => {
        if (!entry) { return null }
        /** if we have created a model, we check if it is allowed and otherwise throw an error */
        if (creationTree?.action === 'create') {
            try {
                if (creationTree.mutation?.length) {
                    creationTree.mutation.forEach(({ where }) => {
                        if (isSubset(where, entry)) {
                            if (!abilities.can('create', getSubject(model, entry))) {
                                throw new Error('')
                            }
                        }
                    })
                } else {
                    if (!abilities.can('create', getSubject(model, entry))) {
                        throw new Error('')
                    }
                }
            } catch (e) {
                throw new Error(`It's not allowed to create on ${model} ` + e)
            }
        }

        /** 
         * if we have updated a model, we have to check, the current entry
         * has been updated by seeing if it overlaps with the where query
         * and if it does, we check if all fields were allowed to be updated
         * otherwise we throw an error 
         * */
        if (creationTree?.action === 'update' && creationTree.mutation.length > 0) {
            creationTree.mutation.forEach(({ fields, where }) => {
                if (isSubset(where, entry)) {
                    fields.forEach((field) => {
                        try {
                            if (!abilities.can('update', getSubject(model, entry), field)) {
                                throw new Error(field)
                            }
                        } catch (e) {
                            throw new Error(`It's not allowed to update ${field} on ${model} ` + e)
                        }
                    })
                }
            })
        }

        const permittedFields = getPermittedFields(abilities, 'read', model, entry)

        let hasKeys = false
        Object.keys(entry).filter((field) => {
            if (operationFields?.includes(field)) {
                hasKeys = true
                return false
            } else {
                return field !== opts?.permissionField
            }
        }).forEach((field) => {
            const relationField = relationFieldsByModel[model][field]
            if (relationField) {
                const nestedCreationTree = creationTree && field in creationTree.children ? creationTree.children[field] : undefined
                const res = filterQueryResults(entry[field], mask?.[field], nestedCreationTree, abilities, relationField.type, operation)
                entry[field] = Array.isArray(res) ? res.length > 0 ? res : null : res
            }
            if ((!permittedFields.includes(field) && !relationField) || mask?.[field] === true) {
                delete entry[field]
            } else if (relationField) {
                hasKeys = true
                if (entry[field] === null) {
                    delete entry[field]
                }
            } else {
                hasKeys = true
            }
        })

        return hasKeys && Object.keys(entry).length > 0 ? entry : null
    }
    const permissionResult = storePermissions(result, abilities, model, opts)
    if (Array.isArray(permissionResult)) {
        return permissionResult.map((entry) => filterPermittedFields(entry)).filter((x) => x)
    } else {
        return filterPermittedFields(permissionResult)
    }
}