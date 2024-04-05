'use strict';

const Config = require('../../lib/config');

describe('lib/config', () => {
    describe('parse query parameters from configuration file', () => {
        it('should use query from given configuration', () => {
            const config = new Config({query: [
                {
                    name: 'foo',
                    value: 'bar'
                }
            ]}, {});

            const query = config.getQueryForBrowser('some-browser');

            assert.lengthOf(query, 1);
            assert.match(query[0], {name: 'foo', value: 'bar'});
        });

        it('should set "concat" mode by default', () => {
            const config = new Config({query: [
                {
                    name: 'foo',
                    value: 'bar'
                }
            ]}, {});

            const query = config.getQueryForBrowser('some-browser');

            assert.propertyVal(query[0], 'mode', 'concat');
        });

        it('should use given mode if it set directly', () => {
            const config = new Config({query: [
                {
                    name: 'foo',
                    value: 'bar',
                    mode: 'override'
                }
            ]}, {});

            const query = config.getQueryForBrowser('some-browser');

            assert.propertyVal(query[0], 'mode', 'override');
        });

        it('should accept query given as object', () => {
            const config = new Config({query: {foo: 'bar'}}, {});

            const query = config.getQueryForBrowser('some-browser');

            assert.lengthOf(query, 1);
            assert.match(query[0], {name: 'foo', value: 'bar'});
        });
    });

    describe('parse query parameters from environment variables', () => {
        it('should use "TESTPLANE_URL_QUERY" prefixed parameters', () => {
            const config = new Config({query: []}, {
                TESTPLANE_URL_QUERY_FOO: 'bar'
            });

            const query = config.getQueryForBrowser('some-browser');

            assert.lengthOf(query, 1);
            assert.match(query[0], {name: 'foo', value: 'bar'});
        });

        it('should not use another environment parameters', () => {
            const config = new Config({query: []}, {
                TESTPLANE_URL_QUERY_FOO: 'bar',
                SOME_ANOTHER_QUERY_PARAM: 'another-value'
            });

            const query = config.getQueryForBrowser('some-browser');

            assert.lengthOf(query, 1);
        });

        it('should append query parameter from env variable if it does not exists in config', () => {
            const config = new Config({query: [
                {
                    name: 'foo',
                    value: 'foo value'
                }
            ]}, {
                TESTPLANE_URL_QUERY_BAR: 'bar value'
            });

            const query = config.getQueryForBrowser('some-browser');

            assert.lengthOf(query, 2);
            assert.match(query[0], {name: 'foo', value: 'foo value'});
            assert.match(query[1], {name: 'bar', value: 'bar value'});
        });

        it('should concat parameter from env variable to existent query parameters', () => {
            const config = new Config({query: [
                {
                    name: 'foo',
                    value: 'foo value'
                }
            ]}, {
                TESTPLANE_URL_QUERY_FOO: 'another foo value'
            });

            const query = config.getQueryForBrowser('some-browser');

            assert.lengthOf(query, 2);
            assert.match(query[0], {name: 'foo', value: 'foo value'});
            assert.match(query[1], {name: 'foo', value: 'another foo value'});
        });

        it('should apply query parameters from env variable for all browsers', () => {
            const config = new Config({query: []}, {
                TESTPLANE_URL_QUERY_FOO: 'bar'
            });

            const query = config.getQueryForBrowser('some-browser');

            assert.equal(query[0].isForBrowser.toString(), '() => true');
        });

        it('should use "concat" mode for query parameter from env variable', () => {
            const config = new Config({query: []}, {
                TESTPLANE_URL_QUERY_FOO: 'bar'
            });

            const query = config.getQueryForBrowser('some-browser');

            assert.equal(query[0].mode, 'concat');
        });

        it('should parse extra queries from env', () => {
            const config = new Config({query: []}, {
                TESTPLANE_URL_CUSTOM_QUERIES: 'foo-bar=baz;qux=baz=1'
            });

            const query = config.getQueryForBrowser('some-browser');

            assert.lengthOf(query, 2);
            assert.match(query[0], {name: 'foo-bar', value: 'baz'});
            assert.match(query[1], {name: 'qux', value: 'baz=1'});
        });
    });

    describe('getQueryForBrowser', () => {
        describe('should return query items', () => {
            it('without browsers criteria', () => {
                const config = new Config({query: [
                    {
                        name: 'foo',
                        value: 'bar'
                    }
                ]}, {});

                const query = config.getQueryForBrowser('some-browser');

                assert.match(query[0], {name: 'foo', value: 'bar'});
            });

            it('specified as single browser identifier', () => {
                const config = new Config({query: [
                    {
                        name: 'foo',
                        value: 'bar',
                        browsers: 'bro1'
                    }
                ]}, {});

                const query = config.getQueryForBrowser('bro1');

                assert.match(query[0], {name: 'foo', value: 'bar'});
                assert.lengthOf(config.getQueryForBrowser('another-bro'), 0);
            });

            it('specified as set of browser identifiers', () => {
                const config = new Config({query: [
                    {
                        name: 'foo',
                        value: 'bar',
                        browsers: ['bro1', 'bro2']
                    }
                ]}, {});

                const query1 = config.getQueryForBrowser('bro1');
                const query2 = config.getQueryForBrowser('bro2');

                assert.match(query1[0], {name: 'foo', value: 'bar'});
                assert.match(query2[0], {name: 'foo', value: 'bar'});

                assert.lengthOf(config.getQueryForBrowser('another-bro'), 0);
            });

            it('specified as single mask', () => {
                const config = new Config({query: [
                    {
                        name: 'foo',
                        value: 'bar',
                        browsers: /bro1/
                    }
                ]}, {});

                const query = config.getQueryForBrowser('bro1');

                assert.match(query[0], {name: 'foo', value: 'bar'});
                assert.lengthOf(config.getQueryForBrowser('another-bro'), 0);
            });

            it('specified as set of browser masks', () => {
                const config = new Config({query: [
                    {
                        name: 'foo',
                        value: 'bar',
                        browsers: [/bro1/, /bro2/]
                    }
                ]}, {});

                const query1 = config.getQueryForBrowser('bro1');
                const query2 = config.getQueryForBrowser('bro2');

                assert.match(query1[0], {name: 'foo', value: 'bar'});
                assert.match(query2[0], {name: 'foo', value: 'bar'});

                assert.lengthOf(config.getQueryForBrowser('another-bro'), 0);
            });

            it('specified as mixed set of browser ids and masks', () => {
                const config = new Config({query: [
                    {
                        name: 'foo',
                        value: 'bar',
                        browsers: ['bro1', /bro2/]
                    }
                ]}, {});

                const query1 = config.getQueryForBrowser('bro1');
                const query2 = config.getQueryForBrowser('bro2');

                assert.match(query1[0], {name: 'foo', value: 'bar'});
                assert.match(query2[0], {name: 'foo', value: 'bar'});

                assert.lengthOf(config.getQueryForBrowser('another-bro'), 0);
            });
        });
    });
});
