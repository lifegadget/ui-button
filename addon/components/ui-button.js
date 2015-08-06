import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, get, set, inject } = Ember;    // jshint ignore:line
const capitalize = Ember.String.capitalize;
const dasherize = thingy => {
  return thingy ? Ember.String.dasherize(thingy) : thingy;
};

const isInitialized = value => {
  return typeOf(value) !== 'null' && typeOf(value) !== 'undefined';
};
import layout from '../templates/components/ui-button';
import SharedStyle from 'ui-button/mixins/shared-style';
import ItemMessaging from 'ui-button/mixins/item-messaging';
const MOOD_DEFAULT = 'default';

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
  disabled: computed('group.disabledMutex','disabledMutex', {
    set: function(_, value) {
      this.setDisabled(value);
      return value;
    },
    get: function() {
      return this.getDisabled();
    }
  }),
  setDisabled(value) {
    const {disabledButtons,elementId} = this.getProperties('disabledButtons','elementId');
    const id = this.get('value');
    const doItNow = value => {
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
    let {disabledButtons,value} = this.getProperties('disabledButtons','value');
    return disabledButtons ? disabledButtons.has(value) : false;
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
    const toggleProp = toggled ? 'onValue' : 'offValue';
    const toggleValue = this.get(toggleProp);
    const otherToggleValue = this.get(toggled ? 'offValue' : 'onValue');
    if(isToggleable && value === otherToggleValue && otherToggleValue !== toggleValue) {
      this.toggle();
    } else {
      if(isToggleable) {
        this.set(toggleProp, value);
      } else {
        this.set('_value', value);
      }
    }
  },
  getValue() {
    const {_value,onValue,offValue,toggled, title} = this.getProperties('_value', 'onValue', 'offValue', 'toggled', 'title');
    if(_value) {
      return _value;
    }
    if(!isInitialized(onValue) && !isInitialized(offValue)) {
      return title ? dasherize(title) : this.get('elementId');
    }
    return toggled ? onValue : offValue; // NOTE: if not toggleable; toggled prop will always be false
  },
  // ICON
  icon: null,
  _icon: computed('icon','onIcon','offIcon','toggled','selected','activeIcon','inactiveIcon',{
    set(_,value) {
      debug('You should not directly set the "_icon" property.');
      return value;
    },
    get() {
      return this.getIcon();
    }
  }),
  getIcon() {
    const {icon,toggled,isToggleable,selected} = this.getProperties('icon','toggled','isToggleable','selected');
    const toggleProperty = toggled ? 'onIcon' : 'offIcon';
    const selectProperty = selected ? 'activeIcon' : 'inactiveIcon';

    if (icon) {
      return icon;
    } else {
      if(selected || !isToggleable) {
        return this.get(selectProperty) ? this.get(selectProperty) : null;
      } else {
        return this.get(toggleProperty) ? this.get(toggleProperty) : null;
      }
    }
  },
  // MOOD
  mood: null,
  _mood: computed('mood','onMood','offMood','toggled','selected','activeMood','inactiveMood', {
    set: function(_,value) {
      return value;
    },
    get: function() {
      return this.getMood();
    }
  }),
  getMood() {
    const {mood,toggled,isToggleable,selected} = this.getProperties('mood', 'toggled','isToggleable', 'selected');
    const toggleProperty = toggled ? 'onMood' : 'offMood';
    const selectProperty = selected ? 'activeMood' : 'inactiveMood';
    let officialMood;
    if(mood) {
      officialMood = mood;
    } else {
      if(selected || !isToggleable) {
        officialMood = this.get(selectProperty) ? this.get(selectProperty) : MOOD_DEFAULT;
      } else {
        officialMood = this.get(toggleProperty) ? this.get(toggleProperty) : MOOD_DEFAULT;
      }
    }

    return `btn-${officialMood}`;
  },
  delayedHover: true,
  size: 'normal',
  width: null,
  keepFocus: false, // keep focus on button after clicking?
	_size: Ember.computed('size', function() {
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
  selectedButtons: computed({
    set: function(param,value) {
      return value;
    },
    get: function() {
      return new Set();
    }
  }),
  // SELECTED
  isSelectable: false,
  selected: computed('selectedButtons','isSelectable','group.selectedMutex','value',{
    set:function(_,value) {
      this.setSelected(value);
      return value;
    },
    get:function() {
      return this.getSelected();
    }
  }),
  setSelected(selected) {
    const {selectedButtons,value, isSelectable} = this.getProperties('selectedButtons','value','isSelectable');
    debug('calling the setter of selected is considered bad practice, try to use "selectedButtons" instead');
    if(selected && isSelectable) {
      selectedButtons.add(value === null ? null : value);
    } else {
      selectedButtons.delete(value === null ? null : value);
    }
    // this.set('selectedButtons', selectedButtons);
    this.notifyPropertyChange('group.selectedMutex');
  },
  getSelected() {
    const {isSelectable, selectedButtons, value} = this.getProperties('isSelectable', 'selectedButtons', 'value');
    if(!isSelectable) {
      return false;
    }

    const isSelected = selectedButtons ? selectedButtons.has(value) : false;
    if(isSelected !== this.get('_selected')) {
      if(isSelected) {
        this.applyEffect('activeEffect');
      } else {
        this.applyEffect('inactiveEffect');
      }
    }
    this.set('_selected', isSelected);
    return isSelected;
  },
  toggled: false,

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
  activeEffect: null,
  inactiveEffect: null,
  onEffect: null,
  offEffect: null,
  applyEffect(effectType) {
    const effect = this.get(effectType);
    const _rendered = this.get('_rendered');
    if(!effect || !_rendered) {
      return false;
    }
    try {
      run.next(() => {
        this.$().addClass('animated ' + effect);
        this.$().one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
          this.$().removeClass('animated ' + effect);
          this.sendAction('action', 'effectEnded', this, 'effectType');
        });
      });
    } catch (e) {
      // do nothing
    }
  },
  setDefaultValues() {
    const properties = ['value'];
    for(let property of properties) {
      const defaultProp = 'default' + capitalize(property);
      const defaultValue = this.get(defaultProp);
      if(typeOf(defaultValue) !== 'undefined' && typeOf(this.get(property)) === 'undefined' ) {
        this.set(property, defaultValue);
      }
    }
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
  // MESSAGING
  buttonActions: {
    notify(self, property) {
      self.notifyPropertyChange(property);
    },
    applyEffect(self, effect) {
      self.applyEffect(effect);
    },
    rendered(self) {
      self._rendered = true;
    }
  },
  // RUN LOOP
  // -------------------------
  _i: on('init', function() { return this._init(); }),
  _ia: on('didInitAttrs', function() { return this.didInitAttrs(); }),
  _r: on('willRender', function() { return this.willRender(); }),
  _dr: on('afterRender', function() { return this.didRender(); }),
  _d: on('willDestroyElement', function() { return this.willDestroyElement(); }),
  _initialized: false,
  _rendered: false,
  _init() {
    this._tellGroup('registration', this);
    this.setupTooltip();
  },
  willRender() {
    // nothing yet
  },
  didInitAttrs() {
    this.setDefaultValues();
    this._initialized = true;
  },
  didRender() {
    if(!this.group) {
      this._rendered = true;
    }
  },
  willDestroyElement() {
    if(this.get('tooltip')){
      this.$().tooltip('destroy');
    }
  }
});

export default uiButton;
uiButton[Ember.NAME_KEY] = 'UI Button';

