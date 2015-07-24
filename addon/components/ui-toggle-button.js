import Ember from 'ember';
const {
  computed, observer, $, A, run, on, typeOf, debug, ObjectProxy,
  defineProperty, keys, get, set, inject, isEmpty
} = Ember; // jshint ignore:line

import layout from '../templates/components/ui-button';
import UiButton from 'ui-button/components/ui-button';

export default UiButton.extend({
  layout: layout,
  on: 'On',
  onValue: true,
  off: 'Off',
  offValue: false,
  onMood: 'default',
  offMood: 'default',
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
  // Listen to value changes to ensure toggleState has stayed in sync
  _valueObserver: observer('value', function() {
    const {value,toggleState,offValue} = this.getProperties('value', 'toggleState', 'offValue');
    const expected = value === offValue ? false : true;
    if(toggleState !== expected) {
        this.refresh();
    }
  }),
  _toggleInit: Ember.on('didInsertElement', function() {
    let title = this.get('toggleState') ? this.get('on') : this.get('off');
    let mood = this.get('toggleState') ? this.get('onMood') : this.get('offMood');
    let icon = this.get('toggleState') ? this.get('onIcon') : this.get('offIcon');

    this.set('title', title);
    if(icon) {
      this.set('icon',icon);
    }
    this.set('mood', mood);
  }),
  toggleEffect: Ember.computed.alias('clickEffect'),

  click: function() {
    this.refresh();
    this._super();
  },
  refresh: function() {
    let title = this.toggleProperty('toggleState') ? this.get('on') : this.get('off');
    let mood = this.get('toggleState') ? this.get('onMood') : this.get('offMood');
    let icon = this.get('toggleState') ? this.get('onIcon') : this.get('offIcon');
    this.set('title',title);
    if(icon) {
      this.set('icon',icon);
    }
    // this.set('mood',mood);
  }
});
