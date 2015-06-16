import Ember from 'ember';
const {
  computed, observer, $, A, run, on, typeOf, debug, ObjectProxy, // jshint ignore:line
  defineProperty, keys, get, set, inject, isEmpty                // jshint ignore:line
} = Ember;

import layout from '../templates/components/ui-button';
import UiButton from 'ui-button/components/ui-button';

export default UiButton.extend({
  layout: layout,

  on: 'On',
  onValue: true,
  off: 'Off',
  offValue: false,
  onStyle: 'default',
  offStyle: 'default',
  onIcon: null,
  offIcon: null,
  clickEffect: 'pulse',
  toggleState: null, // boolean toggle state, null state means uninitialized
  _toggleStateInitializer: on('init', function() {
    const {value,offValue} = this.getProperties('value','offValue');
    this.set('toggleState', value === offValue ? false : true);
  }),
  value: computed('toggleState', {
    set: function(index,value) {
      return value;
    },
    get: function() {
      return this.get('toggleState') ? this.get('onValue') :this.get('offValue');
    }
  }),
  _toggleInit: Ember.on('didInsertElement', function() {
    let title = this.get('toggleState') ? this.get('on') : this.get('off');
    let style = this.get('toggleState') ? this.get('onStyle') : this.get('offStyle');
    let icon = this.get('toggleState') ? this.get('onIcon') : this.get('offIcon');

    this.set('title', title);
    if(icon) {
      this.set('icon',icon);
    }
    this.set('style', style);
  }),
  toggleEffect: Ember.computed.alias('clickEffect'),


  click: function() {
    let title = this.toggleProperty('toggleState') ? this.get('on') : this.get('off');
    let style = this.get('toggleState') ? this.get('onStyle') : this.get('offStyle');
    let icon = this.get('toggleState') ? this.get('onIcon') : this.get('offIcon');
    this.set('title',title);
    if(icon) {
      this.set('icon',icon);
    }
    this._super();
    this.set('style',style);
  }

});
