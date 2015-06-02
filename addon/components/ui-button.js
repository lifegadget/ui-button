import Ember from 'ember';
import layout from '../templates/components/ui-button';
import SharedStyle from 'ui-button/mixins/shared-style';

export default Ember.Component.extend(SharedStyle,{
  layout: layout,
	tagName: 'button',
	attributeBindings: ['disabled:disabled', 'type', '_style:style'],
	classNameBindings: ['_prefixedStyle','_prefixedSize','delayedHover:delayed-hover'],
	classNames: ['btn','ui-button'],
	disabled: false,
  _disabled: Ember.observer('disabled', function() {
    const disabledEffect = this.get('disabledEffect');
    const enabledEffect = this.get('enabledEffect');
    if(this.get('disabled') && disabledEffect) {
      this.applyEffect(disabledEffect);
    }
    if(!this.get('disabled') && enabledEffect) {
      this.applyEffect(enabledEffect);
    }
  }),
  hasNoContent: Ember.computed('template','icon','title', function() {
    return !this.get('template') && !this.get('icon') && !this.get('title');
  }),
	name: 'Submit',
	value: 'submit',
  param: Ember.computed.alias('value'),
  _value: Ember.computed('value', function() {
    let value = this.get('value');
    if(!value) {
      return value;
    }
    if(String(value).slice(0,1) === '{' && String(value).slice(-1) === '}') {
      let object = {};
      try {
         object = JSON.parse(value);
      } catch (e) {
        console.warn('The value for ' + this.get('elementId') + ' looked like JSON but was malformed. Returning string instead. %o', e);
        return value;
      }
      return object;
    }

    return value;
  }),
  icon: null,
	type: 'button',
	style: 'default',
	_prefixedStyle: Ember.computed('style', function() {
    const style = this.get('style');
		return `btn-${style}`;
	}),
  delayedHover: true,
  size: 'normal',
  width: null,
  keepFocus: false, // keep focus on button after clicking?
	_prefixedSize: Ember.computed('style','size', function() {
    let size = this.get('size');
    if(!size) {
      size = 'normal';
    }
    let mapper = {
      normal: '',
      tiny: 'btn-xs',
      sm: 'btn-sm',
      small: 'btn-sm',
      lg: 'btn-lg',
      large: 'btn-lg',
      huge: 'btn-huge'
    };
    return mapper[this.get('size')];
	}),
  tooltip: false,
  tooltipPlacement: 'auto top',
  tooltipDelay: 500,
  tooltipHtml: true,
  tooltipTrigger: 'hover',
  tooltipTemplate: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
  // effects
  clickEffect: null,
  enabledEffect: null,
  disabledEffect: null,
	click: function() {
		this.sendAction('action', this.get('_value'));
    if(!this.get('keepFocus')) {
      this.$().blur();
    }
    if(this.clickEffect) {
      this.applyEffect(this.clickEffect);
    }
	},
  applyEffect: function(effect) {
    this.$().addClass('animated ' + effect);
    this.$().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
      this.$().removeClass('animated ' + effect);
    });
  },

  _didInsertElement: Ember.on('didInsertElement', function() {
    let tooltip = this.get('tooltip');
    if(tooltip) {
      let {
        tooltipPlacement: placement,
        tooltipDelay: delay,
        tooltipHtml: html,
        tooltipTrigger: trigger,
        tooltipTemplate: template} = this.getProperties('tooltipPlacement', 'tooltipDelay','tooltipHtml','tooltipTrigger','tooltipTemplate');
      Ember.run.next( () => {
        try {
          this.$().tooltip({
            title: tooltip,
            delay: {"show": delay, "hide": 200},
            html: html,
            trigger: trigger,
            placement: placement,
            template: template
          });
        } catch (e) {
          console.log('There was a problem setting up the tooltip on [' + this.get('elementId') + '], ensure Bootstrap\'s JS is included in the vendor JS.\n%o',e);
        }
      });
    }
  }),
  _willRemoveElement: Ember.on('willRemoveElement', function() {
    if(this.get('tooltip')){
      this.$().tooltip('destroy');
    }
  })


});
