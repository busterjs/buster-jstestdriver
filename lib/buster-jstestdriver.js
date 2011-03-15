if (typeof require != "undefined") {
    var buster = require("buster");
}

buster.jstd = buster.jstd || {};

buster.jstd.TestCase = function (name, tests) {
    var constructor = function () {};
    constructor.prototype = tests || {};
    constructor.testCaseName = name;
    constructor.parse = buster.jstd.parse;
    var callbacks = buster.jstd.TestCase.callbacks || [];

    for (var i = 0, l = callbacks.length; i < l; ++i) {
        callbacks[i](constructor);
    }

    return constructor;
};

buster.jstd.TestCase.onCreate = function (callback) {
    this.callbacks = this.callbacks || [];
    this.callbacks.push(callback);
};

buster.jstd.parse = function () {
    var tests = [], testCase = {};

    for (var prop in this.prototype) {
        if (/^test/.test(prop)) {
            tests.push({ name: prop, func: this.prototype[prop] });
        } else if (!/^(setUp|tearDown)$/.test(prop)) {
            testCase[prop] = this.prototype[prop]
        }
    }

    return {
        name: this.testCaseName,
        setUp: this.prototype.setUp,
        tearDown: this.prototype.tearDown,
        tests: tests,
        testCase: testCase
    };
};

buster.jstd.console = buster.create(buster.eventedLogger);

if (typeof global != "undefined") {
    global.TestCase = buster.jstd.TestCase;
    global.jstestdriver = { console: buster.jstd.console };
}

if (typeof module != "undefined") {
    module.exports = buster.jstd;
}
