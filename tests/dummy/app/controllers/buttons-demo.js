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
  activeButtonMood: 'success',
  inactiveButtonMood: 'default',
  size: null,
  cardinality: null,


  actions: {
    changed: function(property,value) {
      if(property === 'values') {
        this.get('flashMessages').success(`Value changed to: ${value}`);
        this.set('actionValues', value);
      }
      if(property === 'disabled') {
        let desc;
        if(typeOf(value) ==='boolean') {
          desc = value ? 'true' : 'false';
        } else {
          desc = `"${value}"`;
        }
        this.get('flashMessages').success(`Disabled changed to: ${desc}`);
      }
    },
    error(code,desc) {
      this.get('flashMessages').danger(`${desc} [${code}].`);
    },
    action(cmd,source) {
      this.get('flashMessages').info(`"${cmd}" command was sent by ${source.get('value')}`);
    },
    disablement(cmd, item) {
      if(cmd === 'toggled') {
        this.set('d', item.get('value'));
      }
    }
  }

});
