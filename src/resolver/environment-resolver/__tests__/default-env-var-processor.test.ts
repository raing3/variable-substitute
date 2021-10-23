import { DefaultEnvVarProcessor } from '../default-env-var-processor';

jest.unmock('../default-env-var-processor');
jest.unmock('atob');

describe('getEnv', () => {
    const processor = new DefaultEnvVarProcessor();

    test.each([
        // base64
        ['Base64', 'base64', 'VGhpcyBpcyBhIHRlc3Q=', 'This is a test'],
        // bool
        ['Bool - positive integer', 'bool', '1', true],
        ['Bool - negative integer', 'bool', '-1', true],
        ['Bool - positive float', 'bool', '0.1', true],
        ['Bool - negative float', 'bool', '-0.1', true],
        ['Bool - zero', 'bool', '0', false],
        ['Bool - string true', 'bool', 'true', true],
        ['Bool - string y', 'bool', 'y', true],
        ['Bool - string yes', 'bool', 'yes', true],
        ['Bool - string on', 'bool', 'on', true],
        ['Bool - random string', 'bool', 'random string', false],
        ['Bool - empty string', 'bool', '', false],
        // json
        ['Json', 'json', '{"json": "value"}', { json: 'value' }],
        // not
        ['Not - positive integer', 'not', '1', false],
        ['Not - negative integer', 'not', '-1', false],
        ['Not - positive float', 'not', '0.1', false],
        ['Not - negative float', 'not', '-0.1', false],
        ['Not - zero', 'not', '0', true],
        ['Not - string true', 'not', 'true', false],
        ['Not - string y', 'not', 'y', false],
        ['Not - string yes', 'not', 'yes', false],
        ['Not - string on', 'not', 'on', false],
        ['Not - random string', 'not', 'random string', true],
        ['Not - empty string', 'not', '', true],
        // number
        ['Not - positive integer', 'number', '1', 1],
        ['Not - negative integer', 'number', '-1', -1],
        ['Not - positive float', 'number', '0.1', 0.1],
        ['Not - negative float', 'number', '-0.1', -0.1],
        ['Not - zero', 'number', '0', 0],
        // trim
        ['Trim', 'trim', '  untrimmed string  ', 'untrimmed string']
    ])('Should return processed environment variable - %s', (
        description: string,
        prefix: string,
        envValue: any,
        expected: any
    ) => {
        const getEnv = jest.fn(requestedName => {
            return requestedName === 'TEST_ENV' ? envValue : undefined;
        });

        expect(processor.getEnv(prefix, 'TEST_ENV', getEnv)).toStrictEqual(expected);
    });

    test('Should return processed environment variable - Default', () => {
        const getEnv = jest.fn(() => 'resolved value');
        const actual = processor.getEnv('default', 'fallback value:TEST_ENV', getEnv);

        expect(actual).toBe('resolved value');
        expect(getEnv).toBeCalledWith('TEST_ENV', 'fallback value');
    });

    test.each([
        // json
        [
            'Json - invalid json',
            'json',
            '{"invalid": json}',
            'Environment variable "TEST_ENV" is not JSON: "{"invalid": json}".'
        ],
        // number
        [
            'Number - not a number',
            'number',
            'random string',
            'Environment variable "TEST_ENV" is not a number: "random string".'
        ],
        // trim
        [
            'Trim - not a string',
            'trim',
            15,
            'Environment variable "TEST_ENV" is not a string: "15".'
        ],
        // unsupported prefix
        [
            'Unsupported prefix',
            'unsupported',
            'env value',
            'Prefix "unsupported" is not supported by this processor.'
        ]
    ])('Should throw if unexpected value encountered', (
        description: string,
        prefix: string,
        envValue: any,
        expectedError: string
    ) => {
        const getEnv = jest.fn(requestedName => {
            return requestedName === 'TEST_ENV' ? envValue : undefined;
        });

        expect(() => processor.getEnv(prefix, 'TEST_ENV', getEnv)).toThrow(expectedError);
    });

    test('Should return processed environment variable - Default - no fallback value provided', () => {
        const getEnv = jest.fn(() => 'resolved value');

        expect(() => processor.getEnv('default', 'TEST_ENV', getEnv))
            .toThrow('No default value provided for "TEST_ENV".');
    });
});

describe('getSupportedPrefixes', () => {
    const processor = new DefaultEnvVarProcessor();

    test('Should return supported prefixes', () => {
        expect(processor.getSupportedPrefixes()).toEqual([
            'base64',
            'bool',
            'default',
            'json',
            'not',
            'number',
            'trim'
        ]);
    });
});
