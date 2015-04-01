/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define, console */

define(function(require) {
    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var $ = require('jquery');
    //var d3 = require('d3');
    var Marionette = require('marionette');
    var flask_util = require('flask_util');

    var SampleModel = require("models/Sample");
    var SampleCollection = Backbone.Collection.extend({
        "model": SampleModel
    });

    var RootLayoutView = require("views/RootLayout");
    var MainHeaderView = require("views/MainHeader");
    var LoadAverageView = require("views/LoadAverage");
    var CPUHiveView = require("views/CPUHive");

    return Marionette.Application.extend({
        initialize: function(options) {
            this.ready = false;
            // Polling interval, which can be customized in the constructor if you like.
            this.poll_interval = 10000;
            if (options && options.poll_interval) {
                this.poll_interval = options.poll_interval;
            }

            // Initialize the samples collection, where we store data samples retrieved from the server
            // (and dummy "error" samples generated when we fail to poll the server for updates).
            this.samples = new SampleCollection();
            this.sample_url = flask_util.url_for("sample");

            // Initialize and render the root layout.
            this.rootView = new RootLayoutView();
            this.rootView.render();

            // Create a new Sample from the INITIAL_SAMPLE data contained in the template.
            this.current_data = new SampleModel(INITIAL_SAMPLE);

            // MainHeaderView Setup
            this.mainHeaderView = new MainHeaderView({
                model: this.current_data
            });
            this.rootView.getRegion('MainHeaderView').show(this.mainHeaderView);

            // LoadAverageView Setup
            this.loadAverageView = new LoadAverageView({
                collection: this.samples,
                current_data: this.current_data
            });
            this.rootView.getRegion('LoadAverageView').show(this.loadAverageView);

            // CPUHiveView Setup
            this.cpuHiveView = new CPUHiveView({
                collection: this.samples,
                current_data: this.current_data
            });
            this.rootView.getRegion('CPUHiveView').show(this.cpuHiveView);

            // Listen for presses of the Refresh button in the header.
            this.listenTo(this.mainHeaderView, "refresh", this.fetchSample);

            // Store a reference to the polling interval.
            this.poll = -1;
        },

        onStart: function() {
            // Start the application by starting the status update poll.
            this.startPolling();
        },

        startPolling: function() {
            this.ready = true;
            this.poll = setInterval(_.bind(this.fetchSample, this), this.poll_interval);
        },

        stopPolling: function() {
            this.ready = false;
            clearInterval(this.poll);
        },

        fetchSample: function() {
            this.stopPolling();
            this.mainHeaderView.startRefresh();
            // GET the new sample data from the server
            $.ajax({
                dataType: "json",
                url: this.sample_url,
                success: _.bind(this.fetchSuccess, this),
                error: _.bind(this.fetchError, this)
            });
        },

        fetchSuccess: function(response) {
            // Update this.current_data with the new values from the server.
            this.current_data.set(response);
            console.log(this.current_data.toJSON());
            // Add a deep copy of current_data to this.samples
            this.samples.add( $.extend(true, {}, this.current_data) );
            this.mainHeaderView.stopRefresh();
            this.startPolling();
        },

        fetchError: function(response) {
            // Record an error message to MainHeaderView.
            var message = "There was a problem fetching status information from the server. (Error " + response.status + ": " + response.statusText + ")";
            this.ready = false;
            // Add an error sample to this.samples.
            var dummy_sample = new SampleModel({
                "hostname": this.current_data.get("hostname"),
                "error": message
            });
            this.samples.add(dummy_sample);
            this.mainHeaderView.errorDuringRefresh(message);
        }
    });
});
