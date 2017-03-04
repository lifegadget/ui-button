import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const { RSVP: {Promise, all, race, resolve, defer} } = Ember; // jshint ignore:line
const { inject: {service} } = Ember; // jshint ignore:line
const { computed, observer, $, run, on, typeOf, isPresent } = Ember;  // jshint ignore:line
const { defineProperty, get, set, inject, isEmpty, merge } = Ember; // jshint ignore:line
const a = Ember.A; // jshint ignore:line
import layout from '../templates/components/ui-toggle-button';

const conversions = {
  camelcase: thingy => thingy ? Ember.String.camelize(thingy) : thingy,
  pascalcase: thingy => thingy ? Ember.String.capitalize(Ember.String.camelize(thingy)) : thingy,
  dashcase: thingy => thingy ? Ember.String.dasherize(thingy) : thingy,
  snakecase: thingy => thingy ? Ember.String.underscore(thingy) : thingy,
  equal: thingy => thingy,
  lowercase: thingy => thingy.toLowerCase()
};

const simplifiedKey = key => key.replace(/[\-\_]/, '').toLowerCase();

export default Ember.Component.extend({
  layout,
  tagName: '',
  _initialized: false,

  init() {
    this._super(...arguments);
    const {value, defaultValue, onValue, offValue, onTitle, offTitle, valuesAre} = this.getProperties('value', 'defaultValue', 'onValue', 'offValue', 'onTitle', 'offTitle', 'valuesAre');
    if (valuesAre) {
      this.setValuesOnTitle(valuesAre, {on: onTitle, off: offTitle});
    }
    if (typeOf(defaultValue) !== 'undefined' && typeOf(value) === 'undefined') {
      run.schedule('afterRender', () => {
        this.setDefaultValue(defaultValue);
      });
    } 
    if (typeOf(value) !== 'undefined' && !a([onValue, offValue]).includes(value) && this.attrs.onError) {
      this.throwInvalidValue(value, 'at inialization');
    }
    this._initialized = true;
  },
  setDefaultValue(defaultValue) {
    let approved = false;
    if(this.attrs.onToggle && this.attrs.onToggle.update) {
      this.attrs.onToggle.update(defaultValue);
      approved = true;
    } else if(this.attrs.onToggle) {
      approved = this.attrs.onToggle({
        code: 'default-value',
        message: `setting default value to "${defaultValue}"`,
        name: this.get('name'),
        value: defaultValue,
        oldValue: undefined,
        title: this.getCurrentTitle()
      });
    }

    if (approved !== false) {
      this.set('toggled', defaultValue === this.get('onValue') ? true : false);
    }
  },
  setValuesOnTitle(conversion, titles) {
    conversion = simplifiedKey(conversion);
    this.set('onValue', conversions[conversion](titles.on));
    this.set('offValue', conversions[conversion](titles.off));
  },
  getCurrentTitle() {
    const {toggled, onTitle, offTitle} = this.getProperties('toggled', 'onTitle', 'offTitle');
    return toggled ? onTitle : offTitle;
  },
  toggled: computed('value', {
    set(_,value) {
      this.set('_oldValue', value);
      return value;
    },
    get() {
      return this.validateValue(this.get('value'), 'during runtime');
    }
  }),
  validateValue(value, info) {
    const {onValue, offValue, _disabledForInvalidValue} = this.getProperties('onValue', 'offValue', 'value', '_disabledForInvalidValue');
    const isValid = a([onValue, offValue]).includes(value);

    if(typeOf(value) === 'undefined' && !this._initialized) {
      return offValue;
    }

    if(isValid) {
      const newValue = value === onValue ? true : false;
      if(_disabledForInvalidValue) {
        this.set('disabled', false);
        this.set('_disabledForInvalidValue', false);
      }
      this.set('_oldValue', newValue);
      return newValue;
    } else {
      if(this.attrs.value) {
        // container is attached to value, so looks like an error
        this.set('disabled', true);
        this.set('_disabledForInvalidValue', true);
        if (this.attrs.onError) {
          this.throwInvalidValue(value, info);
        }
        return this.get('_oldValue');
      } else {
        // if container can't set value then toggled defaults to false
        return false;
      }
    }
  },
  throwInvalidValue(value, additional) {
    const possibilities = a([this.get('onValue'), this.get('offValue')]);
    this.attrs.onError({
      code: 'invalid-value',
      name: this.get('name'),
      message: `The value passed in -- ${value} -- is not a valid state for this toggle-button. Valid states are: ${JSON.stringify(possibilities)}. Button has been disabled.`,
      details: {
        info: additional
      }
    });
  },

  name: 'undefined',
  onValue: true,
  offValue: false,
  on: computed.alias('onTitle'),
  off: computed.alias('offTitle'),

  onTitle: computed('title', {
    set(_, value) {
      return value;
    },
    get() {
      return this.get('title') || 'on';
    }
  }),
  offTitle: computed('title', {
    set(_, value) {
      return value;
    },
    get() {
      return this.get('title') || 'off';
    }
  }),
  onMood: computed('mood', {
    set(_, value) {
      return value;
    },
    get() {
      return this.get('mood') || 'primary';
    }
  }),
  offMood: computed('mood', {
    set(_, value) {
      return value;
    },
    get() {
      return this.get('mood') || 'primary';
    }
  }),
  onIcon: computed('icon', {
    set(_, value) {
      return value;
    },
    get() {
      return this.get('icon');
    }
  }),
  offIcon: computed('icon', {
    set(_, value) {
      return value;
    },
    get() {
      return this.get('icon');
    }
  }),
  /**
   * Proxies this property to underlying button to create a "pressed"
   * look and feel
   */
  active: computed('activation', 'toggled', {
    set(_, value) {
      return value;
    },
    get() {
      const {activation, toggled} = this.getProperties('activation', 'toggled');
      return activation ? toggled : false;
    }
  }),
  /**
   * Allows container to state whether an "on" state should activate
   * the button (from a visual UI standpoint)
   * @type {Boolean}
   */
  activiation: false,

  actions: {
    onClick(hash) {
      const toggled = this.get('toggled');
      const {value, onValue, offValue} = this.getProperties('value', 'onValue', 'offValue');
      if(this.attrs.onToggle) {
        if(this.attrs.onToggle && this.attrs.onToggle.update) {
          this.attrs.onToggle.update(!toggled ? onValue : offValue);
        } else if(this.attrs.onToggle({
          code: 'toggle-value',
          message: `setting value from "${hash.value}" to "${!toggled ? onValue : offValue}"`,
          name: this.get('name'),
          on: !toggled,
          oldValue: hash.value,
          value: !toggled ? onValue : offValue,
          title: !toggled ? this.get('onTitle') : this.get('offTitle'),
          context: this
        }) !== false) {
          // container has approved
          if(typeOf(value) === 'undefined') {
            // value was never sent in so toggle the property based on containers acceptance
            this.toggleProperty('toggled');
          } else {
            // container is controlling the value
            if (a([onValue, offValue]).includes(value)) {
              this.set('toggled', value === onValue ? true : false);
            } else {
              console.warn('Button was set to an invalid value based on user click, this should never happen.');
            }
          }
        }
      } else {
        console.warn(`no one is listening to toggle button ${this.id}'s onToggle event`);
      }
    }
  }
});
