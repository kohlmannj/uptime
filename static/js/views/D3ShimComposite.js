/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var _ = require("underscore");
    require("marionette");

    var template = require("text!templates/D3ShimComposite.html");

    return Marionette.CompositeView.extend({
        template: _.template(template),
        childViewContainer: ".wrapper"
    });
});
