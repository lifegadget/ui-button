import Ember from 'ember';
const { computed, $, A, run, on, typeOf, debug, ObjectProxy, defineProperty, keys, get, set} = Ember; // jshint ignore:line
import layout from '../templates/components/ui-button';
import UiButton from 'ui-button/components/ui-button';

export default UiButton.extend({
  layout: layout,
  onTitle: 'On',
  offTitle: 'Off',
  onValue: true,
  offValue: false,
  isSelectable: true,
  clickEffect: 'pulse',
  toggleEffect: Ember.computed.alias('clickEffect')

});
