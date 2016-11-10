'use strict';

const _ = require('lodash');
const configInit = require('../../lib/config').init;

describe('config', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should return empty object if config and environment variables are not specified', () => {
        assert.deepEqual(configInit(), {});
    });

    it('should return empty object if environment variables are specified as empty string', () => {
        assert.deepEqual(configInit('gemini', {}, {
            'GEMINI_URL_QUERY_TEXT': ''
        }), {});
    });

    it('should return values from config if environment variables are not specified', () => {
        const configUrl = {
            query: {
                text: {
                    value: 'hello'
                }
            }
        };

        assert.deepEqual(configInit('gemini', configUrl), configUrl);
    });

    it('should return values from environment variables if config is not specified', () => {
        const envVars = {
            'GEMINI_URL_QUERY_FOO': 'bar'
        };

        const result = configInit('gemini', {}, envVars);

        assert.deepPropertyVal(result, 'query.foo.value', 'bar');
    });

    it('should override values from config by values from environment variables', () => {
        const configUrl = {
            query: {
                text: {
                    value: 'fromConfig'
                }
            }
        };

        const envVars = {
            'GEMINI_URL_QUERY_TEXT': 'fromEnv'
        };

        const result = configInit('gemini', configUrl, envVars);

        assert.deepPropertyVal(result, 'query.text.value', 'fromEnv');
    });

    it('should merge values from config and from environment variables', () => {
        const configUrl = {
            query: {
                name: {
                    value: 'gemini'
                }
            }
        };

        const envVars = {
            'GEMINI_URL_QUERY_TEXT': 'hello'
        };

        const result = configInit('gemini', configUrl, envVars);

        assert.deepPropertyVal(result, 'query.name.value', 'gemini');
        assert.deepPropertyVal(result, 'query.text.value', 'hello');
    });

    it('should use `concat` value from config if environment variables have the same url parameter', () => {
        const configUrl = {
            query: {
                text: {
                    concat: false
                }
            }
        };

        const envVars = {
            'GEMINI_URL_QUERY_TEXT': 'fromEnv'
        };

        const result = configInit('gemini', configUrl, envVars);

        assert.deepPropertyVal(result, 'query.text.value', 'fromEnv');
        assert.deepPropertyVal(result, 'query.text.concat', false);
    });

    describe('parsing url parameters from config file', () => {
        it('should return empty object if config is not an object', () => {
            assert.deepEqual(configInit('gemini', ''), {});
        });

        it('should return empty object if config is empty object', () => {
            assert.deepEqual(configInit('gemini', {}), {});
        });

        it('should set "value" field for query parameters if they are specified as a string', () => {
            const configUrl = {
                query: {
                    name: 'foo'
                }
            };

            assert.deepPropertyVal(configInit('gemini', configUrl), 'query.name.value', 'foo');
        });

        it('should set "value" field for query parameters if they are specified as an array', () => {
            const configUrl = {
                query: {
                    name: ['foo', 'bar']
                }
            };

            assert.sameMembers(configInit('gemini', configUrl).query.name.value, ['foo', 'bar']);
        });

        it('should set "concat" field as true by default', () => {
            const configUrl = {
                query: {
                    name: 'foo'
                }
            };

            assert.deepPropertyVal(configInit('gemini', configUrl), 'query.name.concat', true);
        });
    });

    describe('parsing url parameters from environment variables', () => {
        it('should return empty object if environment variables are not specified', () => {
            assert.deepEqual(configInit({}), {});
        });

        it('should return empty object if environment variables do not fit plugin', () => {
            const envVars = {
                'GEMINI_URL_QUERY': 'test'
            };

            assert.deepEqual(configInit('gemini', {}, envVars), {});
        });

        it('should parse url parameters from environment variables', () => {
            const envVars = {
                'GEMINI_URL_QUERY_PATH_DIR': 'hello/world'
            };

            const result = configInit('gemini', {}, envVars);

            assert.deepPropertyVal(result, 'query.path_dir.value', 'hello/world');
        });

        it('should parse several url parameters from environment variables', () => {
            const envVars = {
                'GEMINI_URL_QUERY_NAME': 'qwerty',
                'GEMINI_URL_QUERY_HAIR': 'ginger'
            };

            const result = configInit('gemini', {}, envVars);

            assert.deepPropertyVal(result, 'query.name.value', 'qwerty');
            assert.deepPropertyVal(result, 'query.hair.value', 'ginger');
        });
    });

    describe('matching query browsers with passed', () => {
        function mkParam_(opts) {
            const config = configInit('gemini', {
                query: {
                    foo: _.extend({value: 'some-value'}, opts)
                }
            }, {});

            return config.query.foo;
        }

        it('should accept any browser by default', () => {
            const param = mkParam_();

            assert.isTrue(param.isForBrowser('some-browser'));
        });

        it('should accept string browser criteria', () => {
            const param = mkParam_({browsers: 'some-browser'});

            assert.isTrue(param.isForBrowser('some-browser'));
            assert.isFalse(param.isForBrowser('another-browser'));
        });

        it('should accept browser criteria given as regular expression', () => {
            const param = mkParam_({browsers: /some/});

            assert.isTrue(param.isForBrowser('some-browser'));
            assert.isFalse(param.isForBrowser('another-browser'));
        });

        it('should accept multiple browser ids', () => {
            const param = mkParam_({browsers: ['browser1', 'browser2']});

            assert.isTrue(param.isForBrowser('browser1'));
            assert.isTrue(param.isForBrowser('browser2'));
            assert.isFalse(param.isForBrowser('another-browser'));
        });

        it('should accept multiple browser masks', () => {
            const param = mkParam_({browsers: [/browser1/, /browser2/]});

            assert.isTrue(param.isForBrowser('browser1'));
            assert.isTrue(param.isForBrowser('browser2'));
            assert.isFalse(param.isForBrowser('another-browser'));
        });

        it('should accept browser masks and ids', () => {
            const param = mkParam_({browsers: ['browser1', /browser2/]});

            assert.isTrue(param.isForBrowser('browser1'));
            assert.isTrue(param.isForBrowser('browser2'));
            assert.isFalse(param.isForBrowser('another-browser'));
        });
    });
});
