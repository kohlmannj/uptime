/**
 * Created by kohlmannj on 4/4/15.
 */

define(function(require) {
    'use strict';

    require("marionette");
    var MessageCollection = require("models/MessageCollection");
    var MessageView = require("views/MessageView");

    // Ask for permission to display local notifications.
    // From https://developer.apple.com/library/safari/documentation/NetworkingInternet/Conceptual/NotificationProgrammingGuideForWebsites/LocalNotifications/LocalNotifications.html
    return Marionette.CollectionView.extend({
        collection: MessageCollection,
        childView: MessageView,
        initialize: function() {
            if (!'Notification' in window) {
                // If the browser version is unsupported, remain silent.
                return;
            }
            // If the user has not been asked to grant or deny notifications from this domain...
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    });
});
