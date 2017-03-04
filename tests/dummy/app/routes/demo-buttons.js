import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const { RSVP: {Promise, all, race, resolve, defer} } = Ember; // jshint ignore:line
const { inject: {service} } = Ember; // jshint ignore:line
const { computed, observer, $, run, on, typeOf, isPresent } = Ember;  // jshint ignore:line
const { defineProperty, get, set, inject, isEmpty, merge } = Ember; // jshint ignore:line
const a = Ember.A; // jshint ignore:line

const camelize = thingy => {
  return thingy ? Ember.String.camelize(thingy) : thingy;
};
const htmlSafe = Ember.String.htmlSafe;

export default Ember.Route.extend({
  setupController(controller, post) {
    this._super(controller, post);
    controller.set('basicSetter', ['bar']);
    controller.set('explicitSetter', ['monkey']);
    controller.set('initCardinality', []);
    controller.set('showComponent', false);
    controller.set('fitFull', false);
    controller.set('align', 'center');
  },
  actions: {
    onChange(hash) {
      console.log('changed: ', hash);
      if(hash.context.name) {
        const controller = this.controllerFor('demo-buttons');
        controller.set(camelize(hash.context.name), hash.values);
        console.log(`set ${camelize(hash.context.name)} to "${hash.values}"`);
      }
      Ember.run.next(() => {
        this.get('flashMessages').success(htmlSafe(`The "${hash.name}" component has changed. The code was <b>${hash.code}</b>. New value is: <b>${hash.values}</b>`));
      });
    },
    onAlign(hash) {
      console.log(hash);
    },
    onError(hash) {
      console.log('error: ', hash);
      Ember.run.next(() => {
        if(hash.code === 'min-cardinality-not-met') {
          this.get('flashMessages').danger(htmlSafe(`The "${hash.context.name}" component didn't meet <b>cardinality requirements</b>[${hash.code}]`));
        } else {
          this.get('flashMessages').danger(htmlSafe(`The "${hash.context.name}" component has experienced an error: <b>${hash.code}</b>:<br><p>${hash.message}</p>`));
        }
      });
    }
  }
});
