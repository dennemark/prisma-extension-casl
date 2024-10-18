import { AbilityTuple, PureAbility } from "@casl/ability";
import { PrismaQuery } from "@casl/prisma";
import { getSubject, PrismaExtensionCaslOptions } from "./helpers";

export function storePermissions(result: any, abilities: PureAbility<AbilityTuple, PrismaQuery>, model: string, opts?: PrismaExtensionCaslOptions) {
  if (!opts?.permissionField) {
    return result
  }
  const prop = opts.permissionField
  const actions = ['create', 'read', 'update', 'delete', ...(opts?.addPermissionActions ?? [])]
  const storeProp = (entry: any) => {
    if (entry) {
      entry[prop] = []
      actions.forEach((action) => {
        if (abilities.can(action, getSubject(model, entry))) {
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