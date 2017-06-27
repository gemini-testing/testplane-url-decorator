'use strict';

const _ = require('lodash');
const Config = require('./lib/config');
const updateUrl = require('./lib/url-updater').updateUrl;

module.exports = (hermione, options) => {
    if (!_.isObject(options) || options.enabled === false) {
        return;
    }

    const config = new Config(options.url, process.env, 'hermione');

    hermione.on(hermione.events.SESSION_START, (session) => {
        decorateUrl(session, config.getQueryForBrowser(session.browserId));
    });
};

/**
 * Decorates hermione browser url
 * @param {Object} session instance
 * @param {Object} query
 */
function decorateUrl(session, query) {
    const baseUrlFn = session.url;

    session.addCommand('url', function(uri) {
        return baseUrlFn.call(this, uri && updateUrl(uri, query));
    }, true); // override the original method 'url'
}
