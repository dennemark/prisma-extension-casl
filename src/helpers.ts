import { Prisma } from '@prisma/client'
import { DMMF } from '@prisma/generator-helper'
import { AbilityTuple, PureAbility } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { PrismaQuery } from '@casl/prisma'

type DefaultCaslAction = "create" | "read" | "update" | "delete"

export type PrismaCaslOperation =
    'create' |
    'createMany' |
    'createManyAndReturn' |
    'upsert' |
    'findFirst' |
    'findFirstOrThrow' |
    'findMany' |
    'findUnique' |
    'findUniqueOrThrow' |
    'aggregate' |
    'count' |
    'groupBy' |
    'update' |
    'updateMany' |
    'delete' |
    'deleteMany'

export const caslOperationDict: Record<
    PrismaCaslOperation,
    {
        action: DefaultCaslAction
        dataQuery: boolean
        whereQuery: boolean
        includeSelectQuery: boolean
    }
> = {
    create: { action: 'create', dataQuery: true, whereQuery: false, includeSelectQuery: true },
    createMany: { action: 'create', dataQuery: true, whereQuery: false, includeSelectQuery: false },
    createManyAndReturn: { action: 'create', dataQuery: true, whereQuery: false, includeSelectQuery: true },
    upsert: { action: 'create', dataQuery: true, whereQuery: true, includeSelectQuery: false },
    findFirst: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: true },
    findFirstOrThrow: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: true },
    findMany: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: true },
    findUnique: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: true },
    findUniqueOrThrow: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: true },
    aggregate: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: false },
    count: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: false },
    groupBy: { action: 'read', dataQuery: false, whereQuery: true, includeSelectQuery: false },
    update: { action: 'update', dataQuery: true, whereQuery: true, includeSelectQuery: true },
    updateMany: { action: 'update', dataQuery: true, whereQuery: true, includeSelectQuery: false },
    delete: { action: 'delete', dataQuery: false, whereQuery: true, includeSelectQuery: true },
    deleteMany: { action: 'delete', dataQuery: false, whereQuery: true, includeSelectQuery: false },
} as const

export const caslNestedOperationDict: Record<string, 'create' | 'update' | 'read' | 'delete'> = {
    upsert: 'create', 
    connect: 'update', 
    connectOrCreate:'create', 
    create: 'create', 
    createMany: 'create', 
    update: 'update', 
    updateMany: 'update',
    delete: 'delete',
    deleteMany: 'delete',
    disconnect: 'update',
    set: 'update'
}

export const relationFieldsByModel = Object.fromEntries(Prisma.dmmf.datamodel.models.map((model: DMMF.Model) => {
    const relationFields = Object.fromEntries(model.fields
        .filter((field) => field && field.kind === 'object' && field.relationName)
        .map((field) => ([field.name, field])))
    return [model.name, relationFields]
}))

export const propertyFieldsByModel = Object.fromEntries(Prisma.dmmf.datamodel.models.map((model: DMMF.Model) => {
    const propertyFields = Object.fromEntries(model.fields
        .filter((field) => !(field && field.kind === 'object' && field.relationName))
        .map((field) => {
            const relation = Object.values(relationFieldsByModel[model.name]).find((value: any)=>value.relationFromFields.includes(field.name))
            return [field.name, relation?.name]
        }))
    return [model.name, propertyFields]
}))

/**
 * goes through all permitted fields of a model
 * 
 * - if there area only rules with fields, permittedFields are at least empty
 * 
 * - if a rule has fields And conditions, it's fields are only permitted
 * if the query overlaps with the conditions
 * 
 * - if permittedFields are empty, but there is a rule without fields,
 * the result is undefined. allowing us to query for all fields
 * 
 * @param abilities 
 * @param args 
 * @param action 
 * @param model 
 * @returns 
 */
export function getPermittedFields(
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    action: string,
    model: string
){
    let hasPermittedFields = false
    let hasNoRuleWithoutFields: boolean | undefined = undefined
    const omittedFieldsSet = new Set()
    const permittedFields = permittedFieldsOf(abilities, action, model, {
        fieldsFrom: rule => {
            if(hasNoRuleWithoutFields === undefined){
                // make assumption true on first call of fieldsFrom
                hasNoRuleWithoutFields = true
            }
            if (rule.fields) {
                if(rule.inverted){
                    rule.fields.forEach((field)=>omittedFieldsSet.add(field))
                } else {
                    hasPermittedFields = true
                }
                if (rule.conditions) {
                    if (isSubset(rule.conditions, args.where)) {
                        return rule.fields
                    } 
                    // else if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                    //     const queriedFields = args.select ? Object.keys(args.select) : args.include ? Object.keys(args.include) : []

                    //     if(queriedFields.findIndex((field)=> rule.fields?.includes(field)) > -1){
                    //         console.warn(`${model} fields ${JSON.stringify(rule.fields)} can only be read with following conditions: ${JSON.stringify(rule.conditions)}`)
                    //     }
                    // }
                } else {
                    return rule.fields
                }
            }else{
                hasNoRuleWithoutFields = false
            }
            return []
        }
    })
    
    // if can rules allow read access on all properties, but some cannot rules omit fields, we add all permitted properties to select to create an inverted version
    // newer prisma version will allow omit besides select for cleaner interface.
    if(hasPermittedFields === false && permittedFields.length === 0 && omittedFieldsSet.size > 0){
        permittedFields.push(...Object.keys(propertyFieldsByModel[model]).filter((field)=> !omittedFieldsSet.has(field)))
        hasPermittedFields = true
    }
    return hasPermittedFields && permittedFields.length > 0 ? permittedFields : hasNoRuleWithoutFields ? [] : undefined
}


export function isSubset(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (typeof obj1 === "object" && typeof obj2 === "object") {
        if (Array.isArray(obj1) && Array.isArray(obj2)) {
            for (const item1 of obj1) {
                let found = false;
                for (const item2 of obj2) {
                    if (isSubset(item1, item2)) {
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            }
            return true;
        } else {

            for (const key in obj1) {
                if (!(key in obj2) || !isSubset(obj1[key], obj2[key])) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
}
