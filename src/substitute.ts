import { Resolver } from './resolver';

export const substitute = <T = any>(value: any, resolvers: Resolver[]): T => {
    resolvers.forEach(resolver => {
        value = resolver.resolve(value);
    });

    if (typeof value === 'object') {
        for (const key in value) {
            value[key] = substitute(value[key], resolvers);
        }
    }

    return value as any as T;
};
