/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var _ = require("underscore");
    var Marionette = require('marionette');
    var utils = require("utils");
    var template = require("text!templates/MainHeader.html");

    return Marionette.ItemView.extend({
        template: _.template(template),
        templateHelpers: {
            formattedUptime: function() {
                if (typeof this.uptime === "number") {
                    return utils.formattedDuration(this.uptime);
                } else {
                    return "Unknown";
                }
            }
        },

        modelEvents: {
            "change": "update"
        },

        ui: {
            "refresh": ".refresh:not(.alert)",
            "alert": ".refresh.alert"
        },

        events: {
            "click @ui.refresh": "triggerRefresh",
            "click @ui.alert": "showErrorMessage"
        },

        initialize: function() {
            this.errorMessage = "There was a problem fetching status information from the server."
        },

        triggerRefresh: function(e) {
            if (e) {
                e.preventDefault();
            }
            this.trigger("refresh");
        },

        startRefresh: function(e) {
            this.ui.refresh.removeClass("reset-transition").addClass("refreshing");
            this.$el.find(".note").addClass("refreshing");
        },

        stopRefresh: function() {
            this.ui.refresh.removeClass("refreshing alert").addClass("reset-transition");
            this.errorMessage = null;
            this.$el.find(".note").removeClass("alert");
        },

        errorDuringRefresh: function(message) {
            this.errorMessage = message;
            this.ui.refresh
                .removeClass("reset-transition")
                .removeClass("refreshing")
                .addClass("alert")
            ;
            this.$el.find(".note").addClass("alert");
        },

        showErrorMessage: function() {
            window.alert(this.errorMessage);
        },

        // From http://stackoverflow.com/a/14679936
        onRender: function () {
            // Get rid of that pesky wrapping-div.
            // Assumes 1 child element present in template.
            this.$el = this.$el.children();
            // Unwrap the element to prevent infinitely
            // nesting elements during re-render.
            this.$el.unwrap();
            this.setElement(this.$el);
        },

        update: function() {
            // Update hostname
            this.$el.find("strong").text( this.model.get("hostname") );
            // Update uptime
            var newFormattedUptime = "Unknown";
            if (typeof this.model.get("uptime") === "number") {
                newFormattedUptime = utils.formattedDuration(this.model.get("uptime"));
            }
            this.$el.find(".note")
                .removeClass("refreshing")
                .text(newFormattedUptime + " uptime")
            ;
            // Update "last updated" title text
            this.$el.find(".headerInfo").attr("title", "Last updated: " + new Date(this.model.get("timestamp")).toString());
            // Flash the refresh icon to indicate a successful update
            this.ui.refresh.addClass("update");

            setTimeout(_.bind(function() {
                this.ui.refresh.removeClass("update").addClass("reset-transition");

                setTimeout(_.bind(function() {
                    this.ui.refresh.removeClass("reset-transition");
                }, this), 250);
            }, this), 500);
        }
    });
});
