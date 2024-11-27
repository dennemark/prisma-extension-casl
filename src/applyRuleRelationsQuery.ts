import { AbilityTuple, PureAbility } from '@casl/ability';
import { rulesToAST } from '@casl/ability/extra';
import { createPrismaAbility, PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';
import { convertCreationTreeToSelect, CreationTree } from './convertCreationTreeToSelect';
import { deepMerge } from './deepMerge';
import { getRuleRelationsQuery } from './getRuleRelationsQuery';
import { relationFieldsByModel } from './helpers';



/**
 * takes args query and rule relation query
 * and combines them, while also keeping a mask
 * of the difference, to later on remove all rule relation
 * results from query result
 * 
 * @param args query with { include, select }
 * @param relationQuery query result of getRuleRelationsQuery
 * @returns `{ args: mergedQuery, mask: differenc of both queries }`
 */
function mergeArgsAndRelationQuery(args: any, relationQuery: any) {
  const mask: Record<string, any> = {}
  let found = false
    ;['include', 'select'].map((method) => {
      if (args[method]) {
        found = true
        for (const key in relationQuery) {
          // relations on relationQuery have a select, since it can also have normal fields
          if (!(key in args[method])) {
            if (relationQuery[key].select) {
              args[method][key] = Object.keys(relationQuery[key].select).length === 0 ? true : relationQuery[key]
              mask[key] = true
            } else if (method === 'select') {
              args[method][key] = relationQuery[key]
              mask[key] = true
            }

          } else if (args[method][key] && typeof args[method][key] === 'object') {
            // if current field is an object, we recurse merging
            const child = relationQuery[key].select ? mergeArgsAndRelationQuery(args[method][key], relationQuery[key].select) : { args: args[method][key], mask: true }
            args[method][key] = child.args
            mask[key] = child.mask
          } else if (args[method][key] === true) {
            // if field is true it expects all fields
            // but we need to get nested relations, therefore
            // we convert relation select to include with only relation fields 
            // (relation fields have a select prop)
            if (relationQuery[key].select) {
              for (const field in relationQuery[key].select) {
                if (relationQuery[key].select[field]?.select) {
                  args[method][key] = {
                    include: {
                      ...(args[method][key]?.include ?? {}),
                      [field]: relationQuery[key].select[field]
                    }
                  }
                  mask[key] = {
                    ...(mask?.[key] ?? {}),
                    [field]: true
                  }
                }

              }

            }

          }
        }
      }
    })

  if (found === false) {
    Object.entries(relationQuery).forEach(([k, v]: [string, any]) => {
      if (v?.select) {
        args.include = {
          ...(args.include ?? {}),
          [k]: v
        }
        mask[k] = removeNestedIncludeSelect(v.select)
      }
    })
  }

  return {
    args,
    mask
  }
}
/**
 * recursively removes all selects and includes from a select query to get a clean mask
 *  { posts: { select: { thread: { select: { id: true }}}}}
 *  { posts: { thread: { id: true }}}
 * @param args select query
 * @returns mask
 */
function removeNestedIncludeSelect(args: any) {
  return typeof args === 'object' ? Object.fromEntries((Object.entries(args) as [string, any]).map(([k, v]): [string, any] => {
    if (v?.select) {
      return [k, removeNestedIncludeSelect(v.select)]
    } else if (v?.include) {
      return [k, removeNestedIncludeSelect(v.include)]
    } else {
      return [k, v]
    }
  })) : args
}


/**
 * filterQueryResults needs to work with all data that is related to rules
 * a query might not load this data, therefore we add the rule condition fields
 * to the query
 * 
 * we also generate a mask that can be used by filterQueryResults to
 * remove unused fields
 * 
 * @param args query
 * @param abilities Casl prisma abilities
 * @param action Casl action - preferably create/read/update/delete
 * @param model prisma model
 * @returns `{ args: mergedQuery, mask: description of fields that should be removed from result }`
 */
export function applyRuleRelationsQuery(args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, action: string, model: Prisma.ModelName, creationTree?: CreationTree) {

  const creationSelectQuery = creationTree ? convertCreationTreeToSelect(abilities, creationTree) ?? {} : {}

  const queryRelations = getNestedQueryRelations(args, abilities, action, model, creationSelectQuery === true ? {} : creationSelectQuery)

  if (!args.select && !args.include) {
    args.include = {}
  }

  // merge rule query relations with current arguments and creates new args and a mask that will be used to remove values that are only necessary to evaluate rules
  const result = mergeArgsAndRelationQuery(args, queryRelations)

  if ('include' in result.args && Object.keys(result.args.include!).length === 0) {
    delete result.args.include
  }
  return { ...result, creationTree }
}


/**
 * 
 * gets all query relations that are necessary to evaluate rules later on
 * 
 * @param args query
 * @param abilities Casl prisma abilities
 * @param action Casl action - preferably create/read/update/delete
 * @param model prisma model
 * @param creationSelectQuery 
 * @returns `{ args: mergedQuery, mask: description of fields that should be removed from result }`
 */
function getNestedQueryRelations(args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, action: string, model: Prisma.ModelName, creationSelectQuery: any = {}) {
  // rulesToAST won't return conditions
  // if a rule is inverted and if a can rule exists without condition
  // we therefore create fake ability here
  // to get our rule relations query
  // furthermore if we query for action = 'all' we rename rule action to 'all'
  const ability = createPrismaAbility(abilities.rules.filter((rule) => rule.conditions).map((rule) => {
    return {
      ...rule,
      action: action === 'all' ? action : rule.action,
      inverted: false
    }
  }))
  const ast = rulesToAST(ability, action, model)

  const queryRelations = getRuleRelationsQuery(model, ast, creationSelectQuery === true ? {} : creationSelectQuery)
    ;['include', 'select'].map((method) => {
      if (args && args[method]) {
        for (const relation in args[method]) {
          if (model in relationFieldsByModel && relation in relationFieldsByModel[model]) {
            const relationField = relationFieldsByModel[model][relation]

            if (relationField) {
              const nestedQueryRelations = deepMerge(
                getNestedQueryRelations(args[method][relation], abilities, action === 'all' ? 'all' : 'read', relationField.type as Prisma.ModelName),
                (typeof queryRelations[relation]?.select === 'object' ? queryRelations[relation]?.select : {})
              )
              if (nestedQueryRelations && Object.keys(nestedQueryRelations).length > 0) {
                queryRelations[relation] = {
                  ...(queryRelations[relation] ?? {}),
                  select: nestedQueryRelations
                }
              }
            }
          }
        }
      }
    })

  return queryRelations
}