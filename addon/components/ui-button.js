import Ember from 'ember';
import Stylist from 'ember-cli-stylist/mixins/shared-stylist';
import ddau from '../mixins/ddau';
const { computed, $ } = Ember;
const a = Ember.A;

import layout from '../templates/components/ui-button';

const button = Ember.Component.extend(Stylist, ddau, {
  layout: layout,
  tagName: '',
  init() {
    this._super(...arguments);
    if(!this.elementId) {
      this.elementId = 'button-' + Math.random().toString(36).substr(2, 9);
    }
  },

  mood: 'primary',
  orient: computed.alias('stack'),
  orientation: computed.alias('stack'),
  stack: 'horizontal',
  outline: false,
  _outline: computed('outline', function() {
    const outline = this.get('outline');
    return outline ? '-outline' : '';
  }),
  type: 'button',
  activeValues: computed(() => ([]) ),
  active: computed('activeValues', {
    set(_, value) {
      return value;
    },
    get() {
      return a(this.get('activeValues')).contains(this.get('value'));
    }
  }),
  keepFocus: false,
  size: null,
  iconPulse: false,
  iconSpin: false,
  _class: Ember.computed('mood', '_outline', 'size', 'class', 'active', 'align', function() {
    let {mood, _outline, _size, active, inline, align} = this.getProperties('mood', '_outline', '_size', 'active', 'inline', 'align');
    const classy = this.get('class') || '';
    mood = mood ? ` btn-${mood}` : ' btn-secondary';
    const activeClass = active ? ' active' : ' ';
    const display = inline ? ' inline' : ' block';
    align = align ? ` align-${align}` : '';
    return `ui-button btn ${classy}${activeClass}${mood}${_outline}${_size}${display}${align}`;
  }),
  disabled: false,

  _size: computed('size', function() {
    const size = this.get('size');
    switch(size) {
    case 'huge':
    case 'hg':
      return ' btn-huge';
    case 'large':
    case 'lg':
      return ' btn-lg';
    case 'default':
    case 'medium':
    case 'md':
      return '';
    case 'small':
    case 'sm':
      return ' btn-sm';
    case 'tiny':
    case 'tn':
      return ' btn-tiny';
    default:
      return '';
    }
  }),
  actions: {
    onClick(context, evt) {
      const value = this.get('value');
      if (this.keepFocus) {
        $(`#${context.elementId}`).focus();
      } else {
        $(`#${context.elementId}`).blur();
      }
      this.ddau('onClick', {
        value: value,
        context: context,
        dom: document.getElementById(this.elementId),
        event: evt
      }, value);
    }
  }
});
button.reopenClass({
  positionalParams: ['title']
});
button[Ember.NAME_KEY] = 'ui-button';
export default button;
