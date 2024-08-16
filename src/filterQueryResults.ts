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
                entry[field] = filterQueryResults(entry[field], mask?.[field], nestedCreationTree, abilities, relationField.type)
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

        return hasKeys ? entry : null
    }
    if (Array.isArray(result)) {
        const arr = result.map((entry) => filterPermittedFields(entry)).filter((x) => x)
        return arr.length > 0 ? arr : null
    } else {
        return filterPermittedFields(result)
    }
}