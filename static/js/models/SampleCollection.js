/* jshint browser:true */
/* global define */

define(function(require) {
    'use strict';

    var Backbone = require('backbone');
    var SampleModel = require("models/SampleModel");

    return Backbone.Collection.extend({
        model: SampleModel
    });
});
