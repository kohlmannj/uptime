/**
 * Created by kohlmannj on 3/31/15.
 */

/* jshint browser:true */
/* global define */

define(function(require) {

    return {
        // Adapted from http://stackoverflow.com/a/6313008
        formattedDuration: function(number) {
            var sec_num = parseInt(number, 10); // don't forget the second param
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            var time = hours + ' hr, ' + minutes + ' min, ' + seconds + " sec";
            return time;
        }
    }
});