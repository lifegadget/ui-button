/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    babel: {
      includePolyfill: true
    }
  });

  /*
    This build file specifes the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */
  app.import('bower_components/babel-polyfill/browser-polyfill.js', { prepend: true });
  app.import('bower_components/bootstrap/dist/css/bootstrap.css');
  app.import('bower_components/bootstrap/js/tooltip.js');
  app.import('bower_components/fontawesome/css/font-awesome.css');
  app.import('bower_components/babel-polyfill/browser-polyfill.js', { prepend: true });

  app.import('vendor/ui-button/ui-button.css');

  return app.toTree();
};
