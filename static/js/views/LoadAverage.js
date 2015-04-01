/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var d3 = require("d3");
    var D3ShimView = require("views/D3Shim");

    return D3ShimView.extend({
        // Default width and height values; can be overridden in constructor.
        width: 720,
        height: 304,

        render: function() {
            console.log("Rendering LoadAverageView");
            var rect = this.d3El.append("rect")
                .attr("x", this.width / 2 - 64)
                .attr("y", this.height / 2 - 64)
                .attr("width", 128)
                .attr("height", 128)
                .style("fill", "blue")
            ;
            // Call onRender() since we're overriding the superclass's render() method.
            this.onRender();
        }
    });
});
