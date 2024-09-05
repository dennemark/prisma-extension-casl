import { relationFieldsByModel } from './helpers';

function flattenAst(ast: any) {
  if (['and', 'or'].includes(ast.operator.toLowerCase())) {
    return ast.value.flatMap((childAst: any) => flattenAst(childAst))
  } else {
    return [ast]
  }
}

export function getRuleRelationsQuery(model: string, ast: any, dataRelationQuery: any = {}) {
  const obj: Record<string, any> = dataRelationQuery
  if (ast) {
    if (typeof ast.value === 'object') {
      flattenAst(ast).map((childAst: any) => {
        const relation = relationFieldsByModel[model]
        if (childAst.field) {
          if (childAst.field in relation) {
            const dataInclude = obj[childAst.field] !== undefined ? obj[childAst.field] : {}
            obj[childAst.field] = {
              select: getRuleRelationsQuery(relation[childAst.field].type, childAst.value, dataInclude === true ? {} : dataInclude.select)
            }
          } else {
            obj[childAst.field] = true
          }
        }
      })
    } else {
      obj[ast.field] = true
    }
  }
  return obj
}