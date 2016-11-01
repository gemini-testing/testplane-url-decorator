'use strict';

const _ = require('lodash');
const urlDecorator = require('./url-decorator');
const initConfig = require('./config').init;

function selectTool(tool, name) {
    return {
        gemini: {
            event: tool.events.BEGIN_SUITE,
            decorator: urlDecorator.decorateGeminiUrl
        },
        hermione: {
            event: tool.events.SESSION_START,
            decorator: urlDecorator.decorateHermioneUrl
        }
    }[name];
}

/**
 * Initialize plugin for tool with given name
 * @param {String} name of tool (gemini|hermione)
 * @returns {Function}
 */
module.exports = (name) => {
    return (tool, opts) => {
        if (!_.isObject(opts) || opts.enabled === false) {
            return;
        }

        const config = initConfig(name, opts.url, process.env);
        const meta = selectTool(tool, name);

        tool.on(meta.event, (data) => meta.decorator(data, config));
    };
};
