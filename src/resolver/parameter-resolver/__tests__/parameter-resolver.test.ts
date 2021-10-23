import { ParameterResolver } from '../parameter-resolver';

jest.unmock('../parameter-resolver');

describe('resolve', () => {
    const resolver = new ParameterResolver({
        stringParameter: 'string value',
        booleanParameter: true,
        numberParameter: 123.45,
        objectParameter: { object: 'data' }
    });

    test.each([
        [
            'Non-string value',
            { nonString: 'value' },
            { nonString: 'value' }
        ],
        [
            'String value with no parameter placeholder',
            'string value',
            'string value'
        ],
        [
            'String value which is a parameter placeholder',
            '%stringParameter%',
            'string value'
        ],
        [
            'String value which is a complex parameter placeholder',
            '%objectParameter%',
            { object: 'data' }
        ],
        [
            'String value which contains a parameter placeholder',
            '%stringParameter% - other info',
            'string value - other info'
        ],
        [
            'String value which contains multiple parameter placeholders',
            '%stringParameter% - %booleanParameter% - %numberParameter% - other info',
            'string value - true - 123.45 - other info'
        ]
    ])('Should resolve value - %s', (
        description: string,
        value: any,
        expected: any
    ) => {
        expect(resolver.resolve(value)).toStrictEqual(expected);
    });

    test.each([
        [
            'String value which references a parameter',
            '%unknownParameter%'
        ],
        [
            'String value which contains a reference to a parameter',
            '%unknownParameter% - other info'
        ],
        [
            'String value which contains a mixture of resolvable and unresolvable parameters',
            '%stringParameter% - %unknownParameter%'
        ]
    ])('Should throw if attempting to resolve parameter that does not exist - %s', (
        description: string,
        value: any
    ) => {
        expect(() => resolver.resolve(value))
            .toThrow('Value for parameter "%unknownParameter%" has not been provided.');
    });

    test('Should throw if resolved value is part of a larger string and cannot be stringified', () => {
        expect(() => resolver.resolve('%objectParameter% - other info'))
            .toThrow(
                '"%objectParameter%" is part of a larger string and resolves to a value ("[object Object]") ' +
                'that cannot be meaningfully stringified.'
            );
    });
});
