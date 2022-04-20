'use strict';

const _ = require('lodash');

function getEnvPrefix(name) {
    return {
        gemini: 'GEMINI_URL_QUERY_',
        hermione: 'HERMIONE_URL_QUERY_'
    }[name];
}

function getCustomQueriesEnv(name) {
    return {
        gemini: 'GEMINI_URL_CUSTOM_QUERIES',
        hermione: 'HERMIONE_URL_CUSTOM_QUERIES'
    }[name];
}

module.exports = class Config {
    constructor(config, envVars, toolName) {
        this._query = [];

        this._parseFromFile(config);
        this._parseFromEnv(envVars, toolName);

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

    _parseFromEnv(envVars, toolName) {
        const isPluginVariable = (value, name) => _.startsWith(name, getEnvPrefix(toolName)) && value;
        const resolveQueryParamName = (envVal, envKey) => _.replace(envKey, getEnvPrefix(toolName), '').toLowerCase();
        const envQueryParams = _(envVars)
            .pickBy(isPluginVariable)
            .mapKeys(resolveQueryParamName)
            .map((value, name) => ({name, value, mode: 'concat'}))
            .value();

        this._query = this._query.concat(envQueryParams);

        const customQueries = envVars[getCustomQueriesEnv(toolName)];

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
