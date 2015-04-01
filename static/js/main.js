/**
 * Created by kohlmannj on 3/30/15.
 */

/* jshint browser:true */
/* global define */
'use strict';

define(function(require) {
    var UptimeApplication = require('UptimeApplication');

    var instance = new UptimeApplication();

    instance.start();
});
