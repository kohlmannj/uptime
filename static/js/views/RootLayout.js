/* jshint browser:true */
/* global define */
'use strict';

define(function(require) {
    require('marionette');

    return Marionette.LayoutView.extend({
        el: "#container",
        template: require("text!templates/RootLayout.html"),
        regions: {
            "header": "#mainHeader",
            "loadAvg": "#loadAvg",
            "cpuHive": "#cpuHive"
        }
    });
});
