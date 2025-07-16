import { AbilityTuple, PureAbility, Subject, subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { PrismaQuery } from '@casl/prisma'
import { Prisma } from '@prisma/client'
import type { DMMF } from '@prisma/generator-helper'

type DefaultCaslAction = "create" | "read" | "update" | "delete"

export type PrismaExtensionCaslOptions<T extends typeof Prisma = typeof Prisma> = {
    /**
     * will add a field on each returned prisma result that stores allowed actions on result (not nested) 
     * so instead of { id: 0 } it would return { id: 0, [permissionField]: ['create', 'read', 'update', 'delete'] } 
     * 
     * to return other actions, please use addPermissionActions
     */
    permissionField?: string
    /** 
     * adds additional permission actions to ['create', 'read', 'update', 'delete']
     * that should be returned if permissionField is used.
     */
    addPermissionActions?: string[]
    /** uses transaction to allow using client queries before actual query, if fails, whole query will be rolled back */
    beforeQuery?: (tx: Prisma.TransactionClient) => Promise<void>,
    /** uses transaction to allow using client queries after actual query, if fails, whole query will be rolled back */
    afterQuery?: (tx: Prisma.TransactionClient) => Promise<void>,
    /** max wait for batch transaction - default 30000 */
    txMaxWait?: number
    /** timeout for batch transaction - default 30000 */
    txTimeout?: number
    prismaInstance?: T
}

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
    'updateManyAndReturn' |
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
    createMany: { action: 'create', dataQuery: true, whereQuery: false, includeSelectQuery: true },
    createManyAndReturn: { action: 'create', dataQuery: true, whereQuery: false, includeSelectQuery: true },
    upsert: { action: 'create', dataQuery: true, whereQuery: true, includeSelectQuery: true },
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
    updateManyAndReturn: { action: 'update', dataQuery: true, whereQuery: true, includeSelectQuery: false },
    delete: { action: 'delete', dataQuery: false, whereQuery: true, includeSelectQuery: true },
    deleteMany: { action: 'delete', dataQuery: false, whereQuery: true, includeSelectQuery: false },
} as const

export const caslNestedOperationDict: Record<string, 'create' | 'update' | 'read' | 'delete'> = {
    upsert: 'create',
    connect: 'update',
    connectOrCreate: 'create',
    create: 'create',
    createMany: 'create',
    update: 'update',
    updateMany: 'update',
    delete: 'delete',
    deleteMany: 'delete',
    disconnect: 'update',
    set: 'update'
}

export const relationFieldsByModel = (prismaInstance: typeof Prisma) => Object.fromEntries(prismaInstance.dmmf.datamodel.models.map((model: DMMF.Model) => {
    const relationFields = Object.fromEntries(model.fields
        .filter((field) => field && field.kind === 'object' && field.relationName)
        .map((field) => ([field.name, field])))
    return [model.name, relationFields]
}))

export const propertyFieldsByModel = (prismaInstance: typeof Prisma) => Object.fromEntries(prismaInstance.dmmf.datamodel.models.map((model: DMMF.Model) => {
    const propertyFields = Object.fromEntries(model.fields
        .filter((field) => !(field && field.kind === 'object' && field.relationName))
        .map((field) => {
            const relation = Object.values(relationFieldsByModel(prismaInstance)[model.name]).find((value: any) => value.relationFromFields.includes(field.name))
            return [field.name, relation?.name]
        }))
    return [model.name, propertyFields]
}))

export function pick<T extends Record<string, K>, K extends keyof T>(obj: T | undefined, keys: K[]) {
    return keys.reduce((acc, val) => {
        if (obj && val in obj) {
            (acc[val] = obj[val]);
        }
        return acc;
    }, {} as Pick<T, K>);
}

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
 * @param action 
 * @param model 
 * @param obj 
 * @returns 
 */
export function getPermittedFields<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(
    prismaInstance: T,
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    action: string,
    model: string,
    obj?: any
) {
    const modelFields = Object.keys(propertyFieldsByModel(prismaInstance)[model])
    const permittedFields = permittedFieldsOf(abilities, action, obj ? getSubject<T, M>(prismaInstance, model, obj) : model, {
        fieldsFrom: rule => {
            return rule.fields || modelFields;
        }
    })
    return permittedFields
}

/**
 * helper function to get subject for a model
 * @param model prisma model
 * @param obj 
 * @returns 
 */
export function getSubject<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, model: string, obj: any) {
    const modelFields = Object.keys(propertyFieldsByModel(prismaInstance)[model])
    const subjectFields = [...modelFields, ...Object.keys(relationFieldsByModel(prismaInstance)[model])]
    return subject(model, pick(obj, subjectFields))
}

export function getFluentField(data: any) {
    const dataPath = data?.__internalParams?.dataPath as string[]
    if (dataPath?.length > 0) {
        return dataPath[dataPath.length - 1]
    } else {
        return undefined
    }
}
/**
 * if fluent api is used `client.user.findUnique().post()`
 * we need to get its model
 * https://github.com/prisma/prisma/blob/cebc9c0ceb91ff9c80f0b149f3a7ff112fbb46fd/packages/client/src/runtime/core/model/applyFluent.ts#L20
 * @param startModel query model
 * @param data query args with internalParams - includes a dataPath for fluent api
 * @returns fluent api model
 */
export function getFluentModel<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, startModel: string, data: any) {
    const startRelation = {
        fluentModel: startModel,
        fluentRelationField: undefined as DMMF.Field | undefined,
        fluentRelationModel: undefined as string | undefined
    }
    const dataPath = data?.__internalParams?.dataPath as string[]
    if (dataPath?.length > 0) {
        return dataPath.filter((x) => x !== 'select').reduce((acc, x) => {
            acc.fluentRelationField = relationFieldsByModel(prismaInstance)[acc.fluentModel][x]
            acc.fluentModel = acc.fluentRelationField.type
            acc.fluentRelationModel = x
            return acc
        }, startRelation)
    } else {
        return startRelation
    }
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
