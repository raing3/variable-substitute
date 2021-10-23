import { Resolver } from '../resolver';
import { substitute } from '../substitute';

jest.unmock('../substitute');

describe('substitute', () => {
    const resolver1: Resolver = {
        resolve: jest.fn(value => {
            return typeof value === 'object' ? value : `${value}-resolver1`;
        })
    };
    const resolver2: Resolver = {
        resolve: jest.fn(value => {
            return typeof value === 'object' ? value : `${value}-resolver2`;
        })
    };

    test.each([
        [
            'Scalar value',
            'scalar value',
            'scalar value-resolver1-resolver2'
        ],
        [
            'Array value',
            ['item1', 'item2'],
            ['item1-resolver1-resolver2', 'item2-resolver1-resolver2']
        ],
        [
            'Object value',
            { key1: 'value 1', key2: 'value 2' },
            { key1: 'value 1-resolver1-resolver2', key2: 'value 2-resolver1-resolver2' }
        ],
        [
            'Nested data',
            {
                key1: 'value 1',
                key2: 'value 2',
                key3: ['item 3', 'item 4'],
                key4: {
                    key5: {
                        key6: 'value 5',
                        key7: 'value 6'
                    }
                }
            },
            {
                key1: 'value 1-resolver1-resolver2',
                key2: 'value 2-resolver1-resolver2',
                key3: ['item 3-resolver1-resolver2', 'item 4-resolver1-resolver2'],
                key4: {
                    key5: {
                        key6: 'value 5-resolver1-resolver2',
                        key7: 'value 6-resolver1-resolver2'
                    }
                }
            }
        ]
    ])('Should substitute data in value using provided resolvers - %s', (
        description,
        value,
        expected
    ) => {
        const actual = substitute(value, [resolver1, resolver2]);

        expect(actual).toStrictEqual(expected);
    });

    test('Should call resolver for nested data', () => {
        const value = {
            key1: 'value 1',
            key2: 'value 2',
            key3: ['item 3', 'item 4'],
            key4: {
                key5: {
                    key6: 'value 5',
                    key7: 'value 6'
                }
            }
        };

        const actual = substitute(value, [resolver1]);

        expect(resolver1.resolve).toBeCalledWith(value); // resolver should be called with root and branches
        expect(resolver1.resolve).toBeCalledWith(value.key4);
        expect(resolver1.resolve).toBeCalledWith(value.key4.key5);
        expect(actual).toBe(value); // modifies data passed in, rather than creating a copy.
    });
});
