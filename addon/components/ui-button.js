import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line
import layout from '../templates/components/ui-button';
import SharedMood from 'ui-button/mixins/shared-style';
import ItemMessaging from 'ui-button/mixins/item-messaging';

export default Ember.Component.extend(SharedMood,ItemMessaging,{
  layout: layout,
	tagName: 'button',
  group: null,
	attributeBindings: ['disabled:disabled', 'type', '_mood:mood'],
	classNameBindings: ['_mood','_prefixedSize','delayedHover:delayed-hover'],
	classNames: ['btn','ui-button'],

  selectedValues: computed('group.values',{
    set: function(param,value) {
      if(typeOf(value) === 'string') {
        value = value.split(',');
      }
      return value;
    },
    get: function() {
      const values = this.get('group.values');

      return values ? values : ['getter'];
    }
  }),
  disabledValues: ['monkey'],
  selected: computed('selectedValues','value',{
    set:function(param,value,oldValue) {
      console.log('%s was set to value "%s"; old value was "%s"', param,value,oldValue);
      return value;
    },
    get:function() {
      const selectedValues = new A(this.get('selectedValues'));
      const value = this.get('value');
      return selectedValues.contains(value);
    }
  }),
	disabled: false,
  enabled: true,
  _enabledObserver: observer('enabled', function() {
    const {enabled, disabled} = this.getProperties('enabled', 'disabled');
    if(enabled === disabled) {
      this.set('disabled', !enabled);
    }
  }),
  _disabledObserver: Ember.observer('disabled', function() {
    const {enabled, disabled} = this.getProperties('enabled', 'disabled');
    const disabledEffect = this.get('disabledEffect');
    const enabledEffect = this.get('enabledEffect');
    if(this.get('disabled') && disabledEffect) {
      this.applyEffect(disabledEffect);
    }
    if(!this.get('disabled') && enabledEffect) {
      this.applyEffect(enabledEffect);
    }
    // keep 'enabled' in sync
    if(enabled === disabled) {
      this.set('enabled', !disabled);
    }
  }),
  hasNoContent: Ember.computed('template','icon','title', function() {
    return !this.get('template') && !this.get('icon') && !this.get('title');
  }),
	name: 'Submit',
  title: null,
  _title: computed.alias('title'), // in some sub-classes this will be overwritten
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
  _icon: computed.alias('icon'), // in some sub-classes this will be overwritten
	type: 'button',
	mood: 'default',
	_mood: Ember.computed('mood', function() {
    const mood = this.get('mood');
		return `btn-${mood}`;
	}),
  delayedHover: true,
  size: 'normal',
  width: null,
  keepFocus: false, // keep focus on button after clicking?
	_prefixedSize: Ember.computed('mood','size', function() {
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
  // activate: function() {
    // this._tellGroup('item-clicked',this);
  // },
	click: function() {
		this.sendAction('action', this.get('_value')); // send generic action event (for non-grouped buttons)
    this._tellGroup('activate',this);
    this._tellGroup('btnEvent', 'click', this);
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


  _init: on('init', function() {
    this._tellGroup('registration', this);
    const tooltip = this.get('tooltip');
    if(tooltip) {
      let {
        tooltipPlacement: placement,
        tooltipDelay: delay,
        tooltipHtml: html,
        tooltipTrigger: trigger,
        tooltipTemplate: template} = this.getProperties('tooltipPlacement', 'tooltipDelay','tooltipHtml','tooltipTrigger','tooltipTemplate');
      run.next( () => {
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
  _willRemoveElement: on('willDestroyElement', function() {
    if(this.get('tooltip')){
      this.$().tooltip('destroy');
    }
  }),

  buttonActions: {
    disable: function(self, value, ifValue) {
      if(ifValue) {
        const isContained = new A(ifValue).contains(self.get('value'));
        self.set('disabled', isContained);
      } else {
        self.set('disabled', value);
      }
      if(!ifValue || new A(ifValue).contains(self.get('value'))) {
        self.set('disabled', value);
      }
    }
  }



});
