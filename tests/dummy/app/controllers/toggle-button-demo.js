import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line

export default Ember.Controller.extend({

  fruit: 'apple',
  isRepressed: false,
  toggledEnablement: false,
  actions: {
    toggleRepression: function() {
      console.log('toggling');
      this.toggleProperty('isRepressed');
    },
    toggleEnablement: function() {
      console.log('toggling');
      this.toggleProperty('toggledEnablement');
    },
    buttonAction: function(action,btn) {
       let {elementId,value} = Ember.getProperties(btn, 'elementId','value');
       let type = Ember.typeOf(value);
       if(type === 'object') {
         value = JSON.stringify(value);
       }
       const flashMessages = Ember.get(this, 'flashMessages');
       if(action === 'pressed') {
         flashMessages.success(`${elementId} button PRESSED with value: ${value} [${type}]`);
       }
       else if(action === 'toggled') {
        const toggleValue = get(btn, 'toggled') ? 'ON' : 'OFF';
        flashMessages.info(`${elementId} button TOGGLED to ${toggleValue}`);
       } else {
        flashMessages.warning(`${elementId} fired the ${action} action-type`);
       }

     }
  }

});
