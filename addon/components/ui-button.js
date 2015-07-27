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
  initialized: false,
  _initialized: on('didInsertElement', function() {
    this.set('initialized', true);
  }),
	attributeBindings: ['disabled:disabled', 'type'],
	classNameBindings: ['mood','_prefixedSize','delayedHover:delayed-hover'],
	classNames: ['btn','ui-button'],

  disabledValues: computed('group.disabled',{
    set: function(param,value) {
      if(typeOf(value) === 'string') {
        value = value.split(',');
      }
      return new Set(value);
    },
    get: function() {
      return new Set([]);
    }
  }),
  disabled: computed('disabledValues','disabledValues.size','value', {
    set: function(prop, setterValue, previousValue) {
      let {value,disabledValues} = this.getProperties('onValue','disabledValues');
      if(setterValue) {
        if(previousValue === false) {
          this.applyEffect('disabledEffect');
        }
        disabledValues.delete(setterValue);
      } else {
        if(previousValue === true) {
          this.applyEffect('enabledEffect');
        }
        disabledValues.add(value);
      }

      return setterValue;
    },
    get: function(param, previousValue) {
      const {value,disabledValues} = this.getProperties('value','disabledValues');
      return typeOf(disabledValues) === 'boolean' ? disabledValues : contains(disabledValues,value);
    }
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
  value: computed('onValue','offValue','selected','offTitle','onTitle','disabled',{
    set:function(prop,value) {
      const {onValue,offValue,selected,isSelectable,selectedValues} = this.getProperties('onValue', 'offValue', 'selected', 'isSelectable', 'selectedValues');
      const onOffValues = new Set([onValue,offValue]);
      value = objectifyJson(value); // if its a JSON string convert to object

      if (onOffValues.has(value) && isSelectable) {
        const currentValue = selected ? onValue : offValue;
        if(true) {
          console.log('toggling value [%s] because within onoff values: %s, %s. Selected values: %o', this.get('elementId'), onValue, offValue, selectedValues);
          this.setSelection(value === onValue);
        }
      } else {
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
  selected: computed('selectedValues.size','selectedValues','value',{
    set:function(param,setterValue) {
      // you shouldn't directly SET this property so the setterValue is ignored
      // and this action is just seen as an explicit 're-get' of the property
      debug(`selected was called as a setter[${setterValue}], the state of this property should instead be influenced by setting the value property`);
      return this.isSelected();
    },
    get:function() {
      return this.isSelected();
    }
  }),
  isSelected() {
    const {selectedValues,elementId} = this.getProperties('selectedValues', 'elementId');
    return selectedValues.has(elementId);
  },
  toggleSelection() {
    const {selectedValues,elementId,isSelectable} = this.getProperties('selectedValues','elementId','isSelectable');
    if(isSelectable) {
      selectedValues.has(elementId) ? selectedValues.delete(elementId) : selectedValues.add(elementId); // jshint ignore:line
      this.notifyPropertyChange('selected');
    }
  },
  setSelection(flag) {
    const {selectedValues, elementId} = this.getProperties('selectedValues', 'elementId');
    if(typeOf(flag) !== 'boolean') {
      debug('setSelection called with non-boolean value, this is not expected behaviour');
    }
    console.log('setting %s selectedValues to %o', elementId, flag);
    if(elementId === null) {
      run.next( () => {
        const registeredElementId = this.get('elementId');
        this._setSelection(flag, selectedValues, registeredElementId);
        this.notifyPropertyChange('selected');
      });
    } else {
      this._setSelection(flag, selectedValues, elementId);
      this.notifyPropertyChange('selected');
    }
  },
  _setSelection(flag,selectedValues,elementId) {
    console.log('Setting %s to %s', elementId,flag);
    if(flag) {
      selectedValues.add(elementId);
    } else {
      selectedValues.delete(elementId);
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
    const {isSelectable,selected} = this.getProperties('isSelectable', 'selected');
    this.applyEffect('clickEffect');
    if(isSelectable) {
      if(selected) {
        this.applyEffect('onEffect')
      } else {
        this.applyEffect('offEffect');
      }
    }
  },
  // EFFECTS
  clickEffect: null,
  enabledEffect: null,
  disabledEffect: null,
  onEffect: null,
  offEffect: null,
  applyEffect(effectType) {
    const effect = this.get(effectType);
    const initialized = this.get('initialized');
    if(!effect || !initialized) {
      return false;
    }
    try {
      console.log('applying %s effect = %s [%s,%s,%o]', effectType, effect, initialized, this.get('elementId'), this.$());
      run.next(() => {
        this.$().addClass('animated ' + effect);
        this.$().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
          this.$().removeClass('animated ' + effect);
        });
      })
    } catch (e) {
      // debug(`could not effect ${effect} animation: ${e}`);
    }
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
