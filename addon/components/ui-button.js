import Ember from 'ember';
import Stylist from 'ember-cli-stylist/mixins/shared-stylist';
const { keys, create } = Object; // jshint ignore:line
const { RSVP: {Promise, all, race, resolve, defer} } = Ember; // jshint ignore:line
const { inject: {service} } = Ember; // jshint ignore:line
const { computed, observer, $, run, on, typeOf, isPresent } = Ember;  // jshint ignore:line
const { defineProperty, get, set, inject, isEmpty, merge } = Ember; // jshint ignore:line
const a = Ember.A; // jshint ignore:line

import layout from '../templates/components/ui-button';

export default Ember.Component.extend(Stylist, {
  layout: layout,
  tagName: '',

  mood: 'primary',
  outline: false,
  _outline: computed('outline', function() {
    const outline = this.get('outline');
    return outline ? '-outline' : '';
  }),
  type: 'button',
  keepFocus: false,
  size: null,
  iconPulse: false,
  iconSpin: false,
  tooltipPlace: 'top',
  tooltipEffectClass: 'grow',
  tooltipTypeClass: 'light',
  tooltipSpacing: computed('_size', function() {
    const size = this.get('_size');
    switch(size) {
    case 'btn-huge':
      return 30;
    default:
      return 10;
    }
  }),
  tooltipAuto: true,

  _size: computed('size', function() {
    const size = this.get('size');
    switch(size) {
    case 'huge':
    case 'hg':
      return 'btn-huge';
    case 'large':
    case 'lg':
      return 'btn-lg';
    case 'default':
    case 'medium':
    case 'md':
      return '';
    case 'small':
    case 'sm':
      return 'btn-sm';
    case 'tiny':
    case 'tn':
      return 'btn-tiny';
    default:
      return '';
    }
  }),
  actions: {
    onClick(context, evt) {
      if (this.keepFocus) {
        context.$().focus();
      } else {
        context.$().blur();
      }
      if(this.attrs.onClick) {
        this.attrs.onClick({
          button: this,
          context: context,
          evt: evt,
          value: this.get('value')
        });
      }
  }
  }


});
