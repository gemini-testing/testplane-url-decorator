'use strict';

const _ = require('lodash');
const initConfig = require('./lib/config').init;
const updateUrl = require('./lib/url-updater').updateUrl;

module.exports = (hermione, options) => {
    if (!_.isObject(options) || options.enabled === false) {
        return;
    }

    const config = initConfig('hermione', options.url, process.env);

    hermione.on(hermione.events.SESSION_START, (session, meta) => {
        meta = meta || {};
        decorateUrl(session, meta.browserId, config);
    });
};

/**
 * Decorates hermione browser url
 * @param {Object} session instance
 * @param {String} browserId - browser identifier
 * @param {Object} config - configuration object
 */
function decorateUrl(session, browserId, config) {
    const query = _.pickBy(config.query, (param) => param.isForBrowser(browserId));
    const baseUrlFn = session.url;

    session.addCommand('url', function(uri) {
        return baseUrlFn.call(this, uri && updateUrl(uri, query));
    }, true); // override the original method 'url'
}
