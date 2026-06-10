import { AbilityBuilder, Ability } from '@casl/ability'
import {
  createPrismaAbility,
  PrismaQuery,
  Subjects,
} from '@casl/prisma'
import { Post, Thread, Topic, User } from '../src/generated/prisma/client'

type AppAbility = Ability<
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
