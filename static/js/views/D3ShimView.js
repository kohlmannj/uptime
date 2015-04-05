/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';
    
    var d3 = require("d3");
    require("marionette");
    
    return Marionette.ItemView.extend({
        // Default width and height value; can be overridden in constructor.
        width: 640,
        height: 640,
        margin: 8,
        className: "D3ShimView",

        template: false,

        initialize: function(options) {
            this.width = options.width || this.width;
            this.height = options.height || this.height;
            this.margin = options.margin || this.margin;
            this.listenTo(this.collection, "add remove change reset", this.render);

            // Set up an object for storing D3-related variables.
            this.d3 = {};

            // Set up an SVG element for D3.
            var svg = d3.select(this.el).append("svg")
                .attr("id", this.id)
                .classed(this.className, true)
                .attr("viewBox", "0 0 " + this.width + " " + this.height)
                .attr("preserveAspectRatio", "none")
            ;

            // Set up a <g> element with margins. This is what D3 should draw into.
            var groupSelection = svg.append("g")
                .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
            ;

            this.d3.el = groupSelection[0][0];

            // From http://stackoverflow.com/a/14679936
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
