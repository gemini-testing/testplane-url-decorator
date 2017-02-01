'use strict';

const updateUrl = require('../../lib/url-updater').updateUrl;

describe('url-updater', () => {
    const sandbox = sinon.sandbox.create();

    const sourceUrl = '/?text=text';

    afterEach(() => sandbox.restore());

    it('should add new parameters if they do not exist in url', () => {
        const query = [
            {name: 'foo', value: 'bar'},
            {name: 'baz', value: 'boo'}
        ];

        assert.equal(updateUrl(sourceUrl, query), '/?text=text&foo=bar&baz=boo');
    });

    describe('should concat parameters', () => {
        it('by default', () => {
            const result = updateUrl(sourceUrl, [{name: 'text', value: 'foo'}]);

            assert.equal(result, '/?text=text&text=foo');
        });

        it('if mode is "concat"', () => {
            const result = updateUrl(sourceUrl, [{name: 'text', value: 'foo', mode: 'concat'}]);

            assert.equal(result, '/?text=text&text=foo');
        });

        it('specified as number', () => {
            const result = updateUrl(sourceUrl, [{name: 'text', value: 15}]);

            assert.equal(result, '/?text=text&text=15');
        });

        it('from array of values', () => {
            const result = updateUrl(sourceUrl, [{name: 'text', value: ['foo', 'bar']}]);

            assert.equal(result, '/?text=text&text=foo&text=bar');
        });
    });

    it('should override parameters if parameter mode is "override"', () => {
        const query = [{name: 'text', value: 'foo', mode: 'override'}];

        assert.equal(updateUrl(sourceUrl, query), '/?text=foo');
    });

    describe('should not add url parameters', () => {
        it('if they are specified as an empty object', () => {
            assert.equal(updateUrl(sourceUrl, [{name: 'text', value: {}}]), sourceUrl);
        });

        it('if they are specified as an object without "value" field', () => {
            assert.equal(updateUrl(sourceUrl, [{name: 'text'}]), sourceUrl);
        });

        it('if they are specified as an empty string', () => {
            assert.equal(updateUrl(sourceUrl, [{name: 'name', value: ''}]), sourceUrl);
        });

        it('if they are specified as an empty array', () => {
            assert.equal(updateUrl(sourceUrl, [{name: 'name', value: []}]), sourceUrl);
        });
    });
});
