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

    var SampleModel = require("models/Sample");
    var SampleCollection = Backbone.Collection.extend({
        "model": SampleModel
    });

    var RootLayoutView = require("views/RootLayout");
    var MainHeaderView = require("views/MainHeader");
    var AverageLoadView = require("views/AverageLoad");
    var CPUHiveView = require("views/CPUHive");

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
                current_data: this.current_data
            });
            this.rootView.getRegion('CPUHiveView').show(this.cpuHiveView);

            // MainHeaderView Refresh button: listen for "refresh" event to trigger a fetch.
            this.listenTo(this.mainHeaderView, "refresh", this.fetchSample);
        },

        onStart: function() {
            // Start the application by starting the status update poll.
            this.startPolling();
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

        fetchSuccess: function(response) {
            // Add the fetched sample to the this.samples collection.
            var fetchedSample = new SampleModel(response);
            this.samples.add(fetchedSample);

            // Update this.current_data to point to the new data.
            this.current_data = fetchedSample;

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
                "error": message
            });
            this.samples.add(dummy_sample);

            // Update this.current_data to point to the new data.
            this.current_data = dummy_sample;

            // Update the Refresh button to indicate there's been an error.
            this.mainHeaderView.errorDuringRefresh(message);

            // Schedule the next polling.
            this.startPolling();
        }
    });
});
