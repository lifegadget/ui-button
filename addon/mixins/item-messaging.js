import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line

export default Ember.Mixin.create({

  _registration: on('init', function() {
    const group = this.get('group');
    if(group) {
      group._registerItem(this);
    }
  }),
  _tellItem: function(messageType, ...args) {
    switch(messageType) {
      case 'disabled':
        this.set('disabled', args[0]);
        break;
      case 'activate':
        if(this.activate) {
          this.activate();
        }
        break;
    }
  }

});
