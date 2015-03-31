/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var Backbone = require('backbone');

    return Backbone.Model.extend({
        "id": "time",

        defaults: {
            "cpu_count": 0,
            "cpu_%user": 0.0,
            "cpu_%sys":  0.0,
            "cpu_%idle": 0.0,
            "hostname": "",
            "load_avg_1min": 0.0,
            "load_avg_5min": 0.0,
            "load_avg_15min": 0.0,
            "timestamp": "",
            "uptime": ""
        },

        parse: function(response) {
            if (response.hasOwnProperty("processes")) {
                var processes = this.set("processes", []);
            }
        }
    });
});
