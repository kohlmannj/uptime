/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var Backbone = require('backbone');

    return Backbone.Model.extend({
        idAttribute: "timestamp",

        defaults: {
            "avg_load_1min": -1.0,
            "avg_load_5min": -1.0,
            "avg_load_15min": -1.0,
            "cpu_count": -1,
            "cpu_%user": -1.0,
            "cpu_%sys":  -1.0,
            "cpu_%idle": -1.0,
            "error": null,
            "hostname": null,
            "timestamp": null,
            "uptime": null
        },

        parse: function(response) {
            if (response.hasOwnProperty("processes")) {
                var processes = this.set("processes", []);
            }
        }
    });
});
