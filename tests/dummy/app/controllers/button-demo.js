import Ember from 'ember';

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
      let {id,value} = Ember.getProperties(btn, 'id','value');
      let type = Ember.typeOf(value);
      if(type === 'object') {
        value = JSON.stringify(value);
      }
      const message = `Button[${id}] pressed with a parameter of type "${type}": ${value}`;
      console.log(message);
      window.alert(message);
    }
  }

});
