import { AbilityTuple, PureAbility } from "@casl/ability";
import { PrismaQuery } from "@casl/prisma";
import type { Prisma } from '@prisma/client';
import { getSubject, PrismaExtensionCaslOptions } from "./helpers";

export function storePermissions<T extends typeof Prisma = typeof Prisma, M extends Prisma.ModelName = Prisma.ModelName>(prismaInstance: T, result: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: string, opts?: PrismaExtensionCaslOptions) {
  if (!opts?.permissionField) {
    return result
  }
  const prop = opts.permissionField
  const actions = ['create', 'read', 'update', 'delete', ...(opts?.addPermissionActions ?? [])]
  const storeProp = (entry: any) => {
    if (entry) {
      entry[prop] = []
      actions.forEach((action) => {
        if (abilities.can(action, getSubject<T, M>(prismaInstance, model, entry))) {
          entry[prop].push(action)
        }
      })
    }
    return entry
  }
  if (Array.isArray(result)) {
    const res = result.map(storeProp)
    return res
  } else {
    return storeProp(result)
  }
}