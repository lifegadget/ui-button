import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const { RSVP: {Promise, all, race, resolve, defer} } = Ember; // jshint ignore:line
const { inject: {service} } = Ember; // jshint ignore:line
const { computed, observer, $, run, on, typeOf, isPresent } = Ember;  // jshint ignore:line
const { defineProperty, get, set, inject, isEmpty, merge } = Ember; // jshint ignore:line
const a = Ember.A; // jshint ignore:line

import layout from '../templates/components/ui-button';

export default Ember.Component.extend({
  layout: layout,
  tagName: 'span',

  mood: 'primary',
  size: null,
  iconPulse: false,
  iconSpin: false,
  tooltipPlace: 'auto',
  tooltipEffect: 'grow',
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
      return 'btn-tiny'
    default:
      return '';
    }
  })
});
