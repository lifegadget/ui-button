import Ember from 'ember';
import layout from '../templates/components/ui-button-primative';

export default Ember.Component.extend({
  layout,
  tagName: 'button',
  attributeBindings: ['type', 'disabled', 'style'],
  classNameBindings: ['_class', 'active'],

  _class: Ember.computed('mood', 'outline', 'size', function() {
    const {mood, outline, size} = this.getProperties('mood', 'outline', 'size');
    return `ui-button btn btn-${mood}${outline} ${size}`;
  }),
  type: 'button',

  click(evt) {
    return this.attrs.onClick(this, evt);
  }
});
