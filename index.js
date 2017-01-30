'use strict';
/* jshint node: true */
const path = require('path');
const chalk = require('chalk');
const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
// const log = require('broccoli-stew').log;

module.exports = {
	name: 'ui-button',
	description: 'buttons for ambitious Ember applications',
	included: function(appOrAddon) {
    this._super.included(appOrAddon);
    var app = appOrAddon.app || appOrAddon;
    if (!app.registry.availablePlugins['ember-cli-sass']) {
      this.ui.writeLine(chalk.bold('ui-button: ') + ' did not detect ' + chalk.bold.green('ember-cli-sass') + ' so using CSS configuration (instead of SASS).');
      app.import('vendor/ui-button/ui-button.css');
    } else {
      // SASS being used
      const sassOptions = app.options.sassOptions || { includePaths: []};
      sassOptions.includePaths.push(path.join(__dirname, 'ui-button', 'bootstrap-source'));
    }
	},

  treeForStyles: function(tree) {
    const bootstrapPath = path.join('node_modules', 'bootstrap/scss');
    const trees = [];
    if(tree) {
      trees.push(tree);
    }
    const existingStyle = this._super.treeForStyles.apply(this, arguments);
    const bootstrap = new Funnel(bootstrapPath, {
      srcDir: '/',
      destDir: 'bootstrap-source'
    });
    trees.push(bootstrap);
    if (existingStyle) {
      trees.push(existingStyle);
    }

    return mergeTrees(trees);
  },

	isDevelopingAddon: function() {
		return false;
	}
};
