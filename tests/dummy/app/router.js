import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {

  this.route('button-demo');
  this.route('toggle-button-demo');
  this.route('buttons-demo');
  this.route('buttons2-demo');

});
