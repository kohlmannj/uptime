/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define */
'use strict';

define(function(require) {
    var Application = require('application');

    var instance = new Application();

    instance.on("start", function() {
        this.fetchSample();
    });

    // Load some initial data, and then start our application
    instance.start();
});
