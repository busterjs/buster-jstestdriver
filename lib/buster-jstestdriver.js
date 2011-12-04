if (typeof require != "undefined") {
    var buster = require("buster");
}

function fail(msg) {
    buster.assert.fail(msg);
}

buster.jstd = buster.jstd || {};

buster.jstd.TestCase = function (name, tests) {
    var constructor = function () {};
    constructor.prototype = tests || {};
    constructor.testCaseName = name;
    constructor.parse = buster.jstd.parse;

    if (!buster.jstd.TestCase.run && buster.autoRun) {
        buster.jstd.TestCase.run = buster.autoRun();
    }

    if (buster.jstd.TestCase.run) {
        buster.jstd.TestCase.run(constructor);
    }

    if (buster.addTestContext) {
        buster.addTestContext(constructor);
    }

    return constructor;
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

if (typeof require == "function") {
    buster.jstd.configure = require("./buster-extension");
}

if (buster.console) {
    buster.jstd.console = buster.console;
} else {
    buster.jstd.console = buster.create(buster.eventedLogger);
}

if (typeof global != "undefined") {
    global.TestCase = buster.jstd.TestCase;
    global.jstestdriver = { console: buster.jstd.console };
}

if (typeof window != "undefined") {
    window.TestCase = buster.jstd.TestCase;
    window.jstestdriver = { console: buster.jstd.console };
}

if (typeof module != "undefined") {
    module.exports = buster.jstd;
}
