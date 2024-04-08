'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const urlUpdater = require('../lib/url-updater');
const plugin = require('..');

const mkTestplane_ = () => {
    const emitter = new EventEmitter();
    emitter.events = {
        NEW_BROWSER: 'newBrowser'
    };

    return emitter;
};

describe('@testplane/url-decorator', () => {
    const sandbox = sinon.sandbox.create();

    let testplane;

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
        testplane = mkTestplane_();
        sandbox.spy(testplane, 'on');

        sandbox.stub(urlUpdater, 'updateUrl');
    });

    afterEach(() => sandbox.restore());

    it('should do nothing if "opts" is not an object', () => {
        plugin(testplane, null);

        assert.notCalled(testplane.on);
    });

    it('should do nothing if plugin is disabled', () => {
        plugin(testplane, {enabled: false});

        assert.notCalled(testplane.on);
    });

    it('should not decorate if it was called without parameters', () => {
        const browser = mkBrowser();
        const baseUrlFn = browser.url;

        plugin(testplane, {});

        testplane.emit(testplane.events.NEW_BROWSER, browser, {});

        browser.url();

        assert.calledWith(baseUrlFn, undefined);
    });

    it('should update browser url', () => {
        const browser = mkBrowser();
        const baseUrlFn = browser.url;

        plugin(testplane, {
            url: {
                query: [
                    {
                        name: 'foo',
                        value: 'bar'
                    }
                ]
            }
        });

        testplane.emit(testplane.events.NEW_BROWSER, browser, {});

        browser.url('/?text=text');

        assert.calledWith(baseUrlFn, '/?text=text&foo=bar');
    });

    it('should use only browser matched query parameters', () => {
        const browser = mkBrowser();
        const baseUrlFn = browser.url;

        plugin(testplane, {
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

        testplane.emit(testplane.events.NEW_BROWSER, browser, {browserId: 'foo-bro'});

        browser.url('/?text=text');

        assert.calledWith(baseUrlFn, '/?text=text&foo=foo');
    });
});
