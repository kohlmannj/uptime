/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define */
'use strict';

define(function(require) {
    var application = require('application');

    var instance = new application();

    instance.on("start", function() {
        this.setRootLayout();
        this.root.render();
    });

    // Load some initial data, and then start our application
    instance.start();
});
