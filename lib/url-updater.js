'use strict';

const url = require('url');
const _ = require('lodash');

const omitEmptyQueryParams = (query) => _.omitBy(query, (queryParam) => {
    return !_.isNumber(queryParam.value) && _.isEmpty(queryParam.value);
});

const concatValues = (currValue, srcValue, concat) => {
    return concat !== false && currValue
        ? [].concat(currValue, srcValue)
        : srcValue;
};

module.exports = (uri, query) => {
    const _url = url.parse(uri, true);
    query = omitEmptyQueryParams(query);

    // if don't remove 'search' field, then 'url.format' doesn't create new uri with added query params
    delete _url.search;

    _.mergeWith(_url.query, query, (currValue, src) => concatValues(currValue, src.value, src.concat));
    return url.format(_url);
};
