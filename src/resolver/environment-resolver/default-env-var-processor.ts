import atob from 'atob';
import { EnvVarProcessor } from './env-var-processor';
import { GetEnv } from './get-env';

export class DefaultEnvVarProcessor implements EnvVarProcessor {
    getEnv(prefix: string, name: string, getEnv: GetEnv): any {
        if (prefix === 'base64') {
            return atob(getEnv(name));
        }

        if (prefix === 'bool' || prefix === 'not') {
            let value = getEnv(name);

            value = isNaN(value) ?
                ['true', 'y', 'yes', 'on'].indexOf(value) >= 0 :
                Number(value) != 0;

            return prefix === 'not' ? !value : value;
        }

        if (prefix === 'default') {
            const colonIndex = name.lastIndexOf(':');

            if (colonIndex < 0) {
                throw new Error(`No default value provided for "${name}".`);
            }

            const defaultValue = name.substr(0, colonIndex);

            name = name.substr(defaultValue.length + 1);

            return getEnv(name, defaultValue);
        }

        if (prefix === 'json') {
            const value = getEnv(name);

            try {
                return JSON.parse(value);
            } catch (error) {
                throw new Error(`Environment variable "${name}" is not JSON: "${value}".`);
            }
        }

        if (prefix === 'number') {
            const value = getEnv(name);

            if (isNaN(value)) {
                throw new Error(`Environment variable "${name}" is not a number: "${value}".`);
            }

            return Number(value);
        }

        if (prefix === 'trim') {
            const value = getEnv(name);

            if (typeof value !== 'string') {
                throw new Error(`Environment variable "${name}" is not a string: "${value}".`);
            }

            return value.trim();
        }

        throw new Error(`Prefix "${prefix}" is not supported by this processor.`);
    }

    getSupportedPrefixes(): string[] {
        return [
            'base64',
            'bool',
            'default',
            'json',
            'not',
            'number',
            'trim'
        ];
    }
}
