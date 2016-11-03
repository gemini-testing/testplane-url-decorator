'use strict';

const _ = require('lodash');
const updateUrl = require('./url-updater').updateUrl;

/**
 * Decorates gemini suite url
 * @param {Object} data
 * @param {Object} config - configuration object
 */
function decorateGeminiUrl(data, config) {
    const isRootSuite = (suite) => suite.hasOwnProperty('url');
    const filterQuery = (query, browsers) => _.pickBy(query, (value) => value.browsers(browsers));

    if (!isRootSuite(data.suite)) {
        return;
    }

    const suite = data.suite;
    suite.url = updateUrl(suite.url, filterQuery(config.query, suite.browsers));
}

/**
 * Decorates hermione browser url
 * @param {Object} browser
 * @param {Object} config - configuration object
 */
function decorateHermioneUrl(browser, config) {
    const filterQuery = (query) => _.pickBy(query, (value) => value.browsers([browser.id]));
    const baseUrlFn = browser.url;

    browser.addCommand('url', function(uri) {
        return baseUrlFn.call(this, uri ? updateUrl(uri, filterQuery(config.query)) : uri);
    }, true); // override the original method 'url'
}

module.exports = {
    decorateGeminiUrl,
    decorateHermioneUrl
};
