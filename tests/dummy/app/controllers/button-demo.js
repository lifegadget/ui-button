import Ember from 'ember';

export default Ember.Controller.extend({

  isRepressed: true,
  yo: 'yo',
  toggledEnablement: false,
  isEnabled: true,
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
      const message = `Button[${elementId}] pressed with a parameter of type "${type}": ${value}`;
      console.log(message);
      window.alert(message);
    }
  }

});
