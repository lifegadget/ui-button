/* jshint node: true */
'use strict';

module.exports = {
  name: 'ui-button',
	description: 'buttons for ambitious Ember applications',
	included: function(app) {
		this._super.included(app);
    app.import('vendor/ui-button/ui-button.css');
    app.import('vendor/ui-button/ui-buttons.css');
	}
};
