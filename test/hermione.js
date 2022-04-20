'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const urlUpdater = require('../lib/url-updater');
const plugin = require('../hermione');

const mkHermione_ = () => {
    const emitter = new EventEmitter();
    emitter.events = {
        NEW_BROWSER: 'newBrowser'
    };

    return emitter;
};

describe('url-decorator/hermione', () => {
    const sandbox = sinon.sandbox.create();

    let hermione;

    const mkBrowser = () => {
        const browser = {};

        browser.url = sandbox.stub().named('url');

        browser.overwriteCommand = _.noop;
        sandbox.stub(browser, 'overwriteCommand', (name, command) => {
            browser[name] = command.bind(browser, browser[name]);
        });

        return browser;
    };

    beforeEach(() => {
        hermione = mkHermione_();
        sandbox.spy(hermione, 'on');

        sandbox.stub(urlUpdater, 'updateUrl');
    });

    afterEach(() => sandbox.restore());

    it('should do nothing if "opts" is not an object', () => {
        plugin(hermione, null);

        assert.notCalled(hermione.on);
    });

    it('should do nothing if plugin is disabled', () => {
        plugin(hermione, {enabled: false});

        assert.notCalled(hermione.on);
    });

    it('should not decorate if it was called without parameters', () => {
        const browser = mkBrowser();
        const baseUrlFn = browser.url;

        plugin(hermione, {});

        hermione.emit(hermione.events.NEW_BROWSER, browser, {});

        browser.url();

        assert.calledWith(baseUrlFn, undefined);
    });

    it('should update browser url', () => {
        const browser = mkBrowser();
        const baseUrlFn = browser.url;

        plugin(hermione, {
            url: {
                query: [
                    {
                        name: 'foo',
                        value: 'bar'
                    }
                ]
            }
        });

        hermione.emit(hermione.events.NEW_BROWSER, browser, {});

        browser.url('/?text=text');

        assert.calledWith(baseUrlFn, '/?text=text&foo=bar');
    });

    it('should use only browser matched query parameters', () => {
        const browser = mkBrowser();
        const baseUrlFn = browser.url;

        plugin(hermione, {
            url: {
                query: [
                    {
                        name: 'foo',
                        value: 'foo',
                        browsers: 'foo-bro'
                    },
                    {
                        name: 'bar',
                        value: 'bar',
                        browsers: 'bar-bro'
                    }
                ]
            }
        });

        hermione.emit(hermione.events.NEW_BROWSER, browser, {browserId: 'foo-bro'});

        browser.url('/?text=text');

        assert.calledWith(baseUrlFn, '/?text=text&foo=foo');
    });
});
