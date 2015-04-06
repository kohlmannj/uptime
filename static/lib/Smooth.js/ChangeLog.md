#Smooth.js Change Log

This is a log of changes to the library itself. Other changes, like tests, are omitted.

##0.1.7

* Added properties to smoothed functions: `config`, `domain`, `count`, and `dimension`.

* Made code more concise.

##0.1.6

* Fixed bug where `Smooth()` would modify the config object passed to it, rather than working on a copy

##0.1.5

* Lanczos interpolation. See [Lanczos resampling](http://en.wikipedia.org/wiki/Lanczos_resampling).

* Windowed sinc filter interpolation. See [sinc filter](http://en.wikipedia.org/wiki/Sinc_filter). 

* Deep input validation; input arrays are now thoroughly examined when calling `Smooth()`. Disable with 
`Smooth.deepValidation = false`. 

* `scaleTo` with ranges; you can now scale the function's domain to fit to a specific range.


##0.1.3

* New `scaleTo` config option scales the output function's domain.

* Changed enums to string constants. For example, you can use either `Smooth.METHOD_CUBIC` or just `'cubic'`.

##0.1.2

* Fixed tension parameter bug in cubic splines. Catmull-Rom splines are now the default.


##0.1.0

(Initial release)