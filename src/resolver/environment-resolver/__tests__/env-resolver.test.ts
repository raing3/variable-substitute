import { EnvResolver } from '../env-resolver';

jest.unmock('../env-resolver');
jest.unmock('../default-env-var-processor');
jest.unmock('atob');

describe('resolve', () => {
    const resolver = new EnvResolver([], {
        STRING_ENV_VAR: 'String environment variable',
        NUMERIC_ENV_VAR: '123.45',
        BASE64_ENV_VAR: 'QmFzZTY0IGVudmlyb25tZW50IHZhcmlhYmxl', // Base64 environment variable
        JSON_ENV_VAR: '{"json": "value"}',
        NUMERIC_BASE64_ENV_VAR: 'NTQuMzIx', // 54.321
        BLANK_ENV_VAR: ''
    });

    test.each([
        [
            'Non-string value',
            { nonString: 'value' },
            { nonString: 'value' }
        ],
        [
            'String value with no environment placeholder',
            'string value',
            'string value'
        ],
        [
            'String value which is an environment placeholder',
            '%env(NUMERIC_ENV_VAR)%',
            '123.45'
        ],
        [
            'String value which contains an environment placeholder',
            '%env(NUMERIC_ENV_VAR)% - other info',
            '123.45 - other info'
        ],
        [
            'String value which contains multiple environment placeholders',
            '%env(STRING_ENV_VAR)% - %env(NUMERIC_ENV_VAR)% - other info',
            'String environment variable - 123.45 - other info'
        ],
        [
            'String value which is a processed environment placeholder',
            '%env(number:NUMERIC_ENV_VAR)%',
            123.45
        ],
        [
            'String value which is a multi-step processed environment placeholder',
            '%env(number:base64:NUMERIC_BASE64_ENV_VAR)%',
            54.321
        ],
        [
            'String value which contains a processed environment placeholder',
            '%env(number:NUMERIC_ENV_VAR)% - other info',
            '123.45 - other info'
        ],
        [
            'String value which contains multiple environment placeholders',
            '%env(base64:BASE64_ENV_VAR)% - %env(number:NUMERIC_ENV_VAR)% - other info',
            'Base64 environment variable - 123.45 - other info'
        ],
        [
            'Environment variable with default value - specified in env',
            '%env(number:default:111.11:NUMERIC_ENV_VAR)%',
            123.45
        ],
        [
            'Environment variable with default value - not specified in env',
            '%env(number:default:111.11:UNKNOWN_ENV_VAR)%',
            111.11
        ],
        [
            'Environment variable with default value - blank in env',
            '%env(default:fallback value:BLANK_ENV_VAR)%',
            ''
        ],
        [
            'Environment variable with blank default value - blank in env',
            '%env(default::UNKNOWN_ENV_VAR)%',
            ''
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
            'String value which is an environment placeholder',
            '%env(UNKNOWN_ENV_VAR)%'
        ],
        [
            'String value which contains an environment placeholder',
            '%env(UNKNOWN_ENV_VAR)% - other info'
        ],
        [
            'String value which contains a mixture of resolvable and unresolvable environment placeholders',
            '%env(STRING_ENV_VAR)% - %env(UNKNOWN_ENV_VAR)%'
        ]
    ])('Should throw if attempting to resolve environment variable that does not exist - %s', (
        description: string,
        value: any
    ) => {
        expect(() => resolver.resolve(value))
            .toThrow('Environment variable "UNKNOWN_ENV_VAR" is not set.');
    });

    test('Should throw if attempting to resolve environment variable with an unsupported prefix - %s', () => {
        expect(() => resolver.resolve('%env(unsupported:STRING_ENV_VAR)%'))
            .toThrow(
                'There is no processor configured to handle "unsupported" as part of ' +
                'environment variable "STRING_ENV_VAR"'
            );
    });

    test('Should throw if resolved value is part of a larger string and cannot be stringified', () => {
        expect(() => resolver.resolve('%env(json:JSON_ENV_VAR)% - other info'))
            .toThrow(
                '"%env(json:JSON_ENV_VAR)%" is part of a larger string and resolves to a value ' +
                '("[object Object]") that cannot be meaningfully stringified.'
            );
    });
});
