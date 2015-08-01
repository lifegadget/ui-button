import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, get, set, inject } = Ember;    // jshint ignore:line
import layout from '../templates/components/ui-button';
import SharedStyle from 'ui-button/mixins/shared-style';
import ItemMessaging from 'ui-button/mixins/item-messaging';
const MOOD_DEFAULT = 'default';
const isSetter = value => {
  const truthy = typeOf(value) !== 'null' && typeOf(value) !== 'undefined';
  console.log('is "%s" setter? %s', value, truthy);
  return truthy;
};

const uiButton = Ember.Component.extend(SharedStyle,ItemMessaging,{
  layout: layout,
	tagName: 'button',
  group: null,

	attributeBindings: ['disabled:disabled', 'type'],
	classNameBindings: ['selected:active','_mood','_size','delayedHover:delayed-hover'],
	classNames: ['btn','ui-button'],

  disabledButtons: computed({
    set: function(_,value) {
      return value;
    },
    get: function() {
      return new Set();
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
    console.log('setting disabled: %o', value);
    const {elementId, disabledButtons} = this.getProperties('elementId','disabledButtons');
    const doItNow = value => {
      const id = this.get('elementId');
      if(value) {
        disabledButtons.add(id);
        this.set('disabledButtons', disabledButtons);
        this.applyEffect('disabledEffect');
      } else {
        disabledButtons.delete(id);
        this.set('disabledButtons', disabledButtons);
        this.applyEffect('enabledEffect');
      }
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
    set: function(_,value) {
      this.setTitle(value);
      return value;
    },
    get: function() {
      return this.getTitle();
    }
  }),
  setTitle(value) {
    this.set('onTitle', value);
    this.set('offTitle', value);
  },
  getTitle() {
    const {onTitle,offTitle,toggled} = this.getProperties('onTitle', 'offTitle', 'toggled');
    if(toggled) {
      return onTitle ? onTitle : '';
    } else {
      return offTitle ? offTitle : '';
    }
  },
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
    const {toggled, isToggleable} = this.getProperties('toggled','isToggleable');
    const toggleValue = this.get(toggled ? 'onValue' : 'offValue');
    const otherToggleValue = this.get(toggled ? 'offValue' : 'onValue');
    if(isToggleable && value === otherToggleValue && otherToggleValue !== toggleValue) {
      this.toggle();
    }
  },
  getValue() {
    const {onValue,offValue,toggled} = this.getProperties('onValue', 'offValue', 'toggled');
    console.log('value getter called');

    return toggled ? onValue : offValue; // NOTE: if not toggleable; toggled prop will always be false
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
	_size: Ember.computed('mood','size', function() {
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
      this.toggle();
      this.sendAction('action', 'toggled', this);
    }
    if(this.group) {
      this._tellGroup('pressed', this); // group will toggle selection if it deems fit
    }

    if(!this.get('keepFocus')) {
      this.$().blur();
    }
    this.applyEffect('clickEffect');
  },
  toggle() {
    const toggleValue = this.get('toggled');
    const effect = toggleValue ? 'onEffect' : 'offEffect';
    this.set('toggled', !toggleValue);
    this.applyEffect(effect);
  },
  // EFFECTS
  clickEffect: null,
  enabledEffect: null,
  disabledEffect: null,
  onEffect: null,
  offEffect: null,
  applyEffect(effectType) {
    console.log('applying effect: %o => %o', effectType, this.get(effectType));
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

  setDefaultValues() {
    const properties = ['value','']
  },
  setupTooltip() {
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

  // EVENTS
  // -------------------------
  _i: on('init', function() { return this._init(); }),
  _ia: on('didInitAttrs', function() { return this.didInitAttrs(); }),
  _r: on('willRender', function() { return this.willRender(); }),
  _d: on('willDestroyElement', function() { return this.willDestroyElement(); }),

  _init() {
    this._tellGroup('registration', this);
    this.setupTooltip();
  },
  willRender() {
    // nothing yet
  },
  didInitAttrs() {
    this.set('initialized', true);
    this.setDefaultValues();
  },
  willDestroyElement() {
    if(this.get('tooltip')){
      this.$().tooltip('destroy');
    }
  }
});

export default uiButton;
uiButton[Ember.NAME_KEY] = 'UI Button';

