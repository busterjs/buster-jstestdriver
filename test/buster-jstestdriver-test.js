if (typeof module === "object" && typeof require === "function") {
    var buster = require("buster");
    require("../lib/buster-jstestdriver");
    var busterJstd = require("../lib/extension");
    var path = require("path");
    var when = require("when");
}

var assert = buster.referee.assert;
var refute = buster.referee.refute;

buster.testCase("Buster JsTestDriver", {
    "console": {
        "is instance of buster.eventedLogger": function () {
            assert.isObject(jstestdriver);
            assert(buster.eventedLogger.isPrototypeOf(jstestdriver.console));
        }
    },

    "TestCase": {
        setUp: function () {
            this.stub(buster, "autoRun").returns(function () {});
        },

        "exposes TestCase function": function () {
            assert.isFunction(TestCase);
        },

        "returns function": function () {
            var testCase = TestCase();

            assert.isFunction(testCase);
        },

        "sets constructor name": function () {
            var testCase = TestCase("MyTests");

            assert.equals(testCase.testCaseName, "MyTests");
        },

        "adds methods to returned constructor's prototype": function () {
            var methods = {};
            var testCase = TestCase("MyTests", methods);

            assert.same(testCase.prototype, methods);
        }
    },

    "parse": {
        setUp: function () {
            this.stub(buster, "autoRun").returns(function () {});
        },

        "exposes test case name": function () {
            var context = TestCase("MyTests").parse();

            assert.equals(context.name, "MyTests");
        },

        "exposes setUp": function () {
            var setUp = function () {};
            var context = TestCase("SomeTests", { setUp: setUp }).parse();

            assert.equals(context.setUp, setUp);
        },

        "exposes tearDown": function () {
            var tearDown = function () {};
            var context = TestCase("SomeTests", { tearDown: tearDown }).parse();

            assert.equals(context.tearDown, tearDown);
        },

        "exposes function starting with 'test' as test": function () {
            var test = function () {};
            var context = TestCase("SomeTests", { testSomething: test }).parse();

            assert.equals(context.tests.length, 1);
            assert.equals(context.tests[0].func, test);
            assert.equals(context.tests[0].name, "testSomething");
        },

        "does not expose function not starting with 'test' as test": function () {
            var context = TestCase("SomeTests", { something: function () {} }).parse();

            assert.equals(context.tests, []);
        },

        "exposes all functions starting with 'test' as tests": function () {
            var context = TestCase("SomeTests", {
                test1: function () {}, test2: function () {}, test3: function () {}
            }).parse();

            assert.equals(context.tests.length, 3);
        },

        "copies non-test to testCase object": function () {
            var helper = function () {};
            var context = TestCase("SomeTests", { helper: helper }).parse();

            assert.equals(Object.keys(context.testCase), ["helper"]);
            assert.equals(context.testCase.helper, helper);
        },

        "does not copy setUp to testCase object": function () {
            var setUp = function () {};
            var context = TestCase("SomeTests", { setUp: setUp }).parse();

            refute.defined(context.testCase.setUp);
        },

        "does not copy tearDown to testCase object": function () {
            var tearDown = function () {};
            var context = TestCase("SomeTests", { tearDown: tearDown }).parse();

            refute.defined(context.testCase.tearDown);
        }
    },

    "auto running": {
        setUp: function () {
            delete buster.jstd.TestCase.run;
            this.stub(buster, "autoRun").returns(function () {});
        },

        "calls autoRun when creating testCase": function () {
            TestCase("Some tests");

            assert(buster.autoRun.calledOnce);
        },

        "only calls autoRun for the first test case": function () {
            TestCase("Some tests");
            TestCase("Some tests");

            assert(buster.autoRun.calledOnce);
        },

        "calls runner returned from autoRun with test case": function () {
            var run = this.spy();
            buster.autoRun.returns(run);
            var testCase = TestCase("Some tests");

            assert(run.calledOnce);
            assert(run.calledWith(testCase));
        },

        "always yields test case to runner": function () {
            var run = this.spy();
            buster.autoRun.returns(run);
            var testCase = TestCase("Some tests");
            var testCase2 = TestCase("Some tests");

            assert(run.calledWith(testCase));
            assert(run.calledWith(testCase2));
        }
    },

    "configuring remote runner": {
        requiresSupportFor: { "Node buster-jstestdriver module": busterJstd },

        setUp: function () {
            this.root = path.resolve(__dirname, "..");
            this.configuration = buster.testRunner.create();
            this.addResource = this.stub();
            this.addFileResource = this.spy();
            this.appendToLoad = this.spy();
            this.resourceSet = {
                addFileResource: this.addFileResource,
                addResource: this.addResource.returns(when({})),
                loadPath: { append: this.appendToLoad }
            };
        },

        "should add libraries to resource set": function () {
            busterJstd.configure(this.configuration);

            this.configuration.emit("load:framework", this.resourceSet);

            assert.called(this.resourceSet.addFileResource);
            assert.calledWith(this.addFileResource, path.join(this.root, "/lib/buster-jstestdriver.js"));
            assert.calledWith(this.addFileResource, path.join(this.root, "/Asserts.js"));
        },

        "should serve combined library": function () {
            busterJstd.configure(this.configuration);

            this.configuration.emit("load:framework", this.resourceSet);

            assert.called(this.resourceSet.addResource);
            assert.calledWith(this.addResource, {
                path: "/jstd/bundle.js",
                combine: ["/jstd/buster-jstestdriver.js", "jstd/jquery.js", "/jstd/Asserts.js"]
            });
            assert.calledWith(this.appendToLoad, "/jstd/bundle.js");
        }
    }
});
