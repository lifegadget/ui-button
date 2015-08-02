/* jshint node: true */
'use strict';

module.exports = {
  name: 'ui-button',
	description: 'buttons for ambitious Ember applications',
	included: function(app) {
		this._super.included(app);
    app.import('vendor/ui-button/ui-button.css');

    app.import('bower_components/animate.css/source/_base.css');
    app.import('bower_components/animate.css/source/attention_seekers/bounce.css');
    app.import('bower_components/animate.css/source/attention_seekers/flash.css');
    app.import('bower_components/animate.css/source/attention_seekers/pulse.css');
    app.import('bower_components/animate.css/source/attention_seekers/rubberBand.css');
    app.import('bower_components/animate.css/source/attention_seekers/shake.css');
    app.import('bower_components/animate.css/source/attention_seekers/swing.css');
    app.import('bower_components/animate.css/source/attention_seekers/tada.css');
    app.import('bower_components/animate.css/source/attention_seekers/wobble.css');
    // We need the babel polyfil for now ...
    app.import('bower_components/babel-polyfill/browser-polyfill.js', { prepend: true });
	}

};
