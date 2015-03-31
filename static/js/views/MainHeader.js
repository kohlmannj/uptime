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
                return utils.formattedDuration(this.uptime);
            }
        },
        modelEvents: {
            "change": "render"
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
        }
    });
});
