'use strict';

const _ = require('lodash');

function getEnvPrefix(name) {
    return {
        gemini: 'GEMINI_URL_QUERY_',
        hermione: 'HERMIONE_URL_QUERY_'
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
