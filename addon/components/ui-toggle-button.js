import Ember from 'ember';
const { computed, $, A, run, on, typeOf, debug, ObjectProxy, defineProperty, get, set} = Ember; // jshint ignore:line
import layout from '../templates/components/ui-button';
import UiButton from 'ui-button/components/ui-button';

export default UiButton.extend({
  layout: layout,
  onTitle: 'On',
  offTitle: 'Off',
  onValue: true,
  offValue: false,
  isToggleable: true,
  clickEffect: 'pulse',
  toggleEffect: computed.alias('clickEffect')

});
