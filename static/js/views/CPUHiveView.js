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

        drawAxes: function() {
            // X-Axis
            this.xAxis = d3.svg.axis()
                .scale(this.x)
                .orient("bottom")
                .ticks(d3.time.seconds, 60)
                .tickSize(-this.innerHeight + this.margin)
                .tickFormat(d3.format("·"))
            ;

            var decimalFormatter = d3.format("1.1f");
            var integerFormatter = d3.format("2f");

            // Y-Axis
            this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient("right")
                .tickSize(this.width - this.margin * 5)
                .tickPadding(this.margin)
                .tickValues(this.linkedView.yAxisTicks)
                .tickFormat(function(d) {
                    if (d < 10) {
                        return decimalFormatter(d)
                    } else {
                        return integerFormatter(d)
                    }
                })
            ;

            // Add the axes in their own <svg> container.
            var axisSvg = d3.select(this.el.parentNode.parentNode).select("svg.overlay g");

            // Create axisSvg if it doesn't exist.
            if (axisSvg.empty()) {
                axisSvg = d3.select(this.el.parentNode.parentNode).insert("svg")
                    .classed("overlay", true)
                    .attr("viewBox", "0 0 " + this.width + " " + this.height)
                    .attr("preserveAspectRatio", "none")
                    .append("g")
                        .attr("transform", "translate(" + 0 + "," + this.margin + ")")
                ;
            }

            // Add the y-axis
            var yAxisGroup = axisSvg.selectAll("g.y.axis").data([0]);

            yAxisGroup
                .attr("class", "y axis")
                .attr("transform", "translate(0,0)")
                .call(this.yAxis)
            ;

            yAxisGroup.enter()
                .append("rect")
                    .classed("bg", true)
                    .attr("width", this.width)
                    .attr("height", this.margin)
                    .attr("x", -this.margin)
                    .attr("y", this.height - this.margin * 2)
            ;

            yAxisGroup.enter()
                .append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(0,0)")
                    .call(this.yAxis)
                ;

            yAxisGroup.exit().remove();
        },

        onRender: function() {
            // X Drawing Coordinates (Ignore this.margin for this)
            this.x = d3.scale.linear()
                .range([0, this.width]);

            // Domains
            this.x.domain([0, 100]);

            // Y Drawing Coordinates and Domain (from AverageLoadView)
            this.y = this.linkedView.y;

            // Map the last item in the collection to path.arc.
            var arc = d3.select(this.d3.el).selectAll("ellipse").data(this.collection.last(4));

            arc
                .transition()
                .duration(2000)
                .attr("cx", this.x(0) - this.margin)
                .attr("cy", this.y(0))
                .attr("rx", _.bind(function(d) {
                    return this.x(100 - parseFloat(d.get("cpu_%idle")));
                }, this))
                .attr("ry", _.bind(function(d) {
                    return this.y(this.y.domain()[0]) - this.y(d.get("avg_load_1min"));
                }, this))
                .text(_.bind(function(d) {
                    return "Load: " + d.get("avg_load_1min") + "\nCPU: " + (100 - parseFloat(d.get("cpu_%idle"))) + "%";
                }))
            ;

            arc.enter()
                .append("ellipse")
                .transition()
                .duration(2000)
                .attr("cx", this.x(0) - this.margin)
                .attr("cy", this.y(0))
                .attr("rx", _.bind(function(d) {
                    return this.x(100 - parseFloat(d.get("cpu_%idle")));
                }, this))
                .attr("ry", _.bind(function(d) {
                    return this.y(this.y.domain()[0]) - this.y(d.get("avg_load_1min"));
                }, this))
                .text(_.bind(function(d) {
                    return "Load: " + d.get("avg_load_1min") + "\nCPU: " + (100 - parseFloat(d.get("cpu_%idle"))) + "%";
                }))
            ;

            arc.exit()
                .transition()
                .duration(2000)
                .attr("opacity", 0)
                .remove()
            ;

            this.drawAxes();
        }
    });
});
