'use strict';

const _ = require('lodash');
const Config = require('./lib/config');
const urlUpdater = require('./lib/url-updater');

module.exports = (gemini, options) => {
    if (!_.isObject(options) || options.enabled === false) {
        return;
    }

    const config = new Config(options.url, process.env, 'gemini');

    gemini.on(gemini.events.BEGIN_SUITE, (data) => decorateUrl(data, config));
};

/**
 * Decorates gemini suite url
 * @param {Object} data
 * @param {Suite} data.suite
 * @param {String} data.browserId
 * @param {Config} config - configuration instance
 */
function decorateUrl(data, config) {
    const suite = data.suite;

    if (!suite.hasOwnProperty('url')) {
        return;
    }

    suite.url = urlUpdater.updateUrl(suite.url, config.getQueryForBrowser(data.browserId));
}
