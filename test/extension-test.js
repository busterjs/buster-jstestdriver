var buster = require("buster");
var configuration = require("buster-configuration");
var ext = require("../lib/extension");

buster.testCase("Buster JsTestDriver extension", {
    "adds bundle as framework": function (done) {
        var config = configuration.create();
        var group = config.addGroup("Some tests", {
            resources: [{ path: "/test.js", content: "//Hey" }],
            tests: ["/test.js"]
        });
        group.extensions.push(ext.create());

        group.resolve().then(done(function (resourceSet) {
            assert.equals(resourceSet.length, 4);
            assert.equals(resourceSet.loadPath.paths(),
                          ["/jstd/bundle.js", "/test.js"]);
        }), done(function (err) { buster.log(err); }));
    }
});
