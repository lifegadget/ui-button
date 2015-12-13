/* jshint node: true */
'use strict';

module.exports = {
  name: 'ui-button',
	description: 'buttons for ambitious Ember applications',
	included: function(app,parentAddon) {
		this._super.included(app);
    app.import('vendor/ui-button/ui-button.css');
    var target = (parentAddon || app);

    target.options.babel = target.options.babel || { includePolyfill: true };
    target.import('bower_components/animate.css/source/_base.css');
    target.import('bower_components/animate.css/source/attention_seekers/bounce.css');
    target.import('bower_components/animate.css/source/attention_seekers/flash.css');
    target.import('bower_components/animate.css/source/attention_seekers/pulse.css');
    target.import('bower_components/animate.css/source/attention_seekers/rubberBand.css');
    target.import('bower_components/animate.css/source/attention_seekers/shake.css');
    target.import('bower_components/animate.css/source/attention_seekers/swing.css');
    target.import('bower_components/animate.css/source/attention_seekers/tada.css');
    target.import('bower_components/animate.css/source/attention_seekers/wobble.css');
	}

};
