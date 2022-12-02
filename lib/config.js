'use strict';

const _ = require('lodash');

const ENV_PREFIX = 'HERMIONE_URL_QUERY_';
const CUSTOM_QUERIES_ENV = 'HERMIONE_URL_CUSTOM_QUERIES';

module.exports = class Config {
    constructor(config, envVars) {
        this._query = [];

        this._parseFromFile(config);
        this._parseFromEnv(envVars);

        this._query = _.map(this._query, this._mkBrowserMatcher);
    }

    getQueryForBrowser(browserId) {
        return _.filter(this._query, (param) => param.isForBrowser(browserId));
    }

    _parseFromFile(config) {
        config = _.defaultsDeep(config || {}, {query: []});

        this._query = _.isPlainObject(config.query)
            ? _.map(config.query, (value, key) => ({name: key, value}))
            : config.query;

        this._query = _.map(this._query, (item) => _.defaults(item, {mode: 'concat'}));
    }

    _parseFromEnv(envVars) {
        const isPluginVariable = (value, name) => _.startsWith(name, ENV_PREFIX) && value;
        const resolveQueryParamName = (envVal, envKey) => _.replace(envKey, ENV_PREFIX, '').toLowerCase();
        const envQueryParams = _(envVars)
            .pickBy(isPluginVariable)
            .mapKeys(resolveQueryParamName)
            .map((value, name) => ({name, value, mode: 'concat'}))
            .value();

        this._query = this._query.concat(envQueryParams);

        const customQueries = envVars[CUSTOM_QUERIES_ENV];

        if (customQueries) {
            const extraQueries = customQueries
                .split(';')
                .map((pair) => {
                    const [key, ...rawValue] = pair.split('=');

                    return {
                        name: key,
                        value: rawValue.join('='),
                        mode: 'concat'
                    };
                });
            this._query = this._query.concat(extraQueries);
        }
    }

    _mkBrowserMatcher(queryParam) {
        if (!queryParam.browsers) {
            queryParam.isForBrowser = () => true;
        } else {
            queryParam.browsers = [].concat(queryParam.browsers);
            queryParam.isForBrowser = (browser) => queryParam.browsers.some((matcher) => {
                return _.isRegExp(matcher) ? matcher.test(browser) : matcher === browser;
            });
        }

        return queryParam;
    }
};
