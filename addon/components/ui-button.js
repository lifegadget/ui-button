import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, get, set, inject } = Ember;    // jshint ignore:line
const camelize = thingy => {
  return thingy ? Ember.String.camelize(thingy) : thingy;
};
const objectifyJson = content => {
  if (typeOf(content) === 'string' && content.slice(0,1) === '{' && content.slice(-1) === '}') {
    let object = {};
    try {
     object = JSON.parse(content);
     return object;
    } catch (e) {
      // invalid JSON
    }
  }

  return content;
};
import layout from '../templates/components/ui-button';
import SharedMood from 'ui-button/mixins/shared-style';
import ItemMessaging from 'ui-button/mixins/item-messaging';

const contains = function(source, lookFor) {
  return typeOf(source) === 'array' ? source.filter( item => {
    return item === lookFor;
  }).length > 0 : false;
};
const MOOD_DEFAULT = 'btn-default';

export default Ember.Component.extend(SharedMood,ItemMessaging,{
  layout: layout,
  type: 'button',
	tagName: 'button',
  group: null,
	attributeBindings: ['disabled:disabled', 'type'],
	classNameBindings: ['mood','_prefixedSize','delayedHover:delayed-hover'],
	classNames: ['btn','ui-button'],

  selectedValues: [], // note: this is converted to point group after registration
  disabledValues: computed('group.disabled',{
    set: function(param,value) {
      if(typeOf(value) === 'string') {
        value = value.split(',');
      }
      return new A(value);
    },
    get: function() {
      return new A([]);
    }
  }),
  selected: computed('selectedValues',{
    set:function(param,value,oldValue) {
      console.log('%s was set to value "%s"; old value was "%s"', param,value,oldValue);
      return value;
    },
    get:function() {
      const selectedValues = new A(this.get('selectedValues'));
      const value = this.get('onValue');
      return contains(selectedValues,value);
    }
  }),
  disabled: computed('disabledValues','value', {
    set: function(prop, setterValue) {
      let {value,disabledValues} = this.getProperties('onValue','disabledValues');
      if(setterValue) {
        // this.applyEffect(this.get('disableEffect'));
        disabledValues = disabledValues.filter( item => {
          return item === value; // remove from list
        });
      } else {
        // this.applyEffect(this.enabled);
        disabledValues.pushObject(value);
      }

      return setterValue;
    },
    get: function() {
      const {value,disabledValues} = this.getProperties('value','disabledValues');
      return typeOf(disabledValues) === 'boolean' ? disabledValues : contains(disabledValues,value);
    }
  }),
  disabledObserver: observer('disabled', function() {
    const {disabled,disabledEffect,enabledEffect} = this.getProperties('disabled', 'disabledEffect', 'enabledEffect');
    this.applyEffect(disabled ? disabledEffect : enabledEffect);
  }),
  enabled: computed('disabled', {
    set: function(param,value) {
      this.set('disabled', !value);
      return value;
    },
    get: function() {
      return !this.get('disabled');
    }
  }),

  isEmpty: computed('template','icon','title', function() {
    return !this.get('template') && !this.get('icon') && !this.get('title');
  }),
	name: 'Submit',
  onTitle: null,
  offTitle: null,
  activeTitle: computed.alias('onTitle'),
  inactiveTitle: computed.alias('offTitle'),
  title: computed('onTitle','offTitle','selected',{
    set: function(param,value) {
      this.set('onTitle', value);
      this.set('offTitle', value);
      return value;
    },
    get: function() {
      const {onTitle,offTitle,selected} = this.getProperties('onTitle', 'offTitle', 'selected');
      if(selected) {
        return onTitle ? onTitle : '';
      } else {
        return offTitle ? offTitle : '';
      }
    }
  }),
  onValue: null,
  offValue: null,
  activeValue: computed.alias('onValue'),
  inactiveValue: computed.alias('offValue'),
  value: computed('onValue','offValue','selected','offTitle','onTitle',{
    set:function(prop,value) {
      value = objectifyJson(value); // if its a JSON string convert to object
      this.set('onValue', value);
      this.set('offValue', value);
      return value;
    },
    get:function() {
      const {onValue,offValue,selected,onTitle,offTitle} = this.getProperties('onValue', 'offValue', 'selected', 'onTitle', 'offTitle');
      if(selected) {
        return onValue ? onValue : camelize(onTitle);
      } else {
        return offValue ? offValue : camelize(offTitle);
      }
    }
  }),
  param: computed.alias('value'),

  onIcon: null,
  offIcon: null,
  activeIcon: computed.alias('onIcon'),
  inactiveIcon: computed.alias('offIcon'),
  icon: null,
  _icon: computed('icon','onIcon','offIcon','selected',function() {
      const {icon,onIcon,offIcon,selected} = this.getProperties('icon','onIcon','offIcon', 'selected');
      if (icon) {
        return icon;
      } else {
        return selected ? onIcon : offIcon;
      }
    }
  ),
  onMood: null,
  offMood: null,
  activeMood: computed.alias('onMood'),
  inactiveMood: computed.alias('offMood'),
  mood: computed('onMood','offMood','selected', {
    set: function(param,value) {
      value = `btn-${value}`;
      this.set('onMood', value);
      this.set('offMood', value);
      return value;
    },
    get: function() {
      const {onMood,offMood,selected} = this.getProperties('onMood','offMood', 'selected');
      if(selected) {
        return onMood ? `btn-${onMood}` : MOOD_DEFAULT;
      } else {
        return offMood ? `btn-${offMood}` : MOOD_DEFAULT;
      }
    }
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
	click() {
		this.sendAction('action', this); // send generic action event (for non-grouped buttons)
    this._tellGroup('pressed', this);
    if(!this.get('keepFocus')) {
      this.$().blur();
    }
    if(this.clickEffect) {
      this.applyEffect(this.clickEffect);
    }
	},
  applyEffect(effect) {
    if(!effect) {
      return false;
    }
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

  }
});
