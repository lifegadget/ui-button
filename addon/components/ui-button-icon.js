import Ember from 'ember';
import layout from '../templates/components/ui-button-icon';

const icon = Ember.Component.extend({
  layout,
  tagName: '',
  icon: null
});
icon.reopenClass({
  positionalParams: ['icon']
});
icon[Ember.NAME_KEY] = 'ui-button-icon';
export default icon;
