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
const nullOrUndefined = thingy => {
  return typeOf(thingy) === 'null' || typeOf(thingy) === 'undefined' ? true : false;
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
	tagName: 'button',
  group: null,
	attributeBindings: ['disabled:disabled', 'type'],
	classNameBindings: ['mood','_prefixedSize','delayedHover:delayed-hover'],
	classNames: ['btn','ui-button'],

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
  disabled: computed('disabledValues','disabledValues.size','value', {
    set: function(prop, setterValue, previousValue) {
      let {value,disabledValues} = this.getProperties('onValue','disabledValues');
      if(setterValue) {
        if(typeOf(previousValue) !== 'undefined') {
          this.applyEffect(this.get('disableEffect'));
        }
        disabledValues = disabledValues.filter( item => {
          return item === value; // remove from list
        });
      } else {
        if(typeOf(previousValue) !== 'undefined') {
          this.applyEffect(this.enabled);
        }
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
  on: computed.alias('onTitle'),
  off: computed.alias('offTitle'),
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
      const {onValue,offValue,selected,isSelectable} = this.getProperties('onValue', 'offValue', 'selected','isSelectable');
      if(typeOf(value) === 'undefined' || typeOf(value) === 'null') {
        return selected ? onValue : offValue;
      }
      value = objectifyJson(value); // if its a JSON string convert to object
      // If the button has two value states and setter value is one of them then just switch to the right state
      const valueStates = new Set([onValue,offValue]);
      if(onValue !== offValue && isSelectable && valueStates.has(value)) {
        console.log('switching state [%s]', this.get('elementId'));
        console.log('selected set to %s; which has a value of %s', this.get('selected'), this.get('selected') ? onValue : offValue);
      } else if (isSelectable) {
        // it's selectable so only set the current state's value
        this.set(selected ? 'onValue' : 'offValue', value);
      } else if (isSelectable) {
        this.set(selected ? 'onValue' : 'offValue', value);
      } else {
        // if setter value doesn't meet above criteria then set both on and off states to this new value
        this.set('onValue', value);
        this.set('offValue', value);
      }

     return value;
    },
    get:function() {
      const {onValue,offValue,selected,onTitle,offTitle} = this.getProperties('onValue', 'offValue', 'selected', 'onTitle', 'offTitle');
      console.log('getting value [%s]: %s, %s', selected, onValue, offValue);
      if(selected) {
        return nullOrUndefined(onValue) ? camelize(onTitle) : onValue;
      } else {
        return nullOrUndefined(offValue) ? camelize(offTitle) : offValue;
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
  // SELECTION
  // allows for control to move into the selected state, by default buttons are just pressed not selected
  isSelectable: false,
  // Contains a list of elementIds which are selected (if not grouped then the only ID would be itself)
  selectedValues: on('init',computed('group.selected', {
    set: function(param,value) {
      return typeOf(value) === 'array' ? new Set(value) : new Set([value]);
    },
    get: function() {
      return new Set();
    }
  })),
  selected: computed('selectedValues.size','selectedValues',{
    set:function(param,setterValue) {
      // you shouldn't directly SET this property so the setterValue is ignored
      // and this action is just seen as an explicit 're-get' of the property
      debug(`selected was called as a setter[${fromSetter}], the state of this property should instead be influenced by setting the value property`);
      return this.isSelected();
    },
    get:function() {
      return this.isSelected();
    }
  }),
  isSelected() {
    const {selectedValues,elementId} = this.getProperties('selectedValues', 'elementId');
    console.log('isSelected queried for %s: %o', elementId, selectedValues);
    return selectedValues.has(elementId);
  },
  toggleSelection() {
    const {selectedValues,elementId,isSelectable} = this.getProperties('selectedValues','elementId','isSelectable');
    if(isSelectable) {
      selectedValues.has(elementId) ? selectedValues.delete(elementId) : selectedValues.add(elementId); // jshint ignore:line
      this.notifyPropertyChange('selected');
    }
  },
  // CLICK
	click() {
		this.sendAction('action', this); // send generic action event (for non-grouped buttons)
    if(this.group) {
      this._tellGroup('pressed', this); // group will toggle selection if it deems fit
    } else {
      this.toggleSelection(); // if not in group then must take own responsibility for toggling
    }

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
  })
});
