/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    require('marionette');

    return Marionette.LayoutView.extend({
        el: "#container",
        template: require("text!templates/RootLayout.html"),
        regions: {
            "MainHeaderView": ".mainHeader",
            "AverageLoadView": ".AverageLoadCompositeView .wrapper",
            "CPUHiveView": ".CPUHiveCompositeView .wrapper"
        },

        events: {
            "mouseover .AverageLoadCompositeView": "pauseAverageLoadView",
            "mouseout .AverageLoadCompositeView": "resumeAverageLoadView"
        },

        pauseAverageLoadView: function(e) {
            e.stopPropagation();
            this.$el.find(".AverageLoadCompositeView").addClass("paused");
            this.getRegion("AverageLoadView").currentView.pauseScrolling();
        },

        resumeAverageLoadView: function(e) {
            this.$el.find(".AverageLoadCompositeView").removeClass("paused");
            this.getRegion("AverageLoadView").currentView.resumeScrolling();
        }
    });
});
