import { convertCreationTreeToSelect } from "../src/convertCreationTreeToSelect"
import { abilityBuilder } from "./abilities"


describe('convert creation tree to select query', () => {
  it('correctly builds data query', () => {
    const { can, build } = abilityBuilder()
    can('create', 'Post', {
      author: {
        is: {
          id: 0
        }
      }
    })
    expect(convertCreationTreeToSelect(build(), {
      action: 'update',
      model: 'User',
      children: {
        post: {
          model: 'Post',
          action: 'create',
          children: {
            topic: {
              action: 'connect',
              model: 'Topic',
              children: {
                category: {
                  action: 'create',
                  model: 'Thread',
                  children: {},
                  mutation: []
                },
                tag: {
                  action: 'update',
                  model: 'Thread',
                  children: {},
                  mutation: []
                },
              },
              mutation: []

            },
          },
          mutation: []
        }
      },
      mutation: []

    })
    ).toEqual({ post: { select: { author: { select: { id: true } }, topic: { select: { category: { select: {} } } } } } })
  })
  it('correctly builds data query', () => {
    const { build } = abilityBuilder()

    expect(convertCreationTreeToSelect(build(), {
      action: 'create',
      model: 'User',
      children: {
        posts: {
          action: 'create',
          model: 'Post',
          children: { thread: { model: 'Thread', action: 'update', children: {}, mutation: [] } },
          mutation: []
        }
      },
      mutation: []
    })).toEqual({ posts: { select: {} } })
  })
})
