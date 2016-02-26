import Ember from 'ember';
import layout from '../templates/components/ui-button-primative';

export default Ember.Component.extend({
  layout,
  tagName: 'button',
  attributeBindings: ['type', 'disabled', 'style', 'value'],
  classNameBindings: ['_class', 'active'],

  _class: Ember.computed('mood', 'outline', 'size', function() {
    let {mood, outline, size} = this.getProperties('mood', 'outline', 'size');
    mood = mood ? `btn-${mood}` : 'btn-secondary';
    return `ui-button btn ${mood}${outline} ${size}`;
  }),
  type: 'button',

  click(evt) {
    return this.attrs.onClick(this, evt);
  }
});
