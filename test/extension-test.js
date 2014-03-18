var buster = require("buster");
var configuration = require("buster-configuration");
var ext = require("../lib/extension");
var assert = buster.referee.assert;

function process(group, then, errBack) {
    group.resolve().then(function (resourceSet) {
        resourceSet.serialize().then(then, errBack);
    }, errBack);
}

buster.testCase("Buster JsTestDriver extension", {
    "adds bundle as framework": function (done) {
        var config = configuration.createConfiguration();
        var group = config.addGroup("Some tests", {
            resources: [{ path: "/test.js", content: "//Hey" }],
            tests: ["/test.js"]
        });
        group.extensions.push(ext.create());

        group.resolve().then(done(function (resourceSet) {
            assert.equals(resourceSet.length, 5);
            assert.equals(resourceSet.loadPath.paths(),
                          ["/jstd/bundle.js", "/test.js"]);
        }), done(function (err) { buster.log(err); }));
    },

    "extracts html doc from tests": function (done) {
        var group = configuration.createConfiguration().addGroup("Some tests", {
            resources: [{
                path: "/buster.js",
                content: "function () { /*:DOC el = <p></p>*/ }"
            }],
            tests: ["/buster.js"]
        });

        ext.create().configure(group);
        
        process(group, done(function (serialized) {
            assert.match(serialized.resources[0].content,
                         "document.createElement");
        }.bind(this)), buster.log);
    }
});
