'use strict';

const configInit = require('../../lib/config').init;

describe('config', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => sandbox.restore());

    it('should return empty object if config and environments variables are not specified', () => {
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

        assert.deepEqual(configInit('gemini', {}, envVars), {query: {foo: {value: 'bar'}}});
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

        assert.deepEqual(configInit('gemini', configUrl, envVars), {query: {text: {value: 'fromEnv'}}});
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

        assert.deepEqual(configInit('gemini', configUrl, envVars), {
            query: {name: {value: 'gemini'}, text: {value: 'hello'}}
        });
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

        assert.deepEqual(configInit('gemini', configUrl, envVars), {
            query: {
                text: {
                    value: 'fromEnv',
                    concat: false
                }
            }
        });
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

            const expectedResult = {
                query: {
                    'path_dir': {
                        value: 'hello/world'
                    }
                }
            };

            assert.deepEqual(configInit('gemini', {}, envVars), expectedResult);
        });

        it('should parse several url parameters from environment variables', () => {
            const envVars = {
                'GEMINI_URL_QUERY_NAME': 'qwerty',
                'GEMINI_URL_QUERY_HAIR': 'ginger'
            };

            const expectedResult = {
                query: {
                    name: {
                        value: 'qwerty'
                    },
                    hair: {
                        value: 'ginger'
                    }
                }
            };

            assert.deepEqual(configInit('gemini', {}, envVars), expectedResult);
        });
    });
});
