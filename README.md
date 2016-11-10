# url-decorator

[![npm](https://img.shields.io/npm/v/gemini.svg?maxAge=2592000)](https://www.npmjs.com/package/url-decorator)
[![Build Status](https://travis-ci.org/gemini-testing/url-decorator.svg?branch=master)](https://travis-ci.org/gemini-testing/url-decorator)
[![Coverage Status](https://img.shields.io/coveralls/gemini-testing/url-decorator.svg?style=flat)](https://coveralls.io/r/gemini-testing/url-decorator?branch=master)

Common plugin for:

* [gemini](https://github.com/gemini-testing/gemini)
* [hermione](https://github.com/gemini-testing/hermione) 

which is intended to change test urls in runtime. 

You can read more about gemini plugins [here](https://github.com/gemini-testing/gemini/blob/master/doc/plugins.md)
and hermione plugins [here](https://github.com/gemini-testing/hermione#plugins).

## Installation

```bash
npm install url-decorator
```

## Usage

### Configuration

* **enabled** (optional) `Boolean` – enable/disable the plugin; by default plugin is enabled
* **url** (optional) `Object` - the list of url parameters, which will be added in each test url
    * **query** (optional) `Object` - the list of query parameters
        * **queryParam** (optional) `Object` - name of query parameter
            * **value** (optional) `String` - value of query parameter
            * **concat** (optional) `Boolean` - enable/disable concatenation; by default is `true`
            * **browsers** (optional) `String|RegExp|Array<String|RegExp>` - browsers condition. Query parameter
will be applied only for configured browsers.

### Gemini usage

Add plugin to your `gemini` config file:

```yaml
system:
  plugins:
    url-decorator/gemini: true
```

To pass additional url parameters you can use environment variables, which should start with `GEMINI_URL_` or specify them in the `gemini` config file.

For example, you have the following test url: `http://localhost/test/?name=bilbo` and you want to add query parameter via environment variable:

```bash
GEMINI_URL_QUERY_TEXT=ololo gemini test
```

After that your test url will be changed to: `http://localhost/test/?name=bilbo&text=ololo`.

The same thing you can do using `gemini` config file:

```yaml
url-decorator/gemini:
  url:
    query:
      text:
        value: ololo
      # or
      text: ololo
```

Note: environment variables have higher priority than config values.

### Hermione usage

Add plugin to your `hermione` config file:

```js
module.exports = {
    // ...

    plugins: {
        'url-decorator/hermione': true
    },

    // ...
};
```

To pass additional url parameters you can use environment variables, which should start with `HERMIONE_URL_` or specify them in the `hermione` config file.

For example, you have the following test url: `http://localhost/test/?name=hermione` and you want to add query parameter via environment variable:

```bash
HERMIONE_URL_QUERY_TEXT=ololo hermione
```

After that your test url will be changed to: `http://localhost/test/?name=hermione&text=ololo`.

The same thing you can do using `hermione` config file:

```js
'url-decorator/hermione': {
    url: {
        query: {
            text: {
                value: 'ololo'
            }
            // or
            text: 'ololo'
        }
    }
}
```

Note: environment variables have higher priority than config values.

### Concatenation of url parameters

In previous example you have seen how add url parameters. Now we look how to concat and override url parameters.

Suppose, you want to add query parameter `name` which is already presented in your test url: `http://localhost/test/?name=bilbo` and you don't want to override it:

```yaml
url-decorator/gemini:
  url:
    query:
      name:
        value: torin
        concat: true
      # or
      name:
        value: torin
      # or
      name: torin

```

The result url will look like: `http://localhost/test/?name=bilbo&name=torin`. How you understand, the result will be the same if `concat` would be any value except `false`.

Moreover for previous test url you can specify a set of values for one query parameter:

```yaml
url-decorator/gemini:
  url:
    query:
      name:
        value:
          - torin
          - gloin
      # or
      name:
        - torin
        - gloin
```

The result url will look like: `http://localhost/test/?name=bilbo&name=torin&name=gloin`

If you want to override value of `name` query parameter:

```yaml
url-decorator/gemini:
  url:
    query:
      name:
        value: torin
        concat: false
```

As a result url will look like: `http://localhost/test/?name=torin`.

You can do the same thing via environment variables. In this case concat value will be used from config to the same url parameter:

```bash
GEMINI_URL_QUERY_NAME=gloin gemini test
```

The result url will look like: `http://localhost/test/?name=gloin`

### Browser conditions

`url-decorator` gives the opportunity to set each of query parameters only for
specified browser(s).

Browsers can be:

* single browser id string
* array of multiple browser ids
* browser mask (regular expression)
* array of browser masks

Examples:

```yaml
url-decorator/gemini:
  url:
    query:
      name:
        value: torin
        browsers: firefox
```

```yaml
url-decorator/gemini:
  url:
    query:
      name:
        value: torin
        browsers:
         - firefox
         - chrome
```

```js
url-decorator/gemini: {
    url: {
        query: {
            name: {
                value: 'torin',
                browsers: /ie-\d+/  //ie-8, ie-9, ie-10, ...
            }
        }
    }
}
```

```js
url-decorator/gemini: {
    url: {
        query: {
            name: {
                value: 'torin',
                browsers: [/ie-\d+/, 'firefox']
            }
        }
    }
}
```
