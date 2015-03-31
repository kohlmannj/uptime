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

    var Sample = require("models/Sample");
    var SampleCollection = Backbone.Collection.extend({
        "model": Sample
    });

    var LayoutView = require("layout");
    var MainHeaderView = require("views/MainHeader");

    return Marionette.Application.extend({
        initialize: function() {
            this.samples = new SampleCollection();
            this.sample_url = flask_util.url_for("sample");

            this.setRootLayout();
            this.root.render();

            this.current_data = new Sample();
        },

        fetchSample: function() {
            $.getJSON(this.sample_url, _.bind(this.postFetchSample, this));
        },

        postFetchSample: function(response) {
            // Update this.current_data with the new values from the server.
            this.current_data.set(response);
            console.log(this.current_data.toJSON());
            // Add a deep copy of current_data to this.samples
            this.samples.add( $.extend(true, {}, this.current_data) );


            this.root.getRegion('header').show(new MainHeaderView({
                model: this.current_data
            }));
        },

        // Convention borrowed from Marionette version of TodoMVC.
        setRootLayout: function() {
            this.root = new LayoutView();
        }
    });
});
