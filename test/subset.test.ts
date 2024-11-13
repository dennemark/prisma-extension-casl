
import { isSubset } from '../src/helpers'


describe('subset', () => {
    it('is subset', () => {
        expect(isSubset({
            a: [{ c: [{ d: 1 }] }],
            f: 2
        },
            {
                a: [{ b: 0 }, { c: [{ d: 0 }, { d: 1 }] }],
                e: 1,
                f: 2
            }
        )).toBeTruthy()
    })
    it('is no subset', () => {
        expect(isSubset({
            a: [{ c: [{ d: 1 }] }],
            e: 0,
            f: 2
        },
            {
                a: [{ b: 0 }, { c: [{ d: 0 }, { d: 1 }] }],
                e: 1,
                f: 2
            }
        )).toBeFalsy()
    })
    it('is no subset', () => {
        expect(isSubset({
            a: [{ c: [{ d: 1 }] }],
            e: 0,
            f: 2
        },
            {
                a: [{ b: 0 }, { c: [{ d: 0 }, { d: 1 }] }],
                // e: 1,
                f: 2
            }
        )).toBeFalsy()
    })
    it('is no subset', () => {
        expect(isSubset({
            a: [{ c: [{ d: 1 }] }],
            e: 0,
            f: 2
        },
            {
                a: [{ b: 0 }, { c: [{ d: 0 }, { d: 1 }] }],
                // e: 1,
                f: 2
            }
        )).toBeFalsy()
    })
})
