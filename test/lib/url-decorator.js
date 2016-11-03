'use strict';

const _ = require('lodash');
const urlDecorator = require('../../lib/url-decorator');

describe('url-decorator', () => {
    const sandbox = sinon.sandbox.create();

    const mkBrowser = () => {
        const browser = {};

        browser.url = sandbox.stub().named('url');

        browser.addCommand = _.noop;
        sandbox.stub(browser, 'addCommand', (name, command) => {
            browser[name] = command.bind(browser);
        });

        return browser;
    };

    afterEach(() => sandbox.restore());

    describe('decorateGeminiUrl', () => {
        it('should skip url decoration if suite url is not defined', () => {
            const suite = {};

            urlDecorator.decorateGeminiUrl({suite});

            assert.isUndefined(suite.url);
        });

        it('should skip url decoration if suite url exists only in prototype', () => {
            const proto = {url: 'rootUrl'};
            const suite = Object.create(proto);

            urlDecorator.decorateGeminiUrl({suite});

            assert.isFalse(suite.hasOwnProperty('url'));
        });

        it('should update suite url', () => {
            const suite = {url: '/?text=text'};

            urlDecorator.decorateGeminiUrl({suite}, {
                query: {
                    foo: {
                        value: 'bar',
                        browsers: _.wrap(true)
                    }
                }
            });

            assert.equal(suite.url, '/?text=text&foo=bar');
        });
    });

    describe('decorateHermioneUrl', () => {
        it('should not redefine "url" method if it was called without parameters', () => {
            const browser = mkBrowser();
            const baseUrlFn = browser.url;

            urlDecorator.decorateHermioneUrl(browser);
            browser.url();

            assert.calledOn(baseUrlFn, browser);
            assert.calledWith(baseUrlFn, undefined);
        });

        it('should update browser url', () => {
            const browser = mkBrowser();
            const baseUrlFn = browser.url;

            urlDecorator.decorateHermioneUrl(browser, {
                query: {
                    foo: {
                        value: 'bar',
                        browsers: _.wrap(true)
                    }
                }
            });
            browser.url('/?text=text');

            assert.calledOn(baseUrlFn, browser);
            assert.calledWith(baseUrlFn, '/?text=text&foo=bar');
        });
    });
});
