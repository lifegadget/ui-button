import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, get, set, inject } = Ember;    // jshint ignore:line

import layout from '../templates/components/ui-button';
import UiButton from 'ui-button/components/ui-button';

export default UiButton.extend({
  layout: layout,
  isToggleable: false,
  isSelectable: true

});
