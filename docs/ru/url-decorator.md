# url-decorator

## Обзор

Используйте плагин `url-decorator`, чтобы автоматически дополнять урлы в hermione-тестах нужными query-параметрами.

## Установка

```bash
npm install -D url-decorator
```

## Настройка

Необходимо подключить плагин в разделе `plugins` конфига `hermione`:

```javascript
module.exports = {
    plugins: {
        'url-decorator': {
            enabled: true,
            url: {
                query: [
                    {
                        name: 'text',
                        value: 'foo'
                    },

                    // другие query-параметры...
                ]
            }
        },

        // другие плагины гермионы...
    },

    // другие настройки гермионы...
};
```

### Расшифровка параметров конфигурации

| **Параметр** | **Тип** | **По&nbsp;умолчанию** | **Описание** |
| ------------ | ------- | --------------------- | ------------ |
| [enabled](#enabled) | Boolean | true | Включить / отключить плагин. |
| [url](#url) | Object | _N/A_ | Объект с описанием query-параметров, которые должны добавляться к каждому урлу в тесте. |

### enabled

Включить или отключить плагин. По умолчанию: `true`.

### url

Параметр `url` представляет собой объект с полем `query`, значением которого может быть как массив, так и объект.

**query как массив**

```javascript
module.exports = {
    plugins: {
        'url-decorator': {
            enabled: true,
            url: {
                query: [
                    {
                        name: '<param-1>', // укажите имя query-параметра
                        value: '<param-1-value>', // укажите значение query-параметра
                        mode: 'concat', // или 'override'
                        browsers: /.*/ // по умолчанию: для всех браузеров
                    },
                    {
                        name: '<param-2>', // укажите имя query-параметра
                        value: '<param-2-value>', // укажите значение query-параметра
                        mode: 'concat', // или 'override'
                        browsers: /.*/ // по умолчанию: для всех браузеров
                    },

                    // остальные query-параметры...
                ]
            }
        },

        // другие плагины гермионы...
    },

    // другие настройки гермионы...
};
```

**query как объект**

```javascript
module.exports = {
    plugins: {
        'url-decorator': {
            enabled: true,
            url: {
                query: {
                    '<param-1>': { // укажите имя query-параметра
                        value: '<param-1-value>', // укажите значение query-параметра
                        mode: 'concat', // или 'override'
                        browsers: /.*/ // по умолчанию: для всех браузеров
                    },
                    '<param-2>': { // укажите имя query-параметра
                        value: '<param-2-value>', // укажите значение query-параметра
                        mode: 'concat', // или 'override'
                        browsers: /.*/ // по умолчанию: для всех браузеров
                    },

                    // остальные query-параметры...
                }
            },
        },

        // другие плагины гермионы...
    },

    // другие настройки гермионы...
};
```

Здесь query-параметр &mdash; это объект со следующими полями:

| **Параметр** | **Тип** | **По&nbsp;умолчанию** | **Описание** |
| ------------ | ------- | --------------------- | ------------ |
| [name](#name) | String | _N/A_ | Имя query-параметра. Если _query_ задается как объект, то это поле не указывается, так как сам ключ является именем query-параметра. |
| [value](#value) | String или Number или Array | _N/A_ | Значение query-параметра. |
| [mode](#mode) | String | "concat" | Режим объединения параметров: _concat_ или _override_. |
| [browsers](#browsers) | String или RegExp или Array | _N/A_ | Список браузеров, к которым будет применен query-параметр. |

#### name

Имя query-параметра. Если `query` задается как объект, то это поле не указывается, так как сам ключ является именем query-параметра.

#### value

Значение query-параметра. Может задаваться как строка, число или массив строк и/или чисел.

#### mode

Режим объединения параметров. Возможны 2 значения: `concat` _(склеивать параметры)_ и `override` _(перетирать параметры)_. По умолчанию: `concat`.

**Режим concat**

Например:
- вы хотите добавить query-параметр `nick`, который уже есть в урле вашего теста `http://localhost/test/?nick=bilbo`;
- при этом вы не хотите, чтобы дополнительное значение параметра `nick` перетерло то значение, что уже есть в урле.

В этом случае вам нужно указать для параметра `mode: 'concat'` или вообще не указывать `mode` (воспользовавшись режимом по умолчанию):

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: 'torin',
            mode: 'concat' // или можно вообще не указывать mode, так как по умолчанию mode = 'concat'
        }
    ]
}
```

Тогда результирующим урлом в тесте будет: `http://localhost/test/?nick=bilbo&nick=torin`.

Также вы можете указать в значении `value` массив значений для параметра `nick`:

```javascript
url: {
    query: [
        {
            name: 'nick',
            value: ['torin', 'gloin'],
            mode: 'concat' // или можно вообще не указывать mode, так как по умолчанию mode = 'concat'
        }
    ]
}
```

Тогда результирующим урлом в тесте будет: `http://localhost/test/?nick=bilbo&nick=torin&nick=gloin`.

**Режим override**

Если же вы хотите перетереть параметр `nick`, то нужно установить режим `override`:

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

Тогда результирующим урлом в тесте будет: `http://localhost/test/?nick=torin`.

#### browsers

Браузер или список браузеров, или паттерн регулярного выражения для браузеров, к которым нужно применять заданные query-параметры. Если параметр `browsers` не указан, то query-параметры будут применяться для всех браузеров.

Ниже приведены примеры задания параметра `browsers` всеми способами:

**строка**

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

**массив строк**

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

**массив regexp / строк**

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

### Передача параметров через CLI

#### HERMIONE_URL_QUERY_*

Чтобы передать дополнительные query-параметры, можно воспользоваться переменными окружения следующего вида:

```bash
HERMIONE_URL_QUERY_<имя query-параметра>
```

Например, в вашем тесте открывается урл `http://localhost/test/?tool=hermione`, а вы хотите добавить к урлу query-параметр `text` со значением `ololo` с помощью переменной окружения:

```bash
HERMIONE_URL_QUERY_TEXT=ololo hermione ...
```

После этого в вашем тесте будет открываться урл вида: `http://localhost/test/?tool=hermione&text=ololo`.

#### HERMIONE_URL_CUSTOM_QUERIES

Если среди ваших query-параметров есть параметры, которые нельзя выразить в виде переменной окружения (например, `foo-bar`), то вы можете добавить эти параметры через переменную окружения `HERMIONE_URL_CUSTOM_QUERIES`.

В качестве значения используйте строку вида `<query-param-1>=<value-1>;<query-param-2>=<value-2>;`.

Например:

```bash
HERMIONE_URL_CUSTOM_QUERIES='foo-bar=baz;qux=1' hermione ...
```

Тогда в вашем тесте будет открываться урл вида: `http://localhost/test/?foo-bar=baz&qux=1`.

:warning: _Переменные окружения имеют более высокий приоритет, чем значения соответствующих переменных в конфиге плагина._
