import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line


export default Ember.Controller.extend({

  isRepressed: true,
  yo: 'yo',
  toggledEnablement: false,
  isEnabled: true,
    actions: {
    toggleRepression: function() {
      this.toggleProperty('isRepressed');
    },
    toggleEnablement: function() {
      this.toggleProperty('toggledEnablement');
    },
    buttonAction: function(action,btn) {
      let {elementId,value} = Ember.getProperties(btn, 'elementId','value');
      let type = Ember.typeOf(value);
      if(type === 'object') {
        value = JSON.stringify(value);
      }
      const flashMessages = Ember.get(this, 'flashMessages');
      flashMessages.success(`${elementId} button pressed with value: ${value} [${type}]`);
    }
  }

});
