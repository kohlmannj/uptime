/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';
    
    var d3 = require("d3");
    require("marionette");
    
    return Marionette.View.extend({
        // Default width and height value; can be overridden in constructor.
        width: 640,
        height: 640,

        initialize: function(options) {
            this.width = options.width || this.width;
            this.height = options.height || this.height;
            // Hardcoded values based on the width of #CPUHiveView when the layout is 1024px wide.
            this.d3El = d3.select(this.el).append("svg")
                .attr("viewBox", "0 0 " + this.width + " " + this.height)
                .attr("preserveAspectRatio", "none")
            ;
        },

        // From http://stackoverflow.com/a/14679936
        onRender: function () {
            // Get rid of that pesky wrapping-div.
            // Assumes 1 child element present in template.
            this.$el = this.$el.children();
            // Unwrap the element to prevent infinitely
            // nesting elements during re-render.
            this.$el.unwrap();
            this.setElement(this.$el);
        }
    });
});
