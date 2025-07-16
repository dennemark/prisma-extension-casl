import type { Prisma } from '@prisma/client'
import { relationFieldsByModel } from "./helpers"

export function transformDataToWhereQuery<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, args: any, model: string) {

  ;['connect', 'disconnect'].forEach((action) => {
    Object.entries(args.data).forEach(([relation, obj]: [string, any]) => {
      if (typeof obj === 'object' && !Array.isArray(obj) && obj[action]) {
        // combine args.data.relation[action].AND and args.where.AND
        const ANDArgs = { AND: [...(obj[action].AND ?? []), ...(args.where[relation]?.AND ?? [])] }
        const relationTo = relationFieldsByModel(prismaInstance)[model][relation].relationToFields?.[0]
        const relationFrom = relationFieldsByModel(prismaInstance)[model][relation].relationFromFields?.[0]
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
    })
  })
  return args
}