# @testplane/url-decorator

## Overview

Use the `@testplane/url-decorator` plugin to automatically add the necessary query parameters to the urls in testplane tests.

## Install

```bash
npm install -D @testplane/url-decorator
```

## Setup

Add the plugin to the `plugins` section of the `testplane` config:

```javascript
module.exports = {
    plugins: {
        '@testplane/url-decorator': {
            enabled: true,
            url: {
                query: [
                    {
                        name: 'text',
                        value: 'foo'
                    },

                    // other query parameters...
                ]
            }
        },

        // other testplane plugins...
    },

    // other testplane settings...
};
```

### Description of configuration parameters

| **Parameter** | **Type** | **Default&nbsp;value** | **Description** |
| ------------- | -------- | ---------------------- | --------------- |
| [enabled](#enabled) | Boolean | true | Enable / disable the plugin. |
| [url](#url) | Object | _N/A_ | An object with a description of query parameters that should be added to each url in the test. |

### enabled

Enable or disable the plugin. By default: `true`.

### url

The `url` parameter is an object with a `query` field, the value of which can be either an array or an object.

**query as an array**

```javascript
module.exports = {
    plugins: {
        '@testplane/url-decorator': {
            enabled: true,
            url: {
                query: [
                    {
                        name: '<param-1>', // specify the name of the query parameter
                        value: '<param-1-value>', // specify the value of the query parameter
                        mode: 'concat', // or 'override'
                        browsers: /.*/ // by default: for all browsers
                    },
                    {
                        name: '<param-2>', // specify the name of the query parameter
                        value: '<param-2-value>', // specify the value of the query parameter
                        mode: 'concat', // or 'override'
                        browsers: /.*/ // by default: for all browsers
                    },

                    // other query parameters...
                ]
            }
        },

        // other testplane plugins...
    },

    // other testplane settings...
};
```

**query as an object**

```javascript
module.exports = {
    plugins: {
        '@testplane/url-decorator': {
            enabled: true,
            url: {
                query: {
                    '<param-1>': { // specify the name of the query parameter
                        value: '<param-1-value>', // specify the value of the query parameter
                        mode: 'concat', // or 'override'
                        browsers: /.*/ // by default: for all browsers
                    },
                    '<param-2>': { // specify the name of the query parameter
                        value: '<param-2-value>', // specify the value of the query parameter
                        mode: 'concat', // or 'override'
                        browsers: /.*/ // by default: for all browsers
                    },

                    // other query parameters...
                }
            },
        },

        // other testplane plugins...
    },

    // other testplane settings...
};
```

Here the query parameter is an object with the following fields:

| **Parameter** | **Type** | **Default&nbsp;value** | **Description** |
| ------------- | -------- | ---------------------- | --------------- |
| [name](#name) | String | _N/A_ | Name of the query parameter. If _query_ is set as an object, then this field is not specified, since the key itself is the name of the query parameter. |
| [value](#value) | String or Number or Array | _N/A_ | The value of the query parameter. |
| [mode](#mode) | String | "concat" | The mode of combining parameters: _concat_ or _override_. |
| [browsers](#browsers) | String or RegExp or Array | _N/A_ | The list of browsers to which the query parameter will be applied. |

#### name

Name of the query parameter. If `query` is set as an object, then this field is not specified, since the key itself is the name of the query parameter.

#### value

The value of the query parameter. It can be specified as a string, a number, or an array of strings and/or numbers.

#### mode

The mode of combining parameters. There are 2 possible values: `concat` _(concat parameters)_ and `override` _(override parameters)_. By default: `concat`.

**Concat mode**

For example:
- you want to add the query parameter `nick`, which is already in the test url: `http://localhost/test/?nick=bilbo`;
- at the same time, you do not want the additional value of the `nick` parameter to erase the value that is already in the url.

In this case, you need to specify `mode: 'concat'` for the parameter or not specify `mode` at all (using the default mode):

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: 'torin',
            mode: 'concat' // or skip it as the default mode is 'concat'
        }
    ]
}
```

Then the resulting url in the test will be: `http://localhost/test/?nick=bilbo&nick=torin`.

You can also specify an array of values for the `nick` parameter in the `value` value:

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: ['torin', 'gloin'],
            mode: 'concat' // or skip it as the default mode is 'concat'
        }
    ]
}
```

Then the resulting url in the test will be: `http://localhost/test/?nick=bilbo&nick=torin&nick=gloin`.

**Override mode**

If you want to erase the `nick` parameter, then you need to set the `override` mode:

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: 'torin',
            mode: 'override'
        }
    ]
}
```

Then the resulting url in the test will be: `http://localhost/test/?nick=torin`.

#### browsers

A browser or a list of browsers, or a regular expression pattern for browsers to which the specified query parameters should be applied. If the parameter `browsers` is not specified, the query parameters will be applied for all browsers.

Below are examples of setting the `browsers` parameter in all ways:

**string**

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: 'gloin',
            browsers: 'firefox'
        }
    ]
}
```

**array of strings**

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: 'gloin',
            browsers: ['firefox', 'chrome']
        }
    ]
}
```

**regexp**

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: 'gloin',
            browsers: /ie-\d+/  //ie-8, ie-9, ie-10, ...
        }
    ]
}
```

**array of regexp / strings**

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: 'gloin',
            browsers: [/ie-\d+/, 'firefox']
        }
    ]
}
```

### Passing parameters via the CLI

#### TESTPLANE_URL_QUERY_*

To pass additional query parameters, you can use environment variables of the following type:

```bash
TESTPLANE_URL_QUERY_<query parameter name>
```

For example, your test opens the url `http://localhost/test/?tool=testplane`, and you want to add the query parameter `text` with the value `ololo` to the url using the environment variable:

```bash
TESTPLANE_URL_QUERY_TEXT=ololo testplane ...
```

After that, your test will open the url of the following form: `http://localhost/test/?tool=testplane&text=ololo`.

#### TESTPLANE_URL_CUSTOM_QUERIES

If there are parameters among your query parameters that cannot be expressed as an environment variable (for example, `foo-bar`), then you can add these parameters via the environment variable `TESTPLANE_URL_CUSTOM_QUERIES`.

As a value, use a string of the form `<query-param-1>=<value-1>;<query-param-2>=<value-2>;`.

For example:

```bash
TESTPLANE_URL_CUSTOM_QUERIES='foo-bar=baz;qux=1' testplane ...
```

Then your test will open the url of the following form: `http://localhost/test/?foo-bar=baz&qux=1`.

:warning: _Environment variables have a higher priority than the values of the corresponding variables in the plugin config._
