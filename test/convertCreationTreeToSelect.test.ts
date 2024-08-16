import { convertCreationTreeToSelect } from "../src/convertCreationTreeToSelect"


describe('convert creation tree to select query', () => {
  it('correctly builds data query', () => {
    expect(convertCreationTreeToSelect({
      type: 'update',
      children: {
        post: {
          type: 'create',
          children: {
            topic: {
              type: 'connect',
              children: {
                category: {
                  type: 'create',
                  children: {},
                },
                tag: {
                  type: 'update',
                  children: {},
                },
              },
            },
          }
        },

      },
    })
    ).toEqual({ post: { select: { topic: { select: { category: { select: {} } } } } } })
  })
  it('correctly builds data query', () => {
    expect(convertCreationTreeToSelect({
      type: 'create',
      children: {
        posts: {
          type: 'create',
          children: { thread: { type: 'update', children: {} } }
        }
      }
    })).toEqual({ posts: { select: {} } })
  })
})
