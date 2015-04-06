/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var _ = require("underscore");
    var d3 = require("d3");
    var utils = require("utils");
    var D3ShimView = require("views/D3ShimView");
    var Smooth = require("smooth");
    var moment = require("moment");

    return D3ShimView.extend({
        // Default width and height values; can be overridden in constructor.
        defaultWidth: 720,
        animatedSampleLimit: 16,
        sampleLimit: 60,
        width: 0,
        height: 304,
        sampleWidth: 32,
        margin: 8,
        marginLeft: 220,
        enterDuration: 2000,
        yAxisTicks: [0, 1.0, 2.5, 5, 10, 15, 20],
        autoscroll: true,
        defaultGlobalWaveMagnitude: 1.0,
        globalWaveMagnitude: 1.0,
        pauseTimeout: 0,
        dateFormat: "ddd, L · LTS [(GMT] Z[)]",
        className: "AverageLoadView",

        focusSample: function(sample) {
            this.trigger("focusSample", sample);
        },

        blurSample: function(sample) {
            this.trigger("blurSample", sample);
        },

        pauseScrolling: function() {
            this.autoscroll = false;
            d3.select(this.el).classed("paused", true);
            this.globalWaveMagnitude = 0;
        },

        resumeScrolling: function() {
            this.autoscroll = true;
            d3.select(this.el).classed("paused", false);
            this.globalWaveMagnitude = this.defaultGlobalWaveMagnitude;
        },

        drawWave: function(options) {
            var defaults = {
                animate: true,
                className: "wave-avg-load-1min",
                data: this.collection.models,
                // The two draw methods supported are d3.svg.area and d3.svg.line
                d3DrawMethod: d3.svg.area,
                magnitude: 1.0,
                duration: 100,
                xAttrName: "uptime",
                yAttrName: "avg_load_1min",
                // Bilinear 4x resampling for smoother curves (and smoother waves)
                interpolation: function(points) {
                    if (points.length > 1) {
                        var path = "";
                        // Quadruple the number of samples.
                        var iStep = 1.0 / 4;
                        var s = Smooth(points);
                        for (var i = 0; i < points.length; i += iStep) {
                            if (i) path += "L";
                            for (var j = 0; j < points[0].length; j += iStep) {
                                if (j) path += "L";
                                path += s(i, j) + "," + s(i, j);
                            }
                        }
                        return path;
                    } else {
                        return points.join("L");
                    }
                },
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
            ;

            var waveAreaHeightFunction = _.bind(function(d) {
                return this.y(d.get(settings.yAttrName));
            }, this);

            if (settings.d3DrawMethod === d3.svg.area) {
                waveArea
                    .y0(this.innerHeight)
                    .y1(waveAreaHeightFunction)
                ;
            } else if (settings.d3DrawMethod == d3.svg.line) {
                waveArea
                    .y(waveAreaHeightFunction)
                ;
            }

            // Map the data to a <path> element with the specified className.
            // Wrap the data in an extra array (yes, that's important)
            var wavePath = d3.select(this.d3.el).selectAll("path." + settings.className).data([settings.data]);

            // Existing Data
            wavePath
                .transition()
                .duration(0)
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("d", function(d) {
                    return waveArea(d);
                })
            ;

            // enter() - Incoming Data
            wavePath.enter().append("path").classed(settings.className, true)
                .transition()
                .duration(0)
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("d", function(d) {
                    return waveArea(d);
                })
            ;

            // exit() - Outgoing Data
            wavePath.exit().remove();

            // Short-circuit to stop animation.
            if (settings.animate === false) {
                return;
            }

            /////////////////////////
            //// Animation Setup //// (if magnitude and duration are both greater than zero)
            /////////////////////////

            // Rising Wave Area
            var risingWaveArea = settings.d3DrawMethod()
                .interpolate(settings.interpolation)
                .x(_.bind(function(d) {
                    return this.x(d.get(settings.xAttrName) + Math.random() * settings.magnitude * 4);
                }, this))
            ;

            var risingWaveHeightFunction = _.bind(function(d, i) {
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
            }, this);

            // Handle d3.svg.area differently from d3.svg.line
            if (settings.d3DrawMethod === d3.svg.area) {
                risingWaveArea
                    .y0(this.innerHeight)
                    .y1(risingWaveHeightFunction)
                ;
            } else if (settings.d3DrawMethod === d3.svg.line) {
                risingWaveArea
                    .y(risingWaveHeightFunction)
                ;
            }

            // Falling Wave Area
            var fallingWaveArea = settings.d3DrawMethod()
                .interpolate(settings.interpolation)
                .x(_.bind(function(d) {
                    return this.x(d.get(settings.xAttrName) - Math.random() * settings.magnitude * 2);
                }, this))
            ;

            var fallingWaveHeightFunction = _.bind(function (d, i) {
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
            }, this);

            // Handle d3.svg.area differently from d3.svg.line
            if (settings.d3DrawMethod === d3.svg.area) {
                fallingWaveArea
                    .y0(this.innerHeight)
                    .y1(fallingWaveHeightFunction)
                ;
            } else if (settings.d3DrawMethod === d3.svg.line) {
                fallingWaveArea
                    .y(fallingWaveHeightFunction)
                ;
            }

            // Animate wavePath between waveArea, risingWaveArea, and fallingWaveArea.
            // Based on http://stackoverflow.com/a/17127850
            var waveAnimation = _.bind(function() {
                // When automatically scrolling to the rightmost position.
                if (this.autoscroll === true) {
                    wavePath.transition()
                        .duration(settings.duration)
                        .ease(settings.easing)
                        .attr("d", _.bind(function (d) {
                            return risingWaveArea(d);
                        }, this))
                        .each("end", function () {
                            wavePath.transition()
                                .duration(settings.duration)
                                .ease(settings.easing)
                                .attr("d", _.bind(function (d) {
                                    return fallingWaveArea(d);
                                }, this))
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
                }
                // When autoscrolling is disabled
                else {
                    // Transition back to the normal wave area (i.e. stop animating).
                    wavePath.transition()
                        .duration(settings.duration)
                        .ease(settings.easing)
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

            // <rect> to have the y-axis labels occlude the graph
            yAxisGroup.enter()
                .append("rect")
                    .classed("bg", true)
                    .attr("width", this.margin * 5)
                    .attr("height", this.height)
                    .attr("x", -this.margin)
                    .attr("y", -this.margin)
            ;

            // <rect> to cover up overflow beyond the zero value on the y-axis
            yAxisGroup.enter()
                .append("rect")
                    .classed("bg", true)
                    .attr("width", this.defaultWidth)
                    .attr("height", this.margin)
                    .attr("x", -this.margin)
                    .attr("y", this.height - this.margin * 2)
            ;

            yAxisGroup.enter()
                .append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + (this.margin * 4) + ",0)")
                    .call(this.yAxis)
                ;

            yAxisGroup.exit().remove();
        },

        drawBrushRects: function() {
            // Select the g.brush groups and map the data to them.
            var existingGroups = d3.select(this.d3.el).selectAll("g.brush").data(this.collection.models);

            // Add a data-error attribute so we can visually indicate which type of message is there.
            // Also add a .note class if this group has a note.
            existingGroups
                .attr("data-error", function(d) {
                    return d.get("error");
                })
                .attr("data-id", function(d) {
                    return d.id;
                })
                .classed("note", function(d) {
                    return (typeof d.get("note") === "string");
                })
            ;

            ///////////////////////////
            //// Existing Elements ////
            ///////////////////////////

            // Existing <title> elements inside <rect> elements
            // Update title text to include any error or note messages.
            existingGroups.selectAll("rect title")
                .text(_.bind(function(d) {
                    return (
                        " 1 min: " + d.get("avg_load_1min") + "\n" +
                        " 5 min: " + d.get("avg_load_5min") + "\n" +
                        "15 min: " + d.get("avg_load_15min") +
                        (d.get("error") !== null ? "\n\n**" + d.get("error") + "**" : "") +
                        (d.get("note") !== null ? "\n\nNote: " + d.get("note") : "") + "\n" +
                        moment( moment.utc(d.get("timestamp")).toDate() ).calendar()
                    );
                }, this))
            ;

            // Existing <ellipse> elements
            // Adjust y-coordinate to account for y-axis mapping change.
            existingGroups.selectAll("ellipse")
                // Update the y values since the y-axis mapping could change.
                .attr("cy", _.bind(function(d) {
                    return this.y(d.get("avg_load_1min"));
                }, this))
            ;

            // Existing relative timestamp <text> labels
            existingGroups.selectAll("text.timestamp")
                .text(function(d) { return moment( moment.utc(d.get("timestamp")).toDate() ).calendar(); })
            ;

            //////////////////////
            //// New Elements ////
            //////////////////////

            var newGroups = existingGroups.enter()
                .append("g")
                .classed("brush", true)
                //.attr("transform", "translate(0,0)")
                .classed("note", function(d) {
                    return (typeof d.get("note") === "string");
                })
                .attr("data-error", function(d) {
                    return d.get("error");
                })
                .attr("data-id", function(d) {
                    return d.id;
                })
            ;

            // New <rect> elements
            var newRects = newGroups.append("rect")
                .attr("x", _.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                        return this.x(prevD.get("uptime"))
                    } else {
                        return this.x(d.get("uptime")) - this.sampleWidth
                    }
                }, this))
                .attr("y", -this.margin)
                .attr("width", _.bind(function(d, i) {
                    // Get the previous data point. If it doesn't exist, use the current one instead.
                    var prevD = d;
                    if (0 <= i - 1) {
                        prevD = d.collection.at(i - 1);
                        return this.x(d.get("uptime")) - this.x(prevD.get("uptime"));
                    } else {
                        return this.sampleWidth
                    }
                }, this))
                .attr("height", this.height)
                .on("mouseenter", _.bind(function(e) {
                    this.focusSample(e);
                }, this))
                .on("mouseleave", _.bind(function(e) {
                    this.blurSample(e);
                }, this))
            ;

            // New <title> elements inside new <rect> elements
            newRects.append("title")
                .text(_.bind(function(d) {
                    return (
                        " 1 min: " + d.get("avg_load_1min") + "\n" +
                        " 5 min: " + d.get("avg_load_5min") + "\n" +
                        "15 min: " + d.get("avg_load_15min") +
                        (d.get("error") !== null ? "\n\n**" + d.get("error") + "**" : "") +
                        (d.get("note") !== null ? "\n\nNote: " + d.get("note") : "") + "\n" +
                        moment( moment.utc(d.get("timestamp")).toDate() ).calendar()
                    );
                }, this))
            ;

            // New <line> elements
            newGroups.append("line")
                .classed("marker", true)
                .attr("x1", _.bind(function(d) {
                    return this.x(d.get("uptime"));
                }, this))
                .attr("x2", _.bind(function(d) {
                    return this.x(d.get("uptime"));
                }, this))
                .attr("y1", -this.margin)
                .attr("y2", this.height)
            ;

            // New <ellipse> elements
            newGroups.append("ellipse")
                .attr("cx", _.bind(function(d) {
                    return this.x(d.get("uptime"));
                }, this))
                .attr("cy", _.bind(function(d) {
                    return this.y(d.get("avg_load_1min"));
                }, this))
                .attr("rx", 4)
                .attr("ry", 4)
            ;

            // New 1-min average load <text> labels
            newGroups.append("text")
                .attr("text-anchor", "end")
                .attr("x", _.bind(function(d) {
                    return this.x(d.get("uptime")) - this.margin;
                }, this))
                .attr("y", this.y(0) - this.margin * 4.5)
                .text(function(d) { return "Load: " + d.get("avg_load_1min"); })
            ;

            // New relative timestamp <text> labels
            newGroups.append("text")
                .classed("timestamp", true)
                .attr("text-anchor", "end")
                .attr("x", _.bind(function(d) {
                    return this.x(d.get("uptime")) - this.margin;
                }, this))
                .attr("y", this.y(0) - this.margin * 2)
                .text(function(d) { return moment( moment.utc(d.get("timestamp")).toDate() ).calendar(); })
            ;

            //////////////////////////
            //// Removed Elements ////
            //////////////////////////

            var removedGroups = existingGroups.exit()
                .remove()
            ;
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
            if (this.autoscroll === true && this.$el.parent().get(0) && this.$el.parent().get(0).scrollLeft >= this.$el.parent().get(0).scrollWidth * 2/3 - this.$el.parent().width()) {
                this.$el.parent().finish().animate({
                    scrollLeft: this.$el.parent().get(0).scrollWidth
                }, this.enterDuration);
            }
        },

        onRender: function() {
            // Recalculate the svg's (viewBox) width based on the samples we currently have.
            var xExtent = d3.extent(this.collection.last(this.sampleLimit), function(d) { return d.get("uptime"); })
            if (this.collection.length > 0) {
                this.width = (xExtent[1] - xExtent[0]) * 3 + this.marginLeft;
                this.innerWidth = this.width - this.marginLeft;
                this.innerHeight = this.height - this.margin * 2;
            }

            this.animateViewBoxChange();

            // Join the data to the <g> element.
            // We're removing the left and right margins as well.
            d3.select(this.d3.el)
                .attr("transform", "translate(" + this.marginLeft + "," + this.margin + ")")
                .datum(this.collection.models)
            ;

            // X Drawing Coordinates (Ignore this.margin for this)
            this.x = d3.time.scale()
                .range([0, this.innerWidth]);

            // Y Drawing Coordinates
            this.y = d3.scale.linear()
                .range([this.innerHeight, 0]);

            // Domains
            this.x.domain(xExtent);

            // Find the index of the y-axis tick value that's one tick higher than the closest tick to the max value of avg_load_1min in the data.
            var maxAvgLoad1Min = d3.max(this.collection.models, function(d) { return d3.max([d.get("avg_load_1min"), d.get("avg_load_5min"), d.get("avg_load_15min")]); });
            var closestScaleIndex = utils.indexOfClosest(this.yAxisTicks, maxAvgLoad1Min);
            if (closestScaleIndex < this.yAxisTicks.length - 1 && maxAvgLoad1Min >= this.yAxisTicks[closestScaleIndex]) {
                closestScaleIndex += 1;
            }

            this.y.domain([0, this.yAxisTicks[closestScaleIndex]]);

            // Draw Axes
            this.drawAxes();

            //////////////////////
            //// Static Lines ////
            //////////////////////

            // Draw 15-min Average Load
            this.drawWave({
                animate: false,
                data: this.collection.first(this.collection.length - this.animatedSampleLimit + 1),
                className: "fifteen-min-area-static",
                yAttrName: "avg_load_15min",
                d3DrawMethod: d3.svg.line
            });

            // Draw 5-min Average Load
            this.drawWave({
                animate: false,
                data: this.collection.first(this.collection.length - this.animatedSampleLimit + 1),
                className: "five-min-area-static",
                yAttrName: "avg_load_5min"
            });

            this.drawWave({
                animate: false,
                data: this.collection.first(this.collection.length - this.animatedSampleLimit + 1),
                className: "one-min-area-static",
                yAttrName: "avg_load_1min"
            });

            ////////////////////////
            //// Animated lines ////
            ////////////////////////

            // Draw 15-min Average Load
            this.drawWave({
                data: this.collection.last(this.animatedSampleLimit),
                className: "fifteen-min-area",
                yAttrName: "avg_load_15min",
                duration: 500,
                magnitude: 0.125 * this.globalWaveMagnitude,
                d3DrawMethod: d3.svg.line
            });

            // Draw 5-min Average Load
            this.drawWave({
                data: this.collection.last(this.animatedSampleLimit),
                className: "five-min-area",
                yAttrName: "avg_load_5min",
                duration: 250,
                magnitude: 0.125 * this.globalWaveMagnitude
            });

            this.drawWave({
                data: this.collection.last(this.animatedSampleLimit),
                className: "one-min-area",
                yAttrName: "avg_load_1min",
                duration: 150,
                magnitude: 0.125 * this.globalWaveMagnitude
            });

            this.drawBrushRects();
        }
    });
});
