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
    setUp: function () {
        sinon.stub(buster.test, "autoRun").returns(function () {});
    },

    tearDown: function () {
        buster.test.autoRun.restore();
    },

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
    }
});

buster.testCase("Buster JsTestDriver parse test", {
    setUp: function () {
        sinon.stub(buster.test, "autoRun").returns(function () {});
    },

    tearDown: function () {
        buster.test.autoRun.restore();
    },

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

buster.testCase("Buster JsTestDriver auto running", {
    setUp: function () {
        delete buster.jstd.TestCase.run;
        sinon.stub(buster.test, "autoRun").returns(function () {});
    },

    tearDown: function () {
        buster.test.autoRun.restore();
    },

    "should call autoRun when creating testCase": function () {
        TestCase("Some tests");

        buster.assert(buster.test.autoRun.calledOnce);
    },

    "should only call autoRun for the first test case": function () {
        TestCase("Some tests");
        TestCase("Some tests");

        buster.assert(buster.test.autoRun.calledOnce);
    },

    "should call runner returned from autoRun with test case": function () {
        var run = sinon.spy();
        buster.test.autoRun.returns(run);
        var testCase = TestCase("Some tests");

        buster.assert(run.calledOnce);
        buster.assert(run.calledWith(testCase));
    },

    "should always yield test case to runner": function () {
        var run = sinon.spy();
        buster.test.autoRun.returns(run);
        var testCase = TestCase("Some tests");
        var testCase2 = TestCase("Some tests");

        buster.assert(run.calledWith(testCase));
        buster.assert(run.calledWith(testCase2));
    }
});
