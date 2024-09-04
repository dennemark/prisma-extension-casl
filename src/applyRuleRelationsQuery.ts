import { AbilityTuple, PureAbility } from '@casl/ability';
import { rulesToAST } from '@casl/ability/extra';
import { createPrismaAbility, PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';
import { convertCreationTreeToSelect, CreationTree } from './convertCreationTreeToSelect';
import { getRuleRelationsQuery } from './getRuleRelationsQuery';



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
            const child = relationQuery[key].select ? mergeArgsAndRelationQuery(args[method][key], relationQuery[key].select) : args[method][key]
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
        mask[k] = v
      }
    })
  }

  return {
    args,
    mask
  }
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


  // rulesToAST won't return conditions
  // if a rule is inverted and if a can rule exists without condition
  // we therefore create fake ability here
  // to get our rule relations query
  const ability = createPrismaAbility(abilities.rules.filter((rule) => rule.conditions).map((rule) => {
    return {
      ...rule,
      inverted: false
    }
  }))
  const ast = rulesToAST(ability, action, model)
  const creationSelectQuery = creationTree ? convertCreationTreeToSelect(abilities, creationTree) ?? {} : {}

  const queryRelations = getRuleRelationsQuery(model, ast, creationSelectQuery === true ? {} : creationSelectQuery)


  if (!args.select && !args.include) {
    args.include = {}
  }
  const result = mergeArgsAndRelationQuery(args, queryRelations)

  if (result.args.include && Object.keys(result.args.include!).length === 0) {
    delete result.args.include
  }
  return { ...result, creationTree }
}



