// Generated by CoffeeScript 1.7.1

/*
sindemo

Sample and cubic interpolate the sin function, then print out max and average error.
 */

(function() {
  var Smooth, count, error, maxError, s, smooth_sin, totalError, x, _i;

  Smooth = require('./Smooth').Smooth;

  s = (function() {
    var _i, _ref, _results;
    _results = [];
    for (x = _i = 0, _ref = 1 / 8; _i < 1; x = _i += _ref) {
      _results.push(Math.sin(2 * Math.PI * x));
    }
    return _results;
  })();

  smooth_sin = (function(f) {
    var scaleVal;
    scaleVal = 0.5 * s.length / Math.PI;
    return function(x) {
      return f(x * scaleVal);
    };
  })(Smooth(s, {
    method: Smooth.METHOD_CUBIC,
    clip: Smooth.CLIP_PERIODIC
  }));

  totalError = 0;

  count = 0;

  maxError = 0;

  for (x = _i = -10; _i <= 10; x = _i += .001) {
    error = Math.abs(Math.sin(x) - smooth_sin(x));
    maxError = Math.max(error, maxError);
    totalError += error;
    count++;
  }

  console.log("Max Error:\t " + ((100 * maxError).toFixed(10)) + "%");

  console.log("Average Error:\t " + ((100 * totalError / count).toFixed(10)) + "%");

}).call(this);
