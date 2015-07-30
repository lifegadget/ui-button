import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line

import layout from '../templates/components/test-cp';

export default Ember.Component.extend({
  layout: layout,
  disabled: computed({
     /**
      * Explicit setter allows setting with boolean, string, or array operators. With boolean
      * all of the registered controls are added/removed from the set. With string it will
      * check first to see if the string starts with "ember..." if so then it will assume
      * this is a direct reference to the elementId, otherwise it will assume its a value
      * and any items which match this value will have their elementId looked up.
      */
      set(param,setter) {
       console.log('GROUP SET disabled: %o', setter);
       return new Set(String(setter));
     },
     get() {
      console.log('GROUP GET disabled');
      return new Set();
     }
  })

});
