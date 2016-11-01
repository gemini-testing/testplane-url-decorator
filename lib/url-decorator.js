'use strict';

const updateUrl = require('./url-updater');

/**
 * Decorates gemini suite url
 * @param {Object} data
 * @param {Object} config - configuration object
 */
function decorateGeminiUrl(data, config) {
    const isRootSuite = (suite) => suite.hasOwnProperty('url');

    if (!isRootSuite(data.suite)) {
        return;
    }

    const suite = data.suite;
    suite.url = updateUrl(suite.url, config.query);
}

/**
 * Decorates hermione browser url
 * @param {Object} browser
 * @param {Object} config - configuration object
 */
function decorateHermioneUrl(browser, config) {
    const baseUrlFn = browser.url;

    browser.addCommand('url', function(uri) {
        return baseUrlFn.call(this, uri ? updateUrl(uri, config.query) : uri);
    }, true); // override the original method 'url'
}

module.exports = {
    decorateGeminiUrl,
    decorateHermioneUrl
};
