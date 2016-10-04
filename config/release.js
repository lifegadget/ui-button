/* jshint node:true */
var RSVP = require('rsvp');
var simpleGit = require('simple-git')();

// For details on each option run `ember help release`
module.exports = {
  // local: true,
  // remote: 'some_remote',
  // annotation: "Release %@",
  // message: "Bumped version to %@",
  // manifest: [ 'package.json', 'bower.json', 'someconfig.json' ],
  publish: true,
  // strategy: 'date',
  // format: 'YYYY-MM-DD',
  timezone: 'Europe/London',
  //
  beforeCommit: function(project, versions) {
    require('../compile-css.js');
    return new RSVP.Promise(function(resolve) {
      simpleGit.add(['vendor/ui-button/ui-button.css'], function() {
        resolve();
      });
    });
  }
};
