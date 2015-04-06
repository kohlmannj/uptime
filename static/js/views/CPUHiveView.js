/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var d3 = require("d3");
    var moment = require("moment");
    var utils = require("utils");
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
                .orient("top")
                .ticks(d3.time.seconds, 60)
                .tickSize(this.margin * 2)
                .tickPadding(0)
                .tickValues([0, 25, 50, 75, 100])
                .tickFormat("")
            ;

            var decimalFormatter = d3.format("1.1f");
            var integerFormatter = d3.format("2f");

            // Y-Axis
            this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient("right")
                .tickSize(this.innerWidth)
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

            // Add the x-axis
            var xAxisGroup = axisSvg.selectAll("g.x.axis").data([0]);

            xAxisGroup
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (this.height - this.margin) + ")")
                .call(this.xAxis)
            ;
            //
            //xAxisGroup.enter()
            //    .append("rect")
            //        .classed("bg", true)
            //        .attr("width", this.width)
            //        .attr("height", this.margin)
            //        .attr("x", -this.margin)
            //        .attr("y", this.height - this.margin * 2)
            //;

            xAxisGroup.enter()
                .append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (this.height - this.margin) + ")")
                    .call(this.xAxis)
                ;

            xAxisGroup.exit().remove();

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
            this.innerWidth = this.width - this.margin * 5;
            // X Drawing Coordinates (Ignore this.margin for this)
            this.x = d3.scale.linear()
                .range([0, this.innerWidth]);

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
            ;
            arc.selectAll("title")
                .text(_.bind(function(d) {
                    return "Load: " + d.get("avg_load_1min") + "\n" +
                        "CPU: " + (100 - parseFloat(d.get("cpu_%idle"))).toFixed(2) + "%" + "\n" +
                        moment( moment.utc(d.get("timestamp")).toDate() ).calendar()
                    ;
                }))
            ;

            var arcEnter = arc.enter();

            arcEnter
                .append("ellipse")
                .attr("cx", this.x(0) - this.margin)
                .attr("cy", this.y(0))
                .attr("rx", _.bind(function(d) {
                    return this.x(100 - parseFloat(d.get("cpu_%idle")));
                }, this))
                .attr("ry", _.bind(function(d) {
                    return this.y(this.y.domain()[0]) - this.y(d.get("avg_load_1min"));
                }, this))
                .append("title")
                .text(_.bind(function(d) {
                    return "Load: " + d.get("avg_load_1min") + "\n" +
                        "CPU: " + (100 - parseFloat(d.get("cpu_%idle"))).toFixed(2) + "%" + "\n" +
                        moment( moment.utc(d.get("timestamp")).toDate() ).calendar()
                    ;
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
