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
