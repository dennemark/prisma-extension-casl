import { AbilityTuple, PureAbility } from "@casl/ability";
import { PrismaQuery } from "@casl/prisma";
import { Prisma } from "@prisma/client";
import { getPermittedFields, relationFieldsByModel } from "./helpers";

export function filterQueryResults(result: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: string) {
    const prismaModel = model in relationFieldsByModel ? model as Prisma.ModelName : undefined
    if (!prismaModel) {
        throw new Error(`Model ${model} does not exist on Prisma Client`)
    }

    const filterPermittedFields = (entry: any) => {
        if (!entry) { return null }
        const permittedFields = getPermittedFields(abilities, 'read', model, entry)
        console.log(model, entry, permittedFields)
        let hasKeys = false
        Object.keys(entry).forEach((field) => {
            const relationField = relationFieldsByModel[model][field]
            if (!permittedFields.includes(field) && !relationField) {
                delete entry[field]
            } else if (relationField) {
                hasKeys = true
                entry[field] = filterQueryResults(entry[field], abilities, relationField.type)
            } else {
                hasKeys = true
            }
        })

        return hasKeys ? entry : null
    }
    // console.log(model, JSON.stringify(Array.isArray(result) ? result.map((entry)=>filterPermittedFields(entry)) : filterPermittedFields(result)))
    return Array.isArray(result) ? result.map((entry) => filterPermittedFields(entry)).filter((x) => x) : filterPermittedFields(result)
}