/* jshint node: true */
/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

var app = new EmberAddon();
app.import('bower_components/bootstrap/dist/css/bootstrap.css');
app.import('bower_components/bootstrap/js/tooltip.js');
app.import('bower_components/animate.css/source/_base.css');
app.import('bower_components/animate.css/source/attention_seekers/bounce.css');
app.import('bower_components/animate.css/source/attention_seekers/flash.css');
app.import('bower_components/animate.css/source/attention_seekers/pulse.css');
app.import('bower_components/animate.css/source/attention_seekers/rubberBand.css');
app.import('bower_components/animate.css/source/attention_seekers/shake.css');
app.import('bower_components/animate.css/source/attention_seekers/swing.css');
app.import('bower_components/animate.css/source/attention_seekers/tada.css');
app.import('bower_components/animate.css/source/attention_seekers/wobble.css');

app.import('bower_components/fontawesome/css/font-awesome.css');
app.import('bower_components/fontawesome/fonts/fontawesome-webfont.eot');
app.import('bower_components/fontawesome/fonts/fontawesome-webfont.svg');
app.import('bower_components/fontawesome/fonts/fontawesome-webfont.ttf');
app.import('bower_components/fontawesome/fonts/fontawesome-webfont.woff');
app.import('bower_components/fontawesome/fonts/fontawesome-webfont.woff2');
app.import('bower_components/fontawesome/fonts/FontAwesome.otf');

app.import('vendor/ui-button/ui-button.css');


module.exports = app.toTree();
