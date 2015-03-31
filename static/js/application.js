/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define */
'use strict';

define(function(require) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var $ = require('jquery');
    var d3 = require('d3');
    require('marionette');
    var flask_util = require('flask_util');

    var LayoutView = Marionette.LayoutView.extend({
        el: "#container",
        template: require("text!templates/layout.html"),
        regions: {
            "loadavg": "#loadAvg",
            "cpuhive": "#cpuHive"
        }
    })

    var application = Marionette.Application.extend({
        //initialize: function(options) {
        //    console.log('My container:', options.container);
        //},
        // Convention borrowed from Marionette version of TodoMVC
        setRootLayout: function() {
            this.root = new LayoutView();
        }
    });

    return application;
});
