'use strict';

const url = require('url');
const _ = require('lodash');

const removeEmptyQueryParams = (query) => _.filter(query, (queryParam) => {
    return _.isNumber(queryParam.value) || !_.isEmpty(queryParam.value);
});

function extendQuery(urlQuery, queryParams) {
    return queryParams.reduce((result, param) => {
        const val = param.mode !== 'override' && _.has(result, param.name)
                ? _.concat([], result[param.name], param.value)
                : param.value;

        return _.set(result, param.name, val);
    }, urlQuery);
}

exports.updateUrl = (uri, query) => {
    const _url = url.parse(uri, true);
    query = removeEmptyQueryParams(query);

    // if don't remove 'search' field, then 'url.format' doesn't create new uri with added query params
    delete _url.search;

    _url.query = extendQuery(_url.query, query);
    return url.format(_url);
};
