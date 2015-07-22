import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line

export default Ember.Controller.extend({

  isDisabled: false,
  howMany: null,
  canBeEmptyValues: [
    { title: 'Yes', value: true },
    { title: 'No', value: false }
  ],
  sizes: [
    { title: 'Tiny', value: 'tiny' },
    { title: 'Small', value: 'small' },
    { title: 'Default', value: null },
    { title: 'Large', value: 'large' },
    { title: 'Huge', value: 'huge' }
  ],
  dynButtons: 'Foo,Bar,Baz',
  icon: computed('iconStrategy', function() {
    const strategy = this.get('iconStrategy');
    return strategy === 'both' ? 'chevron-circle-right' : false;
  }),
  iconActive: computed('iconStrategy', function() {
    const strategy = this.get('iconStrategy');
    return strategy === 'active' ? 'circle' : false;
  }),
  iconInactive: computed('iconStrategy', function() {
    const strategy = this.get('iconStrategy');
    return strategy === 'inactive' ? 'circle-o' : false;
  }),
  iconStrategy: 'none',
  activeButtonMood: 'warning',
  inactiveButtonMood: 'default',

  actions: {
    changed: function(newValue,oldValue) {
      window.alert(`Value changed from "${oldValue}" to "${newValue}"`);
    }
  }

});
