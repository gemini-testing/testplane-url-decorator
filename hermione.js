'use strict';

const _ = require('lodash');
const initConfig = require('./lib/config').init;
const updateUrl = require('./lib/url-updater').updateUrl;

module.exports = (hermione, options) => {
    if (!_.isObject(options) || options.enabled === false) {
        return;
    }

    const config = initConfig('hermione', options.url, process.env);

    hermione.on(hermione.events.SESSION_START, (data) => decorateUrl(data, config));
};

/**
 * Decorates hermione browser url
 * @param {Object} browser
 * @param {Object} config - configuration object
 */
function decorateUrl(browser, config) {
    const query = _.pickBy(config.query, (param) => param.isForBrowser(browser.id));
    const baseUrlFn = browser.url;

    browser.addCommand('url', function(uri) {
        return baseUrlFn.call(this, uri && updateUrl(uri, query));
    }, true); // override the original method 'url'
}
