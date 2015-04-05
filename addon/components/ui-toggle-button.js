import Ember from 'ember';
import layout from '../templates/components/ui-button';
import UiButton from 'ui-button/components/ui-button';

export default UiButton.extend({
  layout: layout,
  
  on: 'On',
  off: 'Off',
  onStyle: 'default',
  offStyle: 'default',
  onIcon: null,
  offIcon: null,
  clickEffect: 'pulse',
  toggleState: false,
  value: Ember.computed.alias('toggleState'),
  _toggleInit: Ember.on('didInsertElement', function() {
    let title = this.get('toggleState') ? this.get('on') : this.get('off');
    let style = this.get('toggleState') ? this.get('onStyle') : this.get('offStyle');
    let icon = this.get('toggleState') ? this.get('onIcon') : this.get('offIcon');
  
    this.set('title', title);
    if(icon) {
      this.set('icon',icon);
    }
    this.set('style', style);
  }),
  toggleEffect: Ember.computed.alias('clickEffect'),
  
  
  click: function() {
    let title = this.toggleProperty('toggleState') ? this.get('on') : this.get('off');
    let style = this.get('toggleState') ? this.get('onStyle') : this.get('offStyle');
    let icon = this.get('toggleState') ? this.get('onIcon') : this.get('offIcon');
    this.set('title',title);
    if(icon) {
      this.set('icon',icon);
    }
    this._super();
    this.set('style',style);
  }

});
