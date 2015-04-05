/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var Backbone = require('backbone');

    return Backbone.Model.extend({
        idAttribute: "timestamp",

        defaults: {
            "sample": null
        }
    });
});
