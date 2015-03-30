/* global requirejs */

require.config({
    baseUrl: '/static/',
    paths: {
        'flask_util_js':
                      ['{{ url_for("flask_util_js") }}'],
        'jquery':     ['//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min',
                       'bower_components/jquery/dist/jquery.min'],
        'underscore': ['//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
                       'bower_components/underscore/underscore'],
		'backbone':   ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
                       'bower_components/backbone/backbone'],
        'd3':         ['//cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min',
                       'bower_components/d3/d3.min.js'],
        'marionette': ['//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.2.2/backbone.marionette',
                       'bower_components/marionette/lib/backbone.marionette.min']
    }
});