import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line

import layout from '../templates/components/ui-button';
import UiButton from 'ui-button/components/ui-button';

export default UiButton.extend({
  layout: layout,
  classNameBindings: ['isActive:active'],
  selected: computed.alias('group.selected'),
  _selectionObserver: observer('selected', function() {
    const { selected, elementId } = this.getProperties('selected', 'elementId');
    this.set('toggleState', selected === elementId);
  }),
  isActive: computed('selected','elementId', 'toggleState', function() {
    return this.get('selected') === this.get('elementId');
  }),
  // TITLE
  title: null,
  active: null, // will override title if set (while in active state)
  inactive: null, // will overrride title if set (while in inactive state)
  _title: computed('title', 'active', 'inactive', 'toggleState', function() {
    const { title, active, inactive, toggleState } = this.getProperties('title', 'active', 'inactive', 'toggleState');
    if (toggleState) {
      return active ? active : title;
    } else {
      return inactive ? inactive : title;
    }
  }),
  // mood
  mood: 'default',
  moodActive: null,
  moodInactive: null,
  _mood: computed('mood', 'moodActive', 'moodInactive', 'toggleState', function() {
    const { mood, moodActive, moodInactive , toggleState } = this.getProperties('mood', 'moodActive', 'moodInactive', 'toggleState');
    let moodFamily;
    if (toggleState) {
      moodFamily = moodActive ? moodActive : mood;
    } else {
      moodFamily = moodInactive ? moodInactive : mood;
    }
    moodFamily = moodFamily ? moodFamily : 'default';

    return `btn-${moodFamily}`;
  }),

  // ICON
  icon: null,
  iconActive: null,
  iconInactive: null,
  _icon: computed('iconActive', 'iconInactive', 'icon', 'toggleState', function() {
    const { icon, iconActive, iconInactive, toggleState } = this.getProperties('icon', 'iconActive', 'iconInactive', 'toggleState');
    if (toggleState) {
      return iconActive ? iconActive : icon;
    } else {
      return iconInactive ? iconInactive : icon;
    }
  }),

  canBeEmpty: computed.alias('group.canBeEmpty'),
  // clickEffect: 'pulse',

  toggleState: false,
  value: true, // this can be set to any value and represents the "state" when this radio choice is selected
  click: function() {
    const {elementId, selected, canBeEmpty} = this.getProperties('elementId', 'selected', 'canBeEmpty');
    if(elementId === selected && canBeEmpty ) {
      this._tellGroup('deactivate', this);
    } else {
      this._tellGroup('activate',this);
    }
    if(!this.get('keepFocus')) {
      this.$().blur();
    }
    if(this.clickEffect) {
      this.applyEffect(this.clickEffect);
    }
  },

});
