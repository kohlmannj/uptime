/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define, console */

define(function(require) {
    'use strict';

    var _ = require("underscore");
    var Backbone = require('backbone');
    var $ = require('jquery');
    var Marionette = require('marionette');
    var flask_util = require('flask_util');

    var SampleModel = require("models/SampleModel");
    var SampleCollection = require("models/SampleCollection");
    var MessageModel = require("models/MessageModel");
    var MessageCollection = require("models/MessageCollection");

    var RootLayoutView = require("views/RootLayoutView");
    var MainHeaderView = require("views/MainHeaderView");
    var AverageLoadView = require("views/AverageLoadView");
    var CPUHiveView = require("views/CPUHiveView");
    var MessageCollectionView = require("views/MessageCollectionView");

    return Marionette.Application.extend({
        initialize: function(options) {
            // Polling Interval Setup
            this.poll_interval = 1000 * 10;
            // Support for a custom poll interval, passed via constructor's options hash.
            if (options && options.poll_interval) {
                this.poll_interval = options.poll_interval;
            }
            // Store a reference to the polling interval.
            this.poll = -1;

            // 2-Minute High Load Check
            this.hasHighLoad = false;
            this.highLoadThreshold = HIGH_LOAD_THRESHOLD || 1.0;
            this.highLoadDuration = HIGH_LOAD_DURATION || 120000;
            // The collection of samples which have been ABOVE the load threshold.
            // Empty when we haven't seen any samples above the high load threshold.
            this.highLoadSamples = [];
            // The collection of samples which have been BELOW the load threshold.
            // Empty when we don't have a high load and when we *do* have a high load
            // but haven't seen any samples BELOW the high load threshold.
            this.recoveredLoadSamples = [];

            // Samples Collection Setup
            this.samples = new SampleCollection();

            // Sample URL Setup
            this.sample_url = flask_util.url_for("sample");

            // RootLayoutView Setup
            this.rootView = new RootLayoutView();
            this.rootView.render();

            // Initial Sample: create a SampleModel from the INITIAL_SAMPLE data contained in the template.
            this.sample = new SampleModel(INITIAL_SAMPLE);
            this.current_data = this.sample;
            this.samples.add(this.sample);
            // Check for high load.
            this.checkForHighLoad();

            // MainHeaderView Setup
            this.mainHeaderData = new Backbone.Model({
                "hostname": this.current_data.get("hostname"),
                "timestamp": this.current_data.get("timestamp"),
                "uptime": this.current_data.get("uptime")
            });
            this.mainHeaderView = new MainHeaderView({
                model: this.mainHeaderData
            });
            this.rootView.getRegion('MainHeaderView').show(this.mainHeaderView);

            // AverageLoadView Setup
            this.averageLoadView = new AverageLoadView({
                collection: this.samples,
                current_data: this.current_data
            });
            this.rootView.getRegion('AverageLoadView').show(this.averageLoadView);

            // CPUHiveView Setup
            this.cpuHiveView = new CPUHiveView({
                collection: this.samples,
                linkedView: this.averageLoadView,
            });
            this.rootView.getRegion('CPUHiveView').show(this.cpuHiveView);

            // MessagesCollectionView Setup
            this.messages = new MessageCollection();
            this.messageCollectionView = new MessageCollectionView({
                collection: this.messages
            });
            this.rootView.getRegion('MessageCollectionView').show(this.messageCollectionView);

            // MainHeaderView Refresh button: listen for "refresh" event to trigger a fetch.
            this.listenTo(this.mainHeaderView, "refresh", this.fetchSample);

            // Listen for focusSample and blurSample events.
            this.listenTo(this.messageCollectionView, "childview:focusSample", this.focusSampleForMessageView);
            this.listenTo(this.averageLoadView, "focusSample", this.focusSample);
            this.listenTo(this.cpuHiveView, "focusSample", this.focusSample);

            this.listenTo(this.messageCollectionView, "childview:blurSample", this.blurSampleForMessageView);
            this.listenTo(this.averageLoadView, "blurSample", this.blurSample);
            this.listenTo(this.cpuHiveView, "blurSample", this.blurSample);
        },

        onStart: function() {
            // Start the application by starting the status update poll.
            this.fetchSample();
            $("head title").text(this.current_data.get("hostname") + " - Uptime Monitor");
        },

        startPolling: function() {
            this.poll = setInterval(_.bind(this.fetchSample, this), this.poll_interval);
        },

        stopPolling: function() {
            clearInterval(this.poll);
        },

        fetchSample: function() {
            // Clear the next poll until we complete this fetch.
            this.stopPolling();

            // Update the Refresh button to indicate we're fetching.
            this.mainHeaderView.startRefresh();

            // GET the new sample data from the server.
            $.ajax({
                dataType: "json",
                url: this.sample_url,
                success: _.bind(this.fetchSuccess, this),
                error: _.bind(this.fetchError, this)
            });
        },

        focusSampleForMessageView: function(view) {
            var sample = view.model.get("sample")
            this.focusSample(sample);
            // Get clientX position of rect.brush[data-id="sample.id"] so we can scroll to it.
            var brushRect = d3.select("g.brush[data-id='" + sample.id + "'] rect");
            if (brushRect.empty() === false) {
                var brushRectX = parseFloat(brushRect.attr("x")) + this.averageLoadView.marginLeft - 120 - this.averageLoadView.margin * 3;
                // Animate scroll position of AverageLoadView
                this.previousScrollPosition = this.averageLoadView.$el.parent().get(0).scrollLeft;
                this.averageLoadView.$el.parent().finish().animate({
                    scrollLeft: brushRectX
                }, 500);
            }
        },

        blurSampleForMessageView: function(view) {
            this.blurSample(view.model.get("sample"));
            if (typeof this.previousScrollPosition === "number") {
                // Animate scroll position of AverageLoadView back into position
                this.averageLoadView.$el.parent().finish().animate({
                    scrollLeft: this.previousScrollPosition
                }, 1000);
            }
        },

        focusSample: function(sample) {
            d3.selectAll("*[data-id='" + sample.id + "']").classed("focused", true);
            // Pause the graph animation
            this.rootView.pauseAverageLoadView();
        },

        blurSample: function(sample) {
            d3.selectAll("*[data-id='" + sample.id + "']").classed("focused", false);
            // Resume the graph animation
            this.rootView.resumeAverageLoadView();
        },

        fetchSuccess: function(response) {
            var fetchedSample = new SampleModel(response);

            // Update this.current_data to point to the new data.
            this.current_data = fetchedSample;

            // Determine if there is an excessive load on the remote system.
            this.checkForHighLoad();

            // Add the fetched sample to this.samples.
            this.samples.add(fetchedSample);

            // Update MainHeaderView's data.
            this.mainHeaderData.set({
                "hostname": this.current_data.get("hostname"),
                "timestamp": this.current_data.get("timestamp"),
                "uptime": this.current_data.get("uptime")
            });

            // Re-enable the Refresh button.
            this.mainHeaderView.stopRefresh();

            // Schedule the next polling.
            this.startPolling();
        },

        fetchError: function(response) {
            // Record an error message to MainHeaderView.
            var message = "There was a problem fetching status information from the server. (Error " + response.status + ": " + response.statusText + ")";

            // Add an error sample to this.samples.
            var dummy_sample = new SampleModel({
                "hostname": this.current_data.get("hostname"),
                "error": "FetchError",
                "note": message
            });
            // Add to the samples collection as well.
            this.samples.add(dummy_sample);

            // Update this.current_data to point to the new data.
            this.current_data = dummy_sample;

            // Update the Refresh button to indicate there's been an error.
            this.mainHeaderView.errorDuringRefresh(message);

            // Schedule the next polling.
            this.startPolling();
        },

        checkForHighLoad: function() {
            var loadOneMin = this.current_data.get("avg_load_1min");

            // Is this current sample above the high load threshold?
            if (loadOneMin > this.highLoadThreshold) {
                // No high load yet.
                if (this.hasHighLoad === false) {
                    // Add the current sample to this.highLoadSamples.
                    this.highLoadSamples.push(this.current_data);
                    // Find the extent of the timestamps in the highLoadSamples collection.
                    var highExtent = d3.extent(this.highLoadSamples, function (d) {
                        return new Date(d.get("timestamp"))
                    });
                    var highForDuration = highExtent[1] - highExtent[0];
                    // Has the system had a high load value for the duration threshold or longer?
                    if (highForDuration >= this.highLoadDuration) {
                        // We've been under a high load for the past two minutes!
                        this.hasHighLoad = true;
                        _.each(this.highLoadSamples, function (sample) {
                            sample.set("error", "HighLoadSustained");
                        });
                        // Add a message to the sample which started this alert (i.e. this.highLoadSamples[0]).
                        var firstHighLoadSample = this.highLoadSamples[0];
                        firstHighLoadSample.set("error", "HighLoadStart");
                        firstHighLoadSample.set("note", "High load generated an alert!");
                        this.messages.add(new MessageModel({
                            sample: firstHighLoadSample
                        }));
                    }
                }
                // When under high load...
                else if (this.hasHighLoad === true) {
                    // Add the current sample to this.highLoadSamples.
                    this.current_data.set("error", "HighLoadSustained");
                    this.highLoadSamples.push(this.current_data);
                    // Clear recoveredLoadSamples, since this sample was higher than the load threshold.
                    this.recoveredLoadSamples = [];
                }
            }
            // Current sample is below or equal to the high load threshold.
            else {
                if (this.hasHighLoad === true) {
                    // We're still under high load, so add the current sample to this.highLoadSamples.
                    this.current_data.set("error", "HighLoadSustained");
                    this.highLoadSamples.push(this.current_data);
                    // Add the current sample to this.recoveredLoadSamples.
                    this.recoveredLoadSamples.push(this.current_data);
                    // Find the extent of the timestamps in the recoveredLoadSamples collection.
                    var recoveredExtent = d3.extent(this.recoveredLoadSamples, function(d) { return new Date(d.get("timestamp")) });
                    var recoveredForDuration = recoveredExtent[1] - recoveredExtent[0];
                    // Have we recovered?
                    if (recoveredForDuration >= this.highLoadDuration) {
                        // We've recovered as of the last sample in this.highLoadSamples.
                        this.hasHighLoad = false;

                        // All the samples in recoveredLoadSamples are okay now, so remove the error from them.
                        _.each(this.recoveredLoadSamples, _.bind(function(sample) {
                            if (sample.get("error") === "HighLoadSustained") {
                                sample.set("error", null);
                                var indexInHighLoadSamples = this.highLoadSamples.indexOf(sample);
                                // Remove this sample from this.highLoadSamples.
                                this.highLoadSamples.remove(indexInHighLoadSamples);
                            }
                        }, this));

                        // Update the last "HighLoadSustained" sample in this.highLoadSamples to have the error "HighLoadEnd" instead.
                        var lastHighLoadSample = this.highLoadSamples[this.highLoadSamples.length - 1];
                        lastHighLoadSample.set("error", "HighLoadEnd");
                        lastHighLoadSample.set("note", "The last sample for which the system load was above the alert threshold.");

                        // Separately, update the first sample in this.recoveredLoadSamples with a special "recovered" message.
                        var firstRecoveredLoadSample = this.recoveredLoadSamples[0];
                        firstRecoveredLoadSample.set("error", "HighLoadRecovered");
                        firstRecoveredLoadSample.set("note", "Recovered from high load.");
                        this.messages.add(new MessageModel({
                            sample: firstRecoveredLoadSample
                        }));

                        this.highLoadSamples = [];
                        this.recoveredLoadSamples = [];

                    }
                }
                // Not under high load and this value is below or equal to the high load threshold.
                else if (this.hasHighLoad === false) {
                    // Empty this.highLoadSamples since this sample should break the current "streak".
                    this.highLoadSamples = [];
                }
            }
        }
    });
});
