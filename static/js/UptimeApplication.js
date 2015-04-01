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

    return Marionette.Application.extend({
        initialize: function() {
            this.ready = false;

            this.samples = new SampleCollection();
            this.sample_url = flask_util.url_for("sample");

            // Initialize and render the root layout
            this.rootView = new RootLayoutView();
            this.rootView.render();

            // Create a new Sample
            this.current_data = new SampleModel(INITIAL_SAMPLE);

            // Render the header view
            this.rootView.getRegion('header').show(new MainHeaderView({
                model: this.current_data
            }));

            this.listenTo(this.rootView.getRegion('header').currentView, "refresh", this.fetchSample);

            this.poll = -1;
        },

        onStart: function() {
            // Start the application by starting the status update poll.
            this.startPolling();
        },

        startPolling: function() {
            this.ready = true;
            this.poll = setInterval(_.bind(this.fetchSample, this), 10000);
        },

        stopPolling: function() {
            this.ready = false;
            clearInterval(this.poll);
        },

        fetchSample: function() {
            this.stopPolling();
            this.rootView.getRegion('header').currentView.startRefresh();
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
            this.rootView.getRegion('header').currentView.stopRefresh();
            this.startPolling();
        },

        fetchError: function(response) {
            this.ready = false;
            //this.stopPolling();
            var message = "There was a problem fetching status information from the server. (Error " + response.status + ": " + response.statusText + ")";
            this.rootView.getRegion('header').currentView.errorDuringRefresh(message);
        }
    });
});
