'use strict';

const EventEmitter = require('events').EventEmitter;
const proxyquire = require('proxyquire');

const mkTool_ = () => {
    const emitter = new EventEmitter();
    emitter.events = {
        BEGIN_SUITE: 'beginSuite',
        SESSION_START: 'sessionStart'
    };

    return emitter;
};

describe('url-decorator', () => {
    const sandbox = sinon.sandbox.create();

    let plugin;
    let tool;
    let initConfig;
    let decorateGeminiUrl;
    let decorateHermioneUrl;

    beforeEach(() => {
        initConfig = sandbox.stub();
        decorateGeminiUrl = sandbox.stub();
        decorateHermioneUrl = sandbox.stub();

        tool = mkTool_();
        sandbox.spy(tool, 'on');

        plugin = proxyquire('../../lib', {
            './config': initConfig,
            './url-decorator': {
                decorateGeminiUrl,
                decorateHermioneUrl
            }
        });
    });

    afterEach(() => sandbox.restore());

    it('should do nothing if "opts" is not an object', () => {
        plugin('gemini')(tool, null);

        assert.notCalled(tool.on);
    });

    it('should pass data emitted by gemini to url decorator', () => {
        const data = sinon.spy.named('data');

        plugin('gemini')(tool, {});
        tool.emit(tool.events.BEGIN_SUITE, data);

        assert.calledWithMatch(decorateGeminiUrl, data);
    });

    it('should pass data emitted by hermione to url decorator', () => {
        const data = sinon.spy.named('data');

        plugin('hermione')(tool, {});
        tool.emit(tool.events.SESSION_START, data);

        assert.calledWithMatch(decorateHermioneUrl, data);
    });

    it('should pass url config to url decorator', () => {
        const configUrl = {query: {text: 'hello'}};
        const expectedConfig = {query: {text: {value: 'hello', concat: true}}};

        initConfig.withArgs(configUrl, process.env).returns(expectedConfig);

        plugin('gemini')(tool, {url: configUrl});
        tool.emit(tool.events.BEGIN_SUITE);

        assert.calledWithMatch(decorateGeminiUrl, sinon.match.any, expectedConfig);
    });
});
