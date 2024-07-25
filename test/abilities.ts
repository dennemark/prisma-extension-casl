import { permission } from 'process'

import { AbilityBuilder, ExtractSubjectType, PureAbility, subject } from '@casl/ability'
import {
  accessibleBy,
  createPrismaAbility,
  PrismaQuery,
  Subjects,
} from '@casl/prisma'
import { Post, Thread, User, Topic } from '@prisma/client'

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

export function abilityBuilder(){
    return new AbilityBuilder<AppAbility>(createPrismaAbility)
}
export function defineAbilities({userId}: { userId: number}) {
    
    const { can: allow, cannot: forbid, build } = new AbilityBuilder<AppAbility>(createPrismaAbility)

    allow(['create', 'read'], 'Thread')
    allow(['update', 'delete'], 'Thread', {
        creatorId: userId
    })
    allow(['read', 'create'], 'Post')
    allow(['update', 'delete'], 'Post', {
        authorId: userId
    })
    

    return build()
  }
  