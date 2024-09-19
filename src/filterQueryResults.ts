import { AbilityTuple, PureAbility } from "@casl/ability";
import { PrismaQuery } from "@casl/prisma";
import { Prisma } from "@prisma/client";
import { CreationTree } from "./convertCreationTreeToSelect";
import { getPermittedFields, getSubject, relationFieldsByModel } from "./helpers";

export function filterQueryResults(result: any, mask: any, creationTree: CreationTree | undefined, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: string) {
    if (typeof result === 'number') {
        return result
    }
    const prismaModel = model in relationFieldsByModel ? model as Prisma.ModelName : undefined
    if (!prismaModel) {
        throw new Error(`Model ${model} does not exist on Prisma Client`)
    }

    const filterPermittedFields = (entry: any) => {
        if (!entry) { return null }
        if (creationTree?.action === 'create') {
            try {
                if (!abilities.can('create', getSubject(model, entry))) {
                    throw new Error('')
                }
            } catch (e) {
                throw new Error(`It's not allowed to create on ${model} ` + e)
            }
        }

        const permittedFields = getPermittedFields(abilities, 'read', model, entry)
        let hasKeys = false
        Object.keys(entry).forEach((field) => {
            const relationField = relationFieldsByModel[model][field]
            if (relationField) {
                const nestedCreationTree = creationTree && field in creationTree.children ? creationTree.children[field] : undefined
                const res = filterQueryResults(entry[field], mask?.[field], nestedCreationTree, abilities, relationField.type)
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
    if (Array.isArray(result)) {
        return result.map((entry) => filterPermittedFields(entry)).filter((x) => x)
    } else {
        return filterPermittedFields(result)
    }
}