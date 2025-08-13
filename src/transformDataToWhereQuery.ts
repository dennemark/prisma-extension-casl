import { relationFieldsByModel } from "./helpers"

export function transformDataToWhereQuery(args: any, model: string) {

  ;['connect', 'disconnect'].forEach((action) => {
    for (const relation in args.data) {
      const obj = args.data[relation]
      if (typeof obj === 'object' && !Array.isArray(obj) && obj[action]) {
        // combine args.data.relation[action].AND and args.where.AND
        const ANDArgs = { AND: [...(obj[action].AND ?? []), ...(args.where[relation]?.AND ?? [])] }
        const relationTo = relationFieldsByModel[model][relation].relationToFields?.[0]
        const relationFrom = relationFieldsByModel[model][relation].relationFromFields?.[0]
        if (!relationTo || !relationFrom) {
          throw new Error('Cannot find correct relations to transform updateMany to casl query.')
        }
        args.where = {
          ...(args.where ?? {}),
          [relation]: {
            ...(args.where[relation] ?? {}),
            ...obj[action],
            ...(ANDArgs.AND.length > 0 ? ANDArgs : {})
          }
        }
        args.data = {
          ...args.data,
          [relationFrom]: obj[action][relationTo]
        }
        delete args.data[relation]
        delete args.where[relation][relationTo]
      }
    }
  })
  return args
}