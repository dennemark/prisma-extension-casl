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
            const relQuery = getRuleRelationsQuery(relation[childAst.field].type, childAst.value, dataInclude === true ? {} : dataInclude.select)
            if (relQuery && Object.keys(relQuery).length > 0) {
              obj[childAst.field] = {
                select: relQuery
              }
            } else {
              obj[childAst.field] = true

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