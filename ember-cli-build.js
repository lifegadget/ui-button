/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberApp(defaults);

  app.import('bower_components/bootstrap/dist/css/bootstrap.css');
  app.import('bower_components/bootstrap/js/tooltip.js');
  app.import('bower_components/fontawesome/css/font-awesome.css');

  return app.toTree();
};
