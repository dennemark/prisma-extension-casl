import { AbilityTuple, PureAbility, Subject, ɵvalue } from '@casl/ability';
import { rulesToAST } from '@casl/ability/extra';
import { PrismaQuery } from '@casl/prisma';
import { Prisma } from '@prisma/client';
import { relationFieldsByModel } from './helpers';

function getRuleRelationsQuery(model: string, ast: any) {
  const obj: Record<string, any> = {}
  if (ast) {
    if (typeof ast.value === 'object') {
      if (Array.isArray(ast.value)) {
        ast.value.map((childAst: any) => {
          const relation = relationFieldsByModel[model]
          if (childAst.field) {
            if (childAst.field in relation) {
              obj[childAst.field] = {
                select: getRuleRelationsQuery(relation[childAst.field].type, childAst.value)
              }
            } else {
              obj[childAst.field] = true
            }
          }
        })
      } else {
        const relation = relationFieldsByModel[model]
        if (ast.field) {
          if (ast.field in relation) {
            obj[ast.field] = {
              select: getRuleRelationsQuery(relation[ast.field].type, ast.value)
            }
          } else {
            obj[ast.field] = true
          }
        }
      }
    } else {
      obj[ast.field] = true
    }
  }
  return obj
}

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
          // relations on relationQuery have a select
          if (!(key in args[method])) {
            if (relationQuery[key].select || method === 'select') {
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
export function applyRuleRelationsQuery(args: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, action: string, model: Prisma.ModelName) {

  const ast = rulesToAST(abilities, action, model)
  const queryRelations = getRuleRelationsQuery(model, ast)

  return mergeArgsAndRelationQuery(args, queryRelations)
}




// Maske aussortieren