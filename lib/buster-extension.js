var path = require("path");

module.exports = function (config) {
    config.on("load:resources", function (resourceSet) {
        resourceSet.addFile(path.resolve(__dirname, "buster-jstestdriver.js"), {
            path: "/jstd/buster-jstestdriver.js"
        });

        resourceSet.addFile(path.resolve(__dirname, "../Asserts.js"), {
            path: "/jstd/Asserts.js"
        });

        resourceSet.addResource("/jstd/bundle.js", {
            combine: ["/jstd/buster-jstestdriver.js", "/jstd/Asserts.js"]
        });

        resourceSet.prependToLoad("/jstd/bundle.js");
    });
};
