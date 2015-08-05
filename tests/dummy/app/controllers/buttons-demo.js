import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line

export default Ember.Controller.extend({

  d: false,
  s: 'normal',
  howMany: null,
  canBeEmptyValues: [
    { title: 'Yes', value: true },
    { title: 'No', value: false }
  ],
  sizes: [
    { title: 'Tiny', value: 'tiny' },
    { title: 'Small', value: 'small' },
    { title: 'Default', value: null, selected: true},
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
  activeButtonMood: 'success',
  inactiveButtonMood: 'default',


  actions: {
    changed: function(newValue,oldValue) {
      window.alert(`Value changed from "${oldValue}" to "${newValue}"`);
    },
    disablement(cmd, item) {
      if(cmd === 'toggled') {
        console.log('setting d to %s', item.get('value'));
        this.set('d', item.get('value'));
      }
    }
  }

});
