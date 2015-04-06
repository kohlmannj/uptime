/* global requirejs */

require.config({
    baseUrl: '/static/js/',
    paths: {
        'text':       ['../bower_components/requirejs-text/text'],
        'html':       ['../bower_components/requirejs-html/html'],
        'main':       ['main'],
        'flask_util':
                      ['../../flask_util'],
        'jquery':     ['//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min',
                       '../bower_components/jquery/dist/jquery.min'],
        'underscore': ['//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
                       '../bower_components/underscore/underscore'],
		'backbone':   ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
                       '../bower_components/backbone/backbone'],
        'd3':         ['//cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min',
                       '../bower_components/d3/d3.min.js'],
        'marionette': ['//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.1/backbone.marionette',
                       '../bower_components/marionette/lib/backbone.marionette'],
        'smooth':     ['../lib/Smooth.js/Smooth'],
        'moment':     ['//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min',
                       '../bower_components/moment/moment']
    },

    shim: {
        'flask_util': {
			exports: "flask_util"
		},
        'smooth': {
            exports: "Smooth"
        }
    }
});
