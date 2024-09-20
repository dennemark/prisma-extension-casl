import { transformDataToWhereQuery } from '../src/transformDataToWhereQuery'

describe('transform data to where query', () => {

  it('converts data relations with connect to where query and transforms to relationField data entries', () => {

    const result = transformDataToWhereQuery({ data: { id: 1, thread: { connect: { id: 0, text: 'a' } } }, where: { id: 0 } },
      'Post'
    )
    expect(result.data).toEqual({ id: 1, threadId: 0 })
    expect(result.where).toEqual({ id: 0, thread: { text: 'a' } })
  })

  it('converts data relations with disconnect to where query and transforms to relationField data entries', () => {
    const result = transformDataToWhereQuery({ data: { id: 1, thread: { disconnect: { id: 0, text: 'a' } } }, where: { id: 0 } },
      'Post'
    )
    expect(result.data).toEqual({ id: 1, threadId: 0 })
    expect(result.where).toEqual({ id: 0, thread: { text: 'a' } })
  })
})
