/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    require('marionette');

    return Marionette.LayoutView.extend({
        el: "#container",
        template: require("text!templates/RootLayout.html"),
        regions: {
            "MainHeaderView": "#mainHeader",
            "LoadAverageView": "#LoadAverageViewWrapper",
            "CPUHiveView": "#CPUHiveViewWrapper"
        }
    });
});
