import { Dictionary } from '../../types';
import { Resolver } from '../resolver';

const allowedStringConcatenationTypes = ['string', 'boolean', 'number'];

export class ParameterResolver implements Resolver {
    private readonly parameters: Dictionary<unknown>;

    public constructor(parameters: Dictionary<unknown>) {
        this.parameters = {};

        Object.keys(parameters).forEach(parameterName => {
            this.parameters[`%${parameterName}%`] = parameters[parameterName];
        });
    }

    public resolve<T = any>(value: any): T {
        if (typeof value !== 'string') {
            return value as any as T;
        }

        // retain parameter value type if value is just the parameter
        if (value.startsWith('%') && value.endsWith('%') && this.parameters[value]) {
            return this.parameters[value] as T;
        }

        return value.replace(/%([^%]+)%/g, (match): string => {
            if (!this.parameters[match]) {
                throw new Error(`Value for parameter "${match}" has not been provided.`);
            }

            if (allowedStringConcatenationTypes.indexOf(typeof this.parameters[match]) < 0) {
                throw new Error(
                    `"${match}" is part of a larger string and resolves to a value ("${this.parameters[match]}") ` +
                    'that cannot be meaningfully stringified.'
                );
            }

            return String(this.parameters[match]);
        }) as any as T;
    }
}
