'use strict';

const updateUrl = require('../../lib/url-updater').updateUrl;

describe('url-updater', () => {
    const sandbox = sinon.sandbox.create();

    const sourceUrl = '/?text=text';

    afterEach(() => sandbox.restore());

    it('should add new parameters if they do not exist in url', () => {
        const query = {foo: {value: 'bar'}, baz: {value: 'boo'}};

        assert.equal(updateUrl(sourceUrl, query), '/?text=text&foo=bar&baz=boo');
    });

    describe('should concat parameters', () => {
        it('by default', () => {
            const result = updateUrl(sourceUrl, {text: {value: 'foo'}});

            assert.equal(result, '/?text=text&text=foo');
        });

        it('if "concat" is true', () => {
            const result = updateUrl(sourceUrl, {text: {value: 'foo', concat: true}});

            assert.equal(result, '/?text=text&text=foo');
        });

        it('specified as number', () => {
            const result = updateUrl(sourceUrl, {text: {value: 15}});

            assert.equal(result, '/?text=text&text=15');
        });

        it('from array of values', () => {
            const result = updateUrl(sourceUrl, {text: {value: ['foo', 'bar']}});

            assert.equal(result, '/?text=text&text=foo&text=bar');
        });
    });

    it('should override parameters if "concat" is false', () => {
        const query = {text: {value: 'foo', concat: false}};

        assert.equal(updateUrl(sourceUrl, query), '/?text=foo');
    });

    describe('should not add url parameters', () => {
        it('if they are specified as an empty object', () => {
            assert.equal(updateUrl(sourceUrl, {text: {}}), sourceUrl);
        });

        it('if they are specified as an object without "value" field', () => {
            assert.equal(updateUrl(sourceUrl, {text: {concat: false}}), sourceUrl);
        });

        it('if they are specified as an empty string', () => {
            assert.equal(updateUrl(sourceUrl, {name: {value: ''}}), sourceUrl);
        });

        it('if they are specified as an empty array', () => {
            assert.equal(updateUrl(sourceUrl, {name: {value: []}}), sourceUrl);
        });
    });
});
