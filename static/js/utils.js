/**
 * Created by kohlmannj on 3/31/15.
 */

/* jshint browser:true */
/* global define */

define(function(require) {

    var moment = require("moment");

    // Configure application-wide Moment.js locale settings
    moment.locale('en', {
        calendar : {
            lastDay :  '[Yesterday at] LTS',
            sameDay :  '[Today at] LTS',
            nextDay :  '[Tomorrow at] LTS',
            lastWeek : '[Last] dddd [at] LTS',
            nextWeek : '[This coming] dddd [at] LTS',
            sameElse : 'L at LTS'
        }
    });

    // From http://www.digitoffee.com/programming/get-local-time-utc-using-moment-js/94/
    // Note: do crazy MomentJS UTC unwrapping like this:
    // moment( moment.utc(this.timestamp).toDate() ).calendar()

    // Array Remove - By John Resig (MIT Licensed)
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };

    return {
        // Adapted from http://stackoverflow.com/a/6313008
        formattedDuration: function(seconds) {
            var duration = moment.duration(seconds, "seconds");
            var output = "";
            if (duration.days() > 0) {
                output += duration.days() + " day" + (duration.days() > 1 ? "s" : "");
            }
            if (duration.hours() > 0) {
                output +=
                    (output.length > 0 ? ", " : "") +
                    duration.hours() + " hr" + (duration.hours() > 1 ? "s" : "")
                ;
            }
            if (duration.minutes() > 0) {
                output +=
                    (output.length > 0 ? ", " : "") +
                    duration.minutes() + " min"
                ;
            }
            if (duration.seconds() > 0) {
                output +=
                    (output.length > 0 ? ", " : "") +
                    duration.seconds() + " sec"
                ;
            }
            return output;
        },

        getEventRelativePosition: function(event) {
            var xPosition = 0;
            var yPosition = 0;

            var element = event.currentTarget;

            while (element) {
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return { x: event.pageX - xPosition, y: event.pageY - yPosition };
        },

        // Adapted from http://stackoverflow.com/a/25061801
        indexOfClosest: function(arr, closestTo){

            var closest = Math.max.apply(null, arr); // Get the highest number in arr in case it match nothing.
            var closestIndex = 0;

            for(var i = 0; i < arr.length; i++){ // Loop the array
                if(arr[i] >= closestTo && arr[i] < closest) {
                    closest = arr[i];
                    closestIndex = i;
                } // Check if it's higher than your number, but lower than your closest value
            }

            return closestIndex; // return the value
        }
    }
});
