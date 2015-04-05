/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var MessageModel = require("models/MessageModel");

    return Backbone.Collection.extend({
        model: MessageModel
    });
});
