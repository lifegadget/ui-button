import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('ui-button');
  this.route('demo-toggle-button');
  this.route('demo-button');
  this.route('demo-buttons');
});

export default Router;
