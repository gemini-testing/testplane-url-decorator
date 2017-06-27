'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const urlUpdater = require('../lib/url-updater');
const plugin = require('../hermione');

const mkHermione_ = () => {
    const emitter = new EventEmitter();
    emitter.events = {
        SESSION_START: 'sessionStart'
    };

    return emitter;
};

describe('url-decorator/hermione', () => {
    const sandbox = sinon.sandbox.create();

    let hermione;

    const mkBrowser = (browserId) => {
        const browser = {};

        browser.url = sandbox.stub().named('url');

        browser.browserId = browserId;
        browser.addCommand = _.noop;
        sandbox.stub(browser, 'addCommand', (name, command) => {
            browser[name] = command.bind(browser);
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

        hermione.emit(hermione.events.SESSION_START, browser);

        browser.url();

        assert.calledOn(baseUrlFn, browser);
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

        hermione.emit(hermione.events.SESSION_START, browser);

        browser.url('/?text=text');

        assert.calledOn(baseUrlFn, browser);
        assert.calledWith(baseUrlFn, '/?text=text&foo=bar');
    });

    it('should use only browser matched query parameters', () => {
        const browser = mkBrowser('foo-bro');
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

        hermione.emit(hermione.events.SESSION_START, browser);

        browser.url('/?text=text');

        assert.calledOn(baseUrlFn, browser);
        assert.calledWith(baseUrlFn, '/?text=text&foo=foo');
    });
});
