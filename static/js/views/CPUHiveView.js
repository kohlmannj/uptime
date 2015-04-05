/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var d3 = require("d3");
    var D3ShimView = require("views/D3ShimView");

    return D3ShimView.extend({
        // Default width and height values; can be overridden in constructor.
        width: 304,
        height: 304,
        className: "CPUHiveView",

        onRender: function() {
            var rect = d3.select(this.d3.el).append("rect")
                .attr("x", this.width / 2 - 64)
                .attr("y", this.height / 2 - 64)
                .attr("width", 128)
                .attr("height", 128)
            ;
        }
    });
});
