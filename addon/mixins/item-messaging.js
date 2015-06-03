import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line

export default Ember.Mixin.create({
  _registration: function() {
    this._tellGroup('registration', this);
  },
  _groupMessage: function(cmd, ...args) {
    switch(cmd) {
      case 'disabled':
        this.set('disabled', args[0]);
        break;
      case 'activate':
        if(this.activate) {
          this.activate();
        }
        break;
    }
  },
  _tellGroup: function(cmd, ...args) {
    const group = this.get('group');
    if(group) {
      console.log('telling group [%s]: %o', cmd, args);
      this.group._itemMessage(cmd, this, ...args);
    } else {
      this.sendAction(cmd, ...args);
    }
  },

  _init: on('beforeRender', function() {
    this._tellGroup('registration', this);
  })

});
