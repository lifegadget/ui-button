import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  this.route('button-demo');
  this.route('toggle-button-demo');
  this.route('buttons-demo');
  this.route('buttons2-demo');

});
export default Router;
