import Ember from 'ember';

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
    buttonAction: function(param) {
      let type = Ember.typeOf(param);
      if(type === 'object') {
        param = JSON.stringify(param);
      }
      window.alert('Button pressed with a parameter of type "' + type + '": ' + param);
    }
  }

});
