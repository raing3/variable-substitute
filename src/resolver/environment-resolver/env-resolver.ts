import { DefaultEnvVarProcessor } from './default-env-var-processor';
import { Dictionary } from '../../types';
import { EnvVarProcessor } from './env-var-processor';
import { Resolver } from '../resolver';

const allowedStringConcatenationTypes = ['string', 'boolean', 'number'];

export class EnvResolver implements Resolver {
    private readonly processors: Dictionary<EnvVarProcessor>;

    private readonly env: NodeJS.ProcessEnv;

    public constructor(processors: EnvVarProcessor[] = [], env: NodeJS.ProcessEnv = process.env) {
        this.processors = {};
        this.env = env;
        this.getEnv = this.getEnv.bind(this);

        [new DefaultEnvVarProcessor(), ...processors].forEach(processor => {
            processor.getSupportedPrefixes().forEach(prefix => {
                this.processors[prefix] = processor;
            });
        });
    }

    public resolve<T = any>(value: any): T {
        if (typeof value !== 'string') {
            return value as any as T;
        }

        const matches = value.match(/^%env\(([^)]+)\)%$/);

        if (matches) {
            return this.getEnv(matches[1]) as T;
        }

        return value.replace(/%env\(([^)]+)\)%/g, (match: string, placeholder: string): string => {
            const resolvedValue = this.getEnv(placeholder);

            if (allowedStringConcatenationTypes.indexOf(typeof resolvedValue) < 0) {
                throw new Error(
                    `"${match}" is part of a larger string and resolves to a value ("${resolvedValue}") ` +
                    'that cannot be meaningfully stringified.'
                );
            }

            return String(resolvedValue);
        }) as any as T;
    }

    private getEnv<T = any>(name: string, fallback: T|undefined = undefined): T {
        const prefix = name.substr(0, name.indexOf(':'));

        if (prefix) {
            name = name.substr(prefix.length + 1);
        }

        if (!prefix) {
            if (name in this.env) {
                return this.env[name] as any as T;
            } else if (fallback !== undefined) {
                return fallback;
            }

            throw new Error(`Environment variable "${name}" is not set.`);
        }

        if (!this.processors[prefix]) {
            throw new Error(
                `There is no processor configured to handle "${prefix}" as part of ` +
                `environment variable "${name}"`
            );
        }

        return this.processors[prefix]!.getEnv<T>(prefix, name, this.getEnv);
    }
}
