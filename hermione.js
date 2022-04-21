'use strict';

const _ = require('lodash');
const Config = require('./lib/config');
const updateUrl = require('./lib/url-updater').updateUrl;

module.exports = (hermione, options) => {
    if (!_.isObject(options) || options.enabled === false) {
        return;
    }

    const config = new Config(options.url, process.env, 'hermione');

    hermione.on(hermione.events.NEW_BROWSER, (session, meta) => {
        meta = meta || {};
        decorateUrl(session, config.getQueryForBrowser(meta.browserId));
    });
};

/**
 * Decorates hermione browser url
 * @param {Object} session instance
 * @param {Object} query
 */
function decorateUrl(session, query) {
    session.overwriteCommand('url', (baseUrlFn, uri) => baseUrlFn(uri && updateUrl(uri, query)));
}
