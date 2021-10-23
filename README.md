# Variable substitute [![npm-version](https://img.shields.io/npm/v/@raing3/variable-substitute.svg)](https://www.npmjs.com/package/@raing3/variable-substitute) [![CI](https://github.com/raing3/variable-substituter/actions/workflows/ci.yml/badge.svg)](https://github.com/raing3/variable-substituter/actions/workflows/ci.yml)
Replaces placeholder values in a variable, including data nested in objects and arrays.

Features:

 * Replace parameters placeholders with a set of provided values.
 * Replace environment placeholders, with optional transformation options.

## Installation
```
npm install @raing3/variable-substitute
```

## Usage
```
import { EnvResolver, ParameterResolver, substitute } from '@raing3/variable-substitute';

const resolvers = [
    // replaces %env(ENV_VAR_NAME)%" with the environment variable value
    new EnvResolver(),

    // replaces %parameter_name% with the parameter value
    new ParameterResolver({
        my_parameter: 'parameter value'
    })
];

// The variable you want to replace placeholders in, can be any type of plain JS value (object, string, array, etc).
// and supports nested/deeply nested data.
const myVariable = {
    envVariable: '%env(ENV_VAR_NAME)%',
    placeholderVariable: '%my_parameter%',
    mixedVariable: '%env(ENV_VAR_NAME)% - some other data - %my_parameter%'
};

const substituted = substitute(myVariable, resolvers);

// {
//   envVariable: '... environment variable value...', 
//   placeholderVariable: 'parameter value'
//   mixedVariable: '... environment variable value ... - some other data - parameter value'
// }
console.log(substituted);
```

## Resolvers

Resolvers are executed in the order they are provided in the `substitute` argument starting at the root of the variable
and being called on all branches and leaf nodes throughout the object graph.

The inbuilt resolvers function as follows:

 * Will replace multiple placeholder value in a single variable.
 * Will replace placeholders in strings that container non-placeholder values, not modifying the non-placeholder data.
 * If an element in the input is just a placeholder with no additional data it will retain the type of the
   resolved value (bool, int, object, etc.)
 * If an element in the input references multiple placeholders or contains additional data the resolved placeholder
   value will be stringified if possible (boolean, number, string). An error will be thrown if the placeholder value
   can't be stringified.
 * If a placeholder cannot be resolved an error will be thrown.
 
### EnvResolver

The environment resolver functions similar to
[Symfonys environment variable resolution](https://symfony.com/doc/current/configuration/env_var_processors.html)
in its DI configuration files. It supports processors which can be chained together and used to parse/cast/reformat.

The processors available by default are:

 * `base64` - decodes Base64 encoded data.
 * `bool` - converts the environment variable to a boolean.
   True = `"true"`, `"y"`, `"yes"`, `"on"`, any non-0 number, all other values are false.
 * `default` - resolves to a default value if the environment variable has not been set.
   eg: `default:fallback value:UNSET_ENV_VAR_NAME` would resolve to `fallback value`.
 * `json` - parses JSON data, throws if the value is not valid JSON.
 * `not` - the inverse of `bool`.
 * `number` - casts the value to a number, throws if the value is not a number.
 * `trim` - trims leading and trailing spaces from the value, throws if the value is not a string.

Resolution chaining example:

Take the following example input:

```
"%env(number:default:5:base64:ENV_VAR_NAME)%"
```

Assuming the environment variable is set to `"MTA="` this will resolve to `10` (numeric).
If the environment variable is not set it will resolve to `5` (numeric).

The value is first decoded from base64, defaulted if not set and then finally cast to a number.

### ParameterResolver

The parameter resolver replaces values surrounded by `%` symbols with a list of provided values.
