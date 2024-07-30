import { AbilityBuilder, PureAbility } from '@casl/ability'
import {
  createPrismaAbility,
  PrismaQuery,
  Subjects,
} from '@casl/prisma'
import { Post, Thread, Topic, User } from '@prisma/client'

type AppAbility = PureAbility<
  [
    string,
    Subjects<{
      Post: Post,
      Thread: Thread,
      User: User,
      Topic: Topic
    }>
  ],
  PrismaQuery
>

export function abilityBuilder() {
  return new AbilityBuilder<AppAbility>(createPrismaAbility)
}
