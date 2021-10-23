import { GetEnv } from './get-env';

export type EnvVarProcessor = {
    getEnv: <T = any>(prefix: string, name: string, getEnv: GetEnv<T>) => T;
    getSupportedPrefixes(): string[];
};
