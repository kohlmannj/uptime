/**
 * Created by kohlmannj on 4/4/15.
 */

define(function(require) {
    'use strict';

    var _ = require("underscore");
    require("marionette");
    var utils = require("utils");
    var moment = require("moment");
    var MessageModel = require("models/MessageModel");
    var template = require("text!templates/Message.html");

    return Marionette.ItemView.extend({
        model: MessageModel,
        template: _.template(template),
        tagName: "dl",

        attributes: function() {
            return {
                "data-error": this.model.get("sample").get("error"),
                "data-id": this.model.get("sample").id
            }
        },

        templateHelpers: function() {
            var sample = this.model.get("sample");
            return {
                formattedTimestamp: _.bind(function() {
                    if (typeof sample.get("timestamp") === "string") {
                        return moment(sample.get("timestamp")).calendar();
                    } else {
                        return "Unknown";
                    }
                }, this),
                noteTitle: _.bind(function() {
                    if (typeof sample.get("error") !== "string") {
                        return "Message";
                    }
                    else if (sample.get("error") === "HighLoadStart") {
                        return "High load alert";
                    }
                    else if (sample.get("error") === "HighLoadRecovered") {
                        return "Recovered from high load";
                    }
                }, this),
                noteBody: _.bind(function() {
                    return "Load: " + sample.get("avg_load_1min");
                }, this)
            };
        },

        events: {
            "mouseenter": "focusSample",
            "mouseleave": "blurSample"
        },

        focusSample: function(e) {
            e.stopPropagation();
            this.trigger("focusSample", this.model.get("sample"));
        },

        blurSample: function(e) {
            e.stopPropagation();
            this.trigger("blurSample", this.model.get("sample"));
        },

        // Ask for permission to display local notifications.
        // From https://developer.apple.com/library/safari/documentation/NetworkingInternet/Conceptual/NotificationProgrammingGuideForWebsites/LocalNotifications/LocalNotifications.html
        initialize: function() {
            if (!'Notification' in window) {
                // If the browser version is unsupported, remain silent.
                return;
            }
            // If the user has not been asked to grant or deny notifications from this domain...
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
            // If the user has granted permission for this domain to send notifications...
            else if (Notification.permission === 'granted') {
                var templateHelpers = this.templateHelpers();
                var n = new Notification(
                    templateHelpers.noteTitle() + " on " + this.model.get("sample").get("hostname"),
                    {
                      'body': templateHelpers.noteBody() + " (" + templateHelpers.formattedTimestamp() + ")",
                      // ...prevent duplicate notifications
                      'tag' : this.model.get("sample").get("timestamp")
                    }
                );
                // Remove the notification from Notification Center when clicked.
                n.onclick = this.focusSample;
                // Callback function when the notification is closed.
                n.onclose = this.blurSample;
            }
            // If the user does not want notifications to come from this domain...
            else if (Notification.permission === 'denied') {
                // ...remain silent.
                return;
            }
        }
    });
});
