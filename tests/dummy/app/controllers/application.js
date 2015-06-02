import Ember from 'ember';

export default Ember.Controller.extend({

  isRepressed: false,
  toggledEnablement: false,
  isIndexPage: Ember.computed.equal('currentPath', 'index'),
  notIndexPage: Ember.computed.not('isIndexPage'),

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
