if (typeof require != "undefined") {
    var buster = require("buster");
    var sinon = require("sinon");
}

buster.testCase("Buster JsTestDriver console test", {
    "should be instance of buster.eventedLogger": function () {
        buster.assert.isObject(jstestdriver);
        buster.assert(buster.eventedLogger.isPrototypeOf(jstestdriver.console));
    },
});

buster.testCase("Buster JsTestDriver TestCase test", {
    "should expose TestCase function": function () {
        buster.assert.isFunction(TestCase);
    },

    "should return function": function () {
        var testCase = TestCase();

        buster.assert.isFunction(testCase);
    },

    "should set constructor name": function () {
        var testCase = TestCase("MyTests");

        buster.assert.equals(testCase.testCaseName, "MyTests");
    },

    "should add methods to returned constructor's prototype": function () {
        var methods = {};
        var testCase = TestCase("MyTests", methods);

        buster.assert.same(testCase.prototype, methods);
    },

    "should fire onCreate callback": function () {
        var listener = sinon.spy();
        TestCase.onCreate(listener);

        TestCase("SomeNiceTests");

        buster.assert(listener.calledOnce);
        buster.assert.equals(listener.args[0][0].testCaseName, "SomeNiceTests");
    }
});

buster.testCase("Buster JsTestDriver parse test", {
    "should expose test case name": function () {
        var context = TestCase("MyTests").parse();

        buster.assert.equals(context.name, "MyTests");
    },

    "should expose setUp": function () {
        var setUp = function () {};
        var context = TestCase("SomeTests", { setUp: setUp }).parse();

        buster.assert.equals(context.setUp, setUp);
    },

    "should expose tearDown": function () {
        var tearDown = function () {};
        var context = TestCase("SomeTests", { tearDown: tearDown }).parse();

        buster.assert.equals(context.tearDown, tearDown);
    },

    "should expose function starting with 'test' as test": function () {
        var test = function () {};
        var context = TestCase("SomeTests", { testSomething: test }).parse();

        buster.assert.equals(context.tests.length, 1);
        buster.assert.equals(context.tests[0].func, test);
        buster.assert.equals(context.tests[0].name, "testSomething");
    },

    "should not expose function not starting with 'test' as test": function () {
        var context = TestCase("SomeTests", { something: function () {} }).parse();

        buster.assert.equals(context.tests, []);
    },

    "should expose all functions starting with 'test' as tests": function () {
        var context = TestCase("SomeTests", {
            test1: function () {}, test2: function () {}, test3: function () {}
        }).parse();

        buster.assert.equals(context.tests.length, 3);
    },

    "should copy non-test to testCase object": function () {
        var helper = function () {};
        var context = TestCase("SomeTests", { helper: helper }).parse();

        buster.assert.equals(buster.keys(context.testCase), ["helper"]);
        buster.assert.equals(context.testCase.helper, helper);
    },

    "should not copy setUp to testCase object": function () {
        var setUp = function () {};
        var context = TestCase("SomeTests", { setUp: setUp }).parse();

        buster.assert.isUndefined(context.testCase.setUp);
    },

    "should not copy tearDown to testCase object": function () {
        var tearDown = function () {};
        var context = TestCase("SomeTests", { tearDown: tearDown }).parse();

        buster.assert.isUndefined(context.testCase.tearDown);
    }
});
