'use strict';

const _ = require('lodash');

function getEnvPrefix(name) {
    return {
        gemini: 'GEMINI_URL_',
        hermione: 'HERMIONE_URL_'
    }[name];
}

/**
 * @param  {String} value
 * @param  {String} name
 *
 * @example
 * parseUrlEnvVar('awesome-value', 'query_my_text') → {query: {'my_text': {value: 'awesome-value'}}}
 */
function parseUrlEnvVar(value, name) {
    const matched = name.match(/^(.*?)_(.+)/);

    return matched ? _.set({}, [matched[1], matched[2], 'value'], value) : {};
}

function parseQuery(query) {
    return _.mapValues(query, (value) => _.isPlainObject(value) ? value : {value, concat: true});
}

function parseFromFile(config) {
    return _.isEmpty(config)
        ? {}
        : _.extend(config, {query: parseQuery(config.query)});
}

const parseFromEnv = (envVars, toolName) => {
    return _(envVars)
        .pickBy((value, name) => _.startsWith(name, getEnvPrefix(toolName)) && value)
        .mapKeys((envVal, envKey) => _.replace(envKey, getEnvPrefix(toolName), '').toLowerCase())
        .transform((result, envVal, envKey) => _.merge(result, parseUrlEnvVar(envVal, envKey)))
        .value();
};

function mkBrowserMatcher(matchers) {
    if (!matchers) {
        return () => true;
    }

    matchers = [].concat(matchers);
    return (browser) => matchers.some((matcher) => {
        return _.isRegExp(matcher) ? matcher.test(browser) : matcher === browser;
    });
}

/**
 * Initialize configuration
 * @param {String} toolName - name of tool (gemini|hermione)
 * @param {Object} config - plugin configuration object
 * @param {Object} envVars - environment variables
 * @returns {Object}
 */
exports.init = (toolName, config, envVars) => {
    config = _.merge(
        parseFromFile(config),
        parseFromEnv(envVars, toolName)
    );

    _.forEach(config.query, (param) => param.isForBrowser = mkBrowserMatcher(param.browsers));

    return config;
};
