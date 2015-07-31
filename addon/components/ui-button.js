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
import SharedStyle from 'ui-button/mixins/shared-style';
import ItemMessaging from 'ui-button/mixins/item-messaging';

const MOOD_DEFAULT = 'default';

const uiButton = Ember.Component.extend(SharedStyle,ItemMessaging,{
  layout: layout,
	tagName: 'button',
  group: null,
  initialized: false,
  _initialized: on('willRender', function() {
    this.set('initialized', true);
  }),
	attributeBindings: ['disabled:disabled', 'type'],
	classNameBindings: ['_mood','_prefixedSize','delayedHover:delayed-hover'],
	classNames: ['btn','ui-button'],

  disabledButtons: computed({
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
  disabled: computed('disabledButtons', {
    set: function(_, value) {
      this.setDisabled(value);
      return value;
    },
    get: function() {
      return this.getDisabled();
    }
  }),
  setDisabled(value) {
    const {elementId, disabledButtons} = this.getProperties('elementId','disabledButtons');
    const doItNow = value => {
      if(value && !disabledButtons.has(elementId)) {
        disabledButtons.add(elementId);
      } else if(!value && disabledButtons.has(elementId)) {
        disabledButtons.delete(elementId);
      }
      this.notifyPropertyChange('disabledButtons');
    }; // end doItNow

    // defer setting if elementId isn't ready
    if(elementId) {
      doItNow(value);
    } else {
      run.next(() => {
        doItNow(value);
      });
    }
  },
  getDisabled() {
    let {disabledButtons,elementId} = this.getProperties('disabledButtons','elementId');
    return disabledButtons ? disabledButtons.has(elementId) : false;
  },

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
  on: computed.alias('onTitle'),
  off: computed.alias('offTitle'),
  title: computed('title','toggled',{
    set: function(param,value) {
      this.set('onTitle', value);
      this.set('offTitle', value);
      return value;
    },
    get: function() {
      const {onTitle,offTitle,toggled} = this.getProperties('onTitle', 'offTitle', 'toggled');
      if(toggled) {
        return onTitle ? onTitle : '';
      } else {
        return offTitle ? offTitle : '';
      }
    }
  }),

  // VALUE
  value: computed('toggled',{
    set(_,value) {
      this.setValue(value);
      return value;
    },
    get() {
      return this.getValue();
    }
  }),
  setValue(value) {
    if(this.isToggleable) {
      const toggled = this.get('toggled');
      const property = toggled ? 'onValue' : 'offValue';
      const otherProperty = toggled ? 'offValue' : 'onValue';
      if(value === this.get(otherProperty)) {
        console.log('toggling button based on value set');
        this.toggleProperty('toggled');
      } else {
        this.set(property, value);
      }
    } else {
      this.set('onValue', value); // TODO: remove this and check everything works
      this.set('offValue', value);
    }
  },
  getValue() {
    const {onValue,offValue,toggled} = this.getProperties('onValue', 'offValue', 'toggled');
    return toggled ? onValue : offValue;
  },

  icon: null,
  _icon: computed('icon','onIcon','offIcon','toggled',function() {
      const {icon,onIcon,offIcon,toggled} = this.getProperties('icon','onIcon','offIcon', 'toggled');
      if (icon) {
        return icon;
      } else {
        return toggled ? onIcon : offIcon;
      }
    }
  ),

  mood: null,
  _mood: computed('mood','onMood','offMood','toggled', {
    set: function(_,value) {
      return value;
    },
    get: function() {
      return this.getMood();
    }
  }),
  getMood() {
    const {mood,toggled} = this.getProperties('mood', 'toggled');
    const property = toggled ? 'onMood' : 'offMood';
    let officialMood;
    if(mood) {
      officialMood = mood;
    } else {
      officialMood = this.get(property) ? this.get(property) : MOOD_DEFAULT;
    }

    return `btn-${officialMood}`;
  },
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
  isToggleable: false,
  // Contains a list of elementIds which are selected (if not grouped then the only ID would be itself)
  selectedValues: computed('group.selected', {
    set: function(param,value) {
      return typeOf(value) === 'array' ? new Set(value) : new Set([value]);
    },
    get: function() {
      return new Set();
    }
  }),
  // SELECTED
  selected: computed('elementId','selectedValues',{
    set:function(_,value) {
      debug('calling the setter of selected is considered bad practice');
      this._tellGroup('select', this, value);
      return value;
    },
    get:function() {
      return this.isSelected();
    }
  }),
  isSelected() {
    const {selectedValues,elementId} = this.getProperties('selectedValues', 'elementId');

    return selectedValues ? selectedValues.has(elementId) : false;
  },
  toggled: false,


  toggleSelection() {
    const {selectedValues,elementId,isToggleable} = this.getProperties('selectedValues','elementId','isToggleable');
    if(isToggleable) {
      selectedValues.has(elementId) ? selectedValues.delete(elementId) : selectedValues.add(elementId); // jshint ignore:line
      this.notifyPropertyChange('selected');
    }
  },
  setSelection(flag) {
    const {selectedValues, elementId} = this.getProperties('selectedValues', 'elementId');
    if(typeOf(flag) !== 'boolean') {
      debug('setSelection called with non-boolean value, this is not expected behaviour');
    }
    if(elementId === null) {
      run.next( () => {
        const registeredElementId = this.get('elementId');
        this._setSelection(flag, selectedValues, registeredElementId);
      });
    } else {
      this._setSelection(flag, selectedValues, elementId);
    }
  },
  _setSelection(flag,selectedValues,elementId) {
    if(flag) {
      selectedValues.add(elementId);
    } else {
      selectedValues.delete(elementId);
    }
  },
  // CLICK
	click() {
    this.sendAction('action', 'pressed', this); // send generic action event (for non-grouped buttons)
    if(this.isToggleable) {
      this.toggleProperty('toggled');
      this.sendAction('action', 'toggled', this);
    }
    if(this.group) {
      this._tellGroup('pressed', this); // group will toggle selection if it deems fit
    } else {
      this.toggleSelection(); // if not in group then must take own responsibility for toggling
    }

    if(!this.get('keepFocus')) {
      this.$().blur();
    }
    const {isToggleable,selected, onValue,offValue} = this.getProperties('isToggleable', 'selected','onValue', 'offValue');
    this.applyEffect('clickEffect');
    if(isToggleable) {
      if(selected) {
        this.applyEffect('onEffect');
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
      run.next(() => {
        this.$().addClass('animated ' + effect);
        this.$().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
          this.$().removeClass('animated ' + effect);
        });
      });
    } catch (e) {
      // debug(`could not effect ${effect} animation: ${e}`);
    }
  },

  // EVENTS
  // -------------------------
  _i: on('init', function() { return this._init(); }),
  _r: on('willRender', function() { return this.willRender(); }),
  _d: on('willDestroyElement', function() { return this.willDestroyElement(); }),

  _init() {
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
            delay: {show: delay, hide: 200},
            html: html,
            trigger: trigger,
            placement: placement,
            template: template
          });
        } catch (e) {
          debug('There was a problem setting up the tooltip on [' + this.get('elementId') + '], ensure Bootstrap\'s JS is included in the vendor JS.\n%o',e);
        }
      });
    }
  },
  willRender() {
    // do something
  },
  willDestroyElement() {
    if(this.get('tooltip')){
      this.$().tooltip('destroy');
    }
  }
});

export default uiButton;
uiButton[Ember.NAME_KEY] = 'UI Button';

