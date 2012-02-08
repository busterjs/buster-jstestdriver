var path = require("path");

module.exports = {
    create: function (options) {
        return Object.create(this);
    },

    configure: function (config) {
        config.on("load:framework", function (resourceSet) {
            resourceSet.addFileResource(path.resolve(__dirname, "buster-jstestdriver.js"), {
                path: "/jstd/buster-jstestdriver.js"
            });

            resourceSet.addFileResource(path.resolve(__dirname, "../Asserts.js"), {
                path: "/jstd/Asserts.js"
            });

            resourceSet.addResource({
                path: "/jstd/bundle.js",
                combine: ["/jstd/buster-jstestdriver.js", "/jstd/Asserts.js"]
            }).then(function () {
                resourceSet.loadPath.append("/jstd/bundle.js");
            });
        });
    }
};
