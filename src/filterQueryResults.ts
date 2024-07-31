import { AbilityTuple, PureAbility } from "@casl/ability";
import { accessibleBy, PrismaQuery } from "@casl/prisma";
import { Prisma } from "@prisma/client";
import { getPermittedFields, relationFieldsByModel } from "./helpers";

export function filterQueryResults(result: any, mask: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: string) {
    const prismaModel = model in relationFieldsByModel ? model as Prisma.ModelName : undefined
    if (!prismaModel) {
        throw new Error(`Model ${model} does not exist on Prisma Client`)
    }

    const filterPermittedFields = (entry: any) => {
        if (!entry) { return null }
        const permittedFields = getPermittedFields(abilities, 'read', model, entry)
        let hasKeys = false
        Object.keys(entry).forEach((field) => {
            const relationField = relationFieldsByModel[model][field]

            if ((!permittedFields.includes(field) && !relationField) || mask?.[field] === true) {
                delete entry[field]
            } else if (relationField) {
                hasKeys = true
                entry[field] = filterQueryResults(entry[field], mask?.[field], abilities, relationField.type)
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