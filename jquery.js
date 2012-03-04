// Minimal jQuery shim to satiesfy Asserts.js
jstestdriver.jQuery = {
    isArray: function (object) {
        return Object.prototype.toString.call(object) == "[object Array]";
    }
};
