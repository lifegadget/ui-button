import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('ui-button');
  this.route('ui-toggle-button');
  this.route('ui-buttons');
});

export default Router;
