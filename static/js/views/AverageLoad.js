/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var _ = require("underscore");
    var d3 = require("d3");
    var utils = require("utils");
    var D3ShimView = require("views/D3Shim");

    return D3ShimView.extend({
        // Default width and height values; can be overridden in constructor.
        defaultWidth: 720,
        width: 0,
        height: 304,
        sampleWidth: 16,
        margin: 8,
        enterDuration: 2000,
        yAxisTicks: [0, 2.5, 5, 7.5, 10, 15],
        autoscroll: true,
        defaultGlobalWaveMagnitude: 1.0,
        globalWaveMagnitude: 1.0,
        pauseTimeout: 0,

        className: "AverageLoadView",

        events: {
            "mouseover": "pauseScrolling",
            "mouseout": "resumeScrolling",
            "mouseover g.foobar": "enterTest",
            "mouseout g.foobar": "exitTest"
        },

        pauseScrolling: function() {
            this.autoscroll = false;
            d3.select(this.el).classed("paused", true);
            this.globalWaveMagnitude = 0;
            clearTimeout(this.pauseTimeout);
        },

        resumeScrolling: function() {
            this.pauseTimeout = setTimeout(_.bind(function() {
                this.autoscroll = true;
                d3.select(this.el).classed("paused", false);
                this.globalWaveMagnitude = this.defaultGlobalWaveMagnitude;
            }, this), 500);
        },

        positionTest: function(e) {
            var relativePosition = utils.getEventRelativePosition(e);
            console.log("mouse cursor at " + (relativePosition.x) + ", " + (relativePosition.y) );
        },

        enterTest: function() {
            console.log("Entered the group");
        },

        exitTest: function() {
            console.log("Left the group");
        },

        drawWave: function(options) {
            var defaults = {
                className: "wave-avg-load-1min",
                data: this.collection.models,
                d3DrawMethod: d3.svg.area,
                magnitude: 1.0,
                duration: 100,
                xAttrName: "uptime",
                yAttrName: "avg_load_1min",
                interpolation: "linear",
                easing: "linear"
            };

            // Merge defaults with options.
            var settings = $.extend({}, defaults, options);

            if (typeof settings !== "object" && ! settings.hasOwnProperty("data")) {
                return;
            }

            ////////////////////
            //// Area Setup ////
            ////////////////////

            // Wave Area (an area showing the actual data points)
            var waveArea = settings.d3DrawMethod()
                .interpolate(settings.interpolation)
                .x(_.bind(function(d) {
                    return this.x(d.get(settings.xAttrName));
                }, this))
                .y0(this.innerHeight)
                .y1(_.bind(function(d) {
                    return this.y(d.get(settings.yAttrName));
                }, this))
            ;

            // Map the data to a <path> element with the specified className.
            // Wrap the data in an extra array (yes, that's important)
            var wavePath = d3.select(this.d3.el).selectAll("path." + settings.className).data([settings.data]);

            // Existing Data
            wavePath
                .transition()
                .duration(this.autoscroll ? this.enterDuration : 0)
                .attr("d", function(d) {
                    return waveArea(d);
                })
            ;

            // enter() - Incoming Data
            wavePath.enter().append("path").classed(settings.className, true)
                .transition()
                .duration(this.autoscroll ? this.enterDuration : 0)
                .attr("d", function(d) {
                    return waveArea(d);
                })
            ;

            // exit() - Outgoing Data
            wavePath.exit().remove();

            // Return wavePath now (without setting up the wave animations) if `magnitude` and `duration` are both <= 0.
            if (settings.magnitude <= 0 || settings.duration <= 0) {
                return wavePath;
            }

            /////////////////////////
            //// Animation Setup //// (if magnitude and duration are both greater than zero)
            /////////////////////////

            // Rising Wave Area
            var risingWaveArea = settings.d3DrawMethod()
                .interpolate(settings.interpolation)
                .x(_.bind(function(d) {
                    return this.x(d.get(settings.xAttrName) + Math.random() * settings.magnitude);
                }, this))
                .y0(this.innerHeight)
                .y1(_.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                    }

                    // Add the difference between this data and the previous data, multiplied by a random value and `magnitude`.
                    return this.y(
                        d.get(settings.yAttrName) + (
                            d.get(settings.yAttrName) - prevD.get(settings.yAttrName)
                        ) * Math.random() * settings.magnitude
                    );
                }, this))
            ;

            // Falling Wave Area
            var fallingWaveArea = settings.d3DrawMethod()
                .interpolate(settings.interpolation)
                .x(_.bind(function(d) {
                    return this.x(d.get(settings.xAttrName) - Math.random() * settings.magnitude);
                }, this))
                .y0(this.innerHeight)
                .y1(_.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                    }

                    // Subtract the difference between this data and the previous data, multiplied by a random value and `magnitude`.
                    return this.y(
                        d.get(settings.yAttrName) - (
                            d.get(settings.yAttrName) - prevD.get(settings.yAttrName)
                        ) * Math.random() * settings.magnitude
                    );
                }, this))
            ;

            // Animate wavePath between waveArea, risingWaveArea, and fallingWaveArea.
            // Based on http://stackoverflow.com/a/17127850
            var waveAnimation = _.bind(function() {
                if (this.autoscroll === true) {
                    wavePath.transition()
                        .duration(settings.duration)
                        .ease(settings.easing)
                        .attr("d", function (d) {
                            return risingWaveArea(d);
                        })
                        .each("end", function () {
                            wavePath.transition()
                                .duration(settings.duration)
                                .ease(settings.easing)
                                .attr("d", function (d) {
                                    return fallingWaveArea(d);
                                })
                                .each("end", function () {
                                    wavePath.transition()
                                        .duration(settings.duration * 1.5)
                                        .ease(settings.easing)
                                        .attr("d", function (d) {
                                            return waveArea(d);
                                        })
                                        .each("end", function () {
                                            waveAnimation();
                                        })
                                })
                            ;
                        })
                    ;
                } else {
                    // Transition back to the normal wave area (and stop animating).
                    wavePath.transition()
                        .duration(settings.duration)
                        .attr("d", function (d) {
                            return waveArea(d);
                        })
                        .each("end", function () {
                            waveAnimation();
                        })
                    ;
                }
            }, this);

            // Kick off the wave animation.
            waveAnimation();
        },

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
                .orient("left")
                .tickSize(-this.defaultWidth)
                .tickPadding(this.margin)
                .tickValues(this.yAxisTicks)
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
                    .attr("viewBox", "0 0 " + this.defaultWidth + " " + this.height)
                    .attr("preserveAspectRatio", "none")
                    .append("g")
                        .attr("transform", "translate(" + this.margin + "," + this.margin + ")")
                ;
            }

            // Add the y-axis
            var yAxisGroup = axisSvg.selectAll("g.y.axis").data([0]);

            yAxisGroup
                .attr("class", "y axis")
                .attr("transform", "translate(" + (this.margin * 4) + ",0)")
                .call(this.yAxis)
            ;

            yAxisGroup.enter()
                .append("rect")
                    .classed("bg", true)
                    .attr("width", this.margin * 5)
                    .attr("height", this.height)
                    .attr("x", -this.margin)
                    .attr("y", -this.margin)
            ;

            yAxisGroup.enter()
                .append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + (this.margin * 4) + ",0)")
                    .call(this.yAxis)
                ;

            yAxisGroup.exit().remove();
        },

        animateViewBoxChange: function() {
            // Update the <svg> element's viewBox attribute.
            var currentViewBox = d3.select(this.el).attr("viewBox");
            var newViewBox = "0 0 " + this.width + " " + this.height;
            d3.select(this.el).transition()
                .duration(this.enterDuration)
                .attrTween("viewBox", function() {
                    return d3.interpolateString(currentViewBox, newViewBox);
                })
            ;

            // Keep scrolling right if the scroll bar is within one sample width of the rightmost edge.
            if (this.autoscroll === true && this.$el.parent().get(0) && this.$el.parent().get(0).scrollLeft >= this.$el.parent().get(0).scrollWidth - this.$el.parent().width() - this.sampleWidth * 2) {
                this.$el.parent().animate({
                    scrollLeft: this.$el.parent().get(0).scrollWidth
                }, this.enterDuration);
            }
        },

        onRender: function() {
            // Recalculate the svg's (viewBox) width based on the number of samples we currently have.
            if (this.collection.length > 0) {
                this.width = this.sampleWidth * this.collection.length - 1;
                this.innerWidth = this.width;
                this.innerHeight = this.height - this.margin * 2;
            }

            this.animateViewBoxChange();

            // Join the data to the <g> element.
            // We're removing the left and right margins as well.
            d3.select(this.d3.el)
                .attr("transform", "translate(0," + this.margin + ")")
                .datum(this.collection.models)
            ;

            // X Drawing Coordinates (Ignore this.margin for this)
            this.x = d3.time.scale()
                .range([0, this.width]);

            // Y Drawing Coordinates
            this.y = d3.scale.linear()
                .range([this.innerHeight, 0]);

            // Domains
            this.x.domain(d3.extent(this.collection.models, function(d) { return d.get("uptime"); }));

            // Find the index of the y-axis tick value that's one tick higher than the closest tick to the max value of avg_load_1min in the data.
            var closestScaleIndex = utils.indexOfClosest(this.yAxisTicks, d3.max(this.collection.models, function(d) { return d.get("avg_load_1min"); }));
            if (closestScaleIndex < this.yAxisTicks.length - 1) {
                closestScaleIndex += 1;
            }

            this.y.domain([0, 10]);

            // Draw Axes
            this.drawAxes();

            // Draw 15-min Average Load
            this.drawWave({
                className: "fifteen-min-area",
                yAttrName: "avg_load_5min",
                duration: 250,
                magnitude: 0.5 * this.globalWaveMagnitude,
                interpolation: "linear"
            });

            // Draw 5-min Average Load
            this.drawWave({
                className: "five-min-area",
                yAttrName: "avg_load_5min",
                duration: 250,
                magnitude: 0.5 * this.globalWaveMagnitude,
                interpolation: "linear"
            });

            this.drawWave({
                className: "one-min-area",
                yAttrName: "avg_load_1min",
                duration: 150,
                magnitude: 0.5 * this.globalWaveMagnitude,
                interpolation: "linear"
                //interpolation: function(points) { return points.join("A 1,1 0 0 1 "); }
            });

            var brushRectGroup = d3.select(this.d3.el).selectAll("g.brush").data(this.collection.models);

            brushRectGroup.selectAll("line")
                .attr("x1", _.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                    }
                    return this.x(prevD.get("uptime"));
                }, this))
                .attr("stroke-linecap", "butt")
                .attr("x2", _.bind(function(d) {
                    return this.x(d.get("uptime"));
                }, this))
                .attr("y1", _.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                    }
                    return this.y(prevD.get("avg_load_1min"));
                }, this))
                .attr("y2", _.bind(function(d) {
                    return this.y(d.get("avg_load_1min"));
                }, this))
                .classed("new", false)
                .classed("updated", true)
            ;

            var enterGroup = brushRectGroup.enter()
                .append("g")
                .classed("brush", true)
                .attr("transform", _.bind(function(d, i) {
                    return "translate(0,0)";
                }, this))
            ;

            enterGroup.append("rect")
                //.attr("x", _.bind(function(d, i) {
                //    return i * this.sampleWidth;
                //}, this))
                .attr("x", _.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                    }
                    return this.x(prevD.get("uptime"));
                }, this))
                .attr("y", -this.margin)
                .attr("width", _.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                    }
                    return this.x(d.get("uptime")) - this.x(prevD.get("uptime"));
                }, this))
                .attr("height", this.height)
                .append("title")
                    .text(function(d) {
                        return (
                            " 1 min: " + d.get("avg_load_1min") + "\n" +
                            " 5 min: " + d.get("avg_load_5min") + "\n" +
                            "15 min: " + d.get("avg_load_15min")
                        );
                    })
            ;

            //brushRectGroup.enter()
            //    .append("rect")
            //    //.attr("x", _.bind(function(d, i) {
            //    //    return i * this.sampleWidth;
            //    //}, this))
            //    //.attr("y", -this.margin)
            //    .attr("width", this.sampleWidth)
            //    .attr("height", this.height)
            //;

            //enterGroup
            //    .append("line")
            //    .attr("x1", _.bind(function(d, i) {
            //        // Get the previous data point. If it doesn't exist, use the current one instead.
            //        var prevD = d;
            //        if (0 <= i - 1) {
            //            prevD = d.collection.at(i - 1);
            //        }
            //        return this.x(prevD.get("uptime"));
            //    }, this))
            //    .attr("stroke-linecap", "butt")
            //    .attr("x2", _.bind(function(d) {
            //        return this.x(d.get("uptime"));
            //    }, this))
            //    .attr("y1", _.bind(function(d, i) {
            //        // Get the previous data point. If it doesn't exist, use the current one instead.
            //        var prevD = d;
            //        if (0 <= i - 1) {
            //            prevD = d.collection.at(i - 1);
            //        }
            //        return this.y(prevD.get("avg_load_1min"));
            //    }, this))
            //    .attr("y2", _.bind(function(d) {
            //        return this.y(d.get("avg_load_1min"));
            //    }, this))
            //    .classed("new", true)
            //;
        }
    });
});
