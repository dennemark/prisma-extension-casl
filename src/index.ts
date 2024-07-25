import { Prisma } from '@prisma/client'
import { AbilityTuple, PureAbility } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { accessibleBy, PrismaQuery } from '@casl/prisma'

const relationFieldsByModel = Object.fromEntries(Prisma.dmmf.datamodel.models.map((model: Prisma.DMMF.Model) => {
    const relationFields = Object.fromEntries(model.fields
        .filter((field) => field && field.kind === 'object' && field.relationName)
        .map((field) => ([field.name, field])))
    return [model.name, relationFields]
}))
const propertyFieldsByModel = Object.fromEntries(Prisma.dmmf.datamodel.models.map((model: Prisma.DMMF.Model) => {
    const propertyFields = Object.fromEntries(model.fields
        .filter((field) => !(field && field.kind === 'object' && field.relationName))
        .map((field) => {
            const relation = Object.values(relationFieldsByModel[model.name]).find((value: any)=>value.relationFromFields.includes(field.name))
            return [field.name, relation?.name]
        }))
    return [model.name, propertyFields]
}))

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

const caslNestedOperationDict: Record<string, 'create' | 'update' | 'read' | 'delete'> = {
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

export const useCaslAbilities = (abilities: PureAbility<AbilityTuple, PrismaQuery>) =>
    Prisma.defineExtension({
        name: "prisma-extension-casl",
        query: {
            $allModels: {
                create ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                createMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                createManyAndReturn ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                upsert ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findFirst ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findFirstOrThrow ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findUnique ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                findUniqueOrThrow ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                aggregate ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                count ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                groupBy ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                update ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                updateMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                delete ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                deleteMany ({ args, query, model, operation }){
                    return query(applyCaslToQuery(operation, args, abilities, model))
                },
                // async $allOperations<T>({ args, query, model, operation }: { args: any, query: any, model: any, operation: any }) {

                //     if (!(operation in caslOperationDict)) {
                //         return query(args)
                //     }

                //     args = applyCaslToQuery(operation, args, abilities, model)

                //     return query(args)
                // },
            },
        }
    })

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


export function applyDataQuery(
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    action: string,
    model: string
) {
    const permittedFields = getPermittedFields(abilities, args, action, model)
    
    const accessibleQuery = accessibleBy(abilities, action)[model as Prisma.ModelName]
    
    const mutationArgs: any[] = []
    ;(Array.isArray(args) ? args : [args]).map((argsEntry)=>{
        let hasWhereQuery = false
        // opt 1.:  we either have mutations within data/create/update
        // order is important for where query
        ;['update', 'create', 'data'].forEach((nestedAction)=>{
            if(nestedAction in argsEntry){
                const nestedArgs = argsEntry[nestedAction]
                Array.isArray(nestedArgs) ? mutationArgs.push(...nestedArgs) : mutationArgs.push(nestedArgs)
                // if the mutation are not within args, we might also have a where query that needs to consider abilities
                if(!hasWhereQuery && 'where' in argsEntry){
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
        // opt 2.: or the args themselves are the mutation
        if(mutationArgs.length === 0){
            mutationArgs.push(args)
        }

    })
    
    /** now we go trough all mutation args and throw error if they have not permitted fields or continue in nested mutations */
    mutationArgs.map((mutation: any)=>{
        
        // get all mutation arg fields and if they are short code connect (userId instead of user: { connect: id }), we convert it
        const queriedFields = (mutation ? Object.keys(mutation) : []).map((field)=>{
            const relationModelId = propertyFieldsByModel[model][field]
            if(relationModelId){
                mutation[relationModelId] = { connect: {id: mutation[field]} } 
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
            }else if(relationModel){
                    // if additional relations are found, we apply data query on them, too
                    Object.entries(mutation[field]).forEach(([nestedAction, nestedArgs])=>{
                        if(nestedAction in caslNestedOperationDict){
                            const mutationAction = caslNestedOperationDict[nestedAction]
                            const isConnection = nestedAction === 'connect' || nestedAction === 'disconnect'

                            mutation[field][nestedAction] = applyDataQuery(abilities, nestedArgs, mutationAction, relationModel.type)
                            // connection works like a where query, so we apply it
                            if(isConnection){
                                const accessibleQuery = accessibleBy(abilities, mutationAction)[relationModel.type as Prisma.ModelName]
                                
                                if(Array.isArray(mutation[field][nestedAction])){
                                    mutation[field][nestedAction] = mutation[field][nestedAction].map((q)=>applyAccessibleQuery(q, accessibleQuery))
                                }else{
                                    mutation[field][nestedAction] = applyAccessibleQuery(mutation[field][nestedAction], accessibleQuery)
                                }
                            }
                        }else{
                            throw new Error(`Unknown nested action ${nestedAction} on ${model}`)
                        }
                    })
                }
            })
            
        })
        return args
}
    

export function applyWhereQuery(
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    action: string,
    model: string,
    relation?: string
) {
    const prismaModel = model in relationFieldsByModel ? model as Prisma.ModelName : undefined
    if (!prismaModel) {
        throw new Error(`Model ${model} does not exist on Prisma Client`)
    }

    const accessibleQuery = accessibleBy(abilities, action)[prismaModel]

    if (Object.keys(accessibleQuery).length > 0) {
        if (args === true) {
            args = {}
        }

        if (!args.where) {
            args.where = {}
        }

        // Add the accessibleBy conditions to the where clause
        args.where = applyAccessibleQuery(args.where, relation && accessibleQuery ? { [relation]: accessibleQuery } : accessibleQuery)
    }

    if (relation) {
        // if we add a where clause to a relation
        // we fake the where query, since it is otherwise buried in AND: [ OR: ...]
        // to get the select query
        const method = args.include ? "include" : "select"


        const selectQuery = applySelectPermittedFields(abilities, {
            ...args[method][relation],
            where: {
                ...(args[method][relation].where ?? {}),
                ...accessibleQuery
            },
        }, model)
        const result = {
            ...args,
            [method]: {
                ...args[method],
                [relation]: {
                    ...args[method][relation],
                    select: selectQuery.select
                }
            }
        }

        return result
    } else {
        return applySelectPermittedFields(abilities, args, model)
    }
}

export const applySelectPermittedFields = (abilities: PureAbility<AbilityTuple, PrismaQuery>, args: any, model: string) => {
    
    const permittedFields = getPermittedFields(abilities, args, 'read', model)
    if (permittedFields) {
        // prepare select statement and transform include to select if necessary
        if (args === true) {
            args = {
                select: {}
            }
        }
        if (args.include) {
            args.select = { ...args.include }
            delete args.include
        }
        if (!args.select) {
            args.select = {}
        }
        const queriedFields = args.select ? Object.keys(args.select) : []
        // remove all fields that are not a relation or not permitted
        const remainingFields = queriedFields.filter((field) => {
            const isRelation = relationFieldsByModel[model][field] ? true : false
            if (!(permittedFields.includes(field)) && !isRelation) {
                delete args.select[field]
                return false
            } else if (isRelation) {
                return false
            }
            return true
        })
        // if not fields are left, we use a default query of all permitted fields of the model
        if (remainingFields.length === 0) {
            permittedFields.forEach((field) => {
                args.select = {
                    ...args.select,
                    [field]: true
                }
            })
        }
    }
    return args
}


// Recursively apply accessibleBy to nested relations
export const applyIncludeSelectQuery = (
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    model: string,
) => {
    ;["include", "select"].forEach((method) => {
        if (args && args[method]) {
            for (const relation in args[method]) {
                if (model in relationFieldsByModel && relation in relationFieldsByModel[model]) {
                    const relationField = relationFieldsByModel[model][relation]
                    if (relationField) {
                        if (relationField.isList) {
                            const methodQuery = applyWhereQuery(abilities, args[method][relation], 'read', relationField.type)
                            // if select function is empty, we do not query the relation
                            args[method][relation] = methodQuery.select && Object.keys(methodQuery.select).length === 0 ? false : methodQuery
                        } else {
                            args = applyWhereQuery(abilities, args, 'read', relationField.type, relation)
                        }

                        args[method][relation] = applyIncludeSelectQuery(abilities, args[method][relation], relationField.type)
                    }
                }
            }
        }
    })
    return args

}


function getPermittedFields(
    abilities: PureAbility<AbilityTuple, PrismaQuery>,
    args: any,
    action: string,
    model: string
){
    let hasPermittedFields = false
    const omittedFieldsSet = new Set()
    const permittedFields = permittedFieldsOf(abilities, action, model, {
        fieldsFrom: rule => {
            if (rule.fields) {
                if(rule.inverted){
                    rule.fields.forEach((field)=>omittedFieldsSet.add(field))
                }
                else{
                    hasPermittedFields = true
                }
                if (rule.conditions) {
                    if (isSubset(rule.conditions, args.where)) {
                        return rule.fields
                    } else {
                        // console.warn(`${model} fields ${JSON.stringify(rule.fields)} can only be read with following conditions: ${JSON.stringify(rule.conditions)}`)
                    }
                } else {
                    return rule.fields
                }
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
    return hasPermittedFields ? permittedFields : undefined
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
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

function applyAccessibleQuery(clause: any, accessibleQuery: any){
   return {
        ...clause,
        AND: [
            ...(clause.AND ?? []),
            accessibleQuery
        ]

    }
}