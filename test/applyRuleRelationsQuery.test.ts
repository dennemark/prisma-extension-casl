
import { applyRuleRelationsQuery } from '../src/applyRuleRelationsQuery'
import { abilityBuilder } from './abilities'



describe('apply rule relations query', () => {
  it('adds missing select queries for list relation', () => {
    const { can, build } = abilityBuilder()
    can('read', 'User', {
      posts: {
        some: {
          text: '0',
          id: 0,
          author: {
            is: {
              id: 0
            }
          },
          threadId: 0
        }
      },
      email: {
        contains: '1',
        endsWith: '1'
      }
    })
    const { args, mask } = applyRuleRelationsQuery({
      select: {
        posts: {
          select: {
            text: true
          }
        }
      }
    }, build(), 'read', 'User')
    expect(args).toEqual({
      select: {
        posts: {
          select: {
            text: true,
            id: true,
            author: {
              select: {
                id: true
              }
            },
            threadId: true
          }
        },
        email: true
      },
    })
    expect(mask).toEqual({
      posts: {
        id: true,
        author: true,
        threadId: true
      },
      email: true
    })
  })
  it('adds missing include queries for list relation', () => {
    const { can, build } = abilityBuilder()
    can('read', 'User', {
      posts: {
        some: {
          text: '0',
          id: 0,
          author: {
            is: {
              id: 0
            }
          },
          threadId: 0
        }
      },
      email: {
        contains: '1',
        endsWith: '1'
      }
    })
    const { args, mask } = applyRuleRelationsQuery({
      include: {
        posts: true
      }
    }, build(), 'read', 'User')
    expect(args).toEqual({
      include: {
        posts: {
          include: {
            author: {
              select: {
                id: true
              }
            },
          }
        }
      },
    })
    expect(mask).toEqual({
      posts: {
        author: true,
      },
    })
  })
  it('adds missing select queries for item relation', () => {
    const { can, build } = abilityBuilder()
    can('read', 'Post', {
      thread: {
        is: {
          id: 0
        }
      }
    })
    const { args, mask } = applyRuleRelationsQuery({
      select: {
        author: {
          id: true
        }
      }
    }, build(), 'read', 'Post')
    expect(args).toEqual({
      select: {
        thread: {
          select: {
            id: true
          }
        },
        author: {
          id: true
        }
      }
    })
    expect(mask).toEqual({
      thread: true,
    })
  })

  it('adds missing select queries if select query exists for item relation', () => {
    const { can, build } = abilityBuilder()
    can('read', 'Post', {
      thread: {
        is: {
          id: 0,
          creator: {
            is: {
              id: 0
            }
          }
        }
      }
    })
    const { args, mask } = applyRuleRelationsQuery({ select: { id: true, thread: true } }, build(), 'read', 'Post')
    expect(args).toEqual({
      select: {
        id: true, thread: {
          include: {
            creator: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })
    expect(mask).toEqual({ thread: { creator: true } })
  })


})