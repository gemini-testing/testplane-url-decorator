'use strict';

const _ = require('lodash');
const initConfig = require('./lib/config').init;
const urlUpdater = require('./lib/url-updater');

module.exports = (gemini, options) => {
    if (!_.isObject(options) || options.enabled === false) {
        return;
    }

    const config = initConfig('gemini', options.url, process.env);

    gemini.on(gemini.events.BEGIN_SUITE, (data) => decorateUrl(data, config));
};

/**
 * Decorates gemini suite url
 * @param {Object} data
 * @param {Suite} data.suite
 * @param {String} data.browserId
 * @param {Object} config - configuration object
 */
function decorateUrl(data, config) {
    const suite = data.suite;

    if (!suite.hasOwnProperty('url')) {
        return;
    }

    const query = _.pickBy(config.query, (param) => param.isForBrowser(data.browserId));

    suite.url = urlUpdater.updateUrl(suite.url, query);
}
