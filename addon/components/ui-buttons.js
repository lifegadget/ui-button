import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line
import layout from '../templates/components/ui-buttons';
import GroupMessaging from 'ui-button/mixins/group-messaging';
const dasherize = Ember.String.dasherize;
const CARDINALITY_MIN = 'cardinality-min-threshold';
const CARDINALITY_MAX = 'cardinality-max-threshold';
const VALUES_CARDINALITY_ERROR = 'values-cardinality-error';
const SET_WITH_CARDINALITY = 'set-with-cardinality-0';

const uiButtons = Ember.Component.extend(GroupMessaging,{

  layout: layout,
  tagName: 'div',
  classNames: ['ui-button', 'btn-group'],
  classNameBindings: ['disabled:disabled:enabled','stretch'],

  // SELECTED BUTTONS
  // Contains a list of elementIds which are selected
  selectedMutex: true,
  selectedButtons: computed({
    set: function(_,value) {
      this.notifyPropertyChange('selectedMutex');
      return value;
    },
    get: function() {
      return new Set();
    }
  }),
  valueOptions: computed(function() {
    return new Set();
  }),
  nullValidOption() {
    const options = this.get('valueOptions');
    return options.has(null);
  },
  nullNotValidOption() { return !this.nullValidOption(); },
  // VALUES
  values: computed('selectedMutex',{
    set: function(_,values,oldValue) {
      this.setValues(values,oldValue);
      return values ? values : []; // This may be a bad idea but idea is to force to array at all times
    },
    get: function() {
      return this.getValues();
    }
  }),
  setValues(values,oldValue) {
    let {selectedButtons,_cardinality} = this.getProperties('selectedButtons', '_cardinality');
    if(typeOf(values) === 'string') {
      values = values.split(',');
    }
    values = values ? values : [];
    if(_cardinality.max === 'M' || _cardinality.max >= values.length ) {
      selectedButtons.clear();
      this._activateButton(values);
    } else {
      this.sendAction('error', VALUES_CARDINALITY_ERROR, `Couldn't set the "values" property because it did not meet the cardinality constraints [${_cardinality.min}:${_cardinality.max}]`);
      run.next(()=>{
        this._activateButton(oldValue);
      });
    }
  },
  getValues() {
    const selectedButtons = Array.from(this.get('selectedButtons'));

    return selectedButtons;
  },

  /**
   * VALUE
   * Returns a scalar value which represents the first element in the
   * values array; null if empty values
   */
  value: computed('selectedMutex',{
    set: function(_,value) {
      this.setValue(value);
      return value;
    },
    get: function() {
      return this.getValue();
    }
  }),
  setValue(value) {
      const {selectedButtons, _cardinality} = this.getProperties('selectedButtons','_cardinality');
      if(_cardinality.max !== 0) {
        selectedButtons.clear();
        this._activateButton(value);
      } else {
        this.sendAction('error', SET_WITH_CARDINALITY, `Trying to set value[${value}] with a cardinality of 0`);
      }
  },
  getValue() {
    const {selectedButtons, _cardinality} = this.getProperties('selectedButtons','_cardinality');
    if(_cardinality.max === 1) {
      return selectedButtons.size > 0 ? Array.from(selectedButtons)[0] : null;
    } else if (_cardinality.max === 0) {
      return null;
    } else {
      const csvValue = Array.from(selectedButtons).join(',');
      return csvValue ? csvValue : null;
    }
  },
  // CARDINALITY
  defaultCardinality: {min: 0, max: 0},
  cardinality: null,
  _cardinality: computed('cardinality', {
    set: function(_,value) {
      return value;
    },
    get: function() {
      return this._getCardinality();
    }
  }),
  _getCardinality() {
    const {cardinality, defaultCardinality} = this.getProperties('cardinality', 'defaultCardinality');
    let value;
    if(typeOf(cardinality) === 'string') {
      let [min,max] = cardinality.split(':');
      if (!max) {
        max = min;
      }
    min = Number(min);
    max = Number.isInteger(Number(max)) ? Number(max) : 'M';

    value = {min: min, max: max};
    } else if(typeOf(value) === 'object' && value.min && value.max) {
      value = cardinality;
    } else {
      value = defaultCardinality;
    }
    // reduce set buttons to no more than max
    if(value.max !== 'M') {
      const selectedButtons = this.get('selectedButtons');
      const differential = Number(selectedButtons.size - value.max);
      if(differential > 0) {
        const removal = Array.from(selectedButtons).slice(differential * -1);
        for(var item of removal) {
          selectedButtons.delete(item);
        }
        run.next(()=>{
          this.notifyPropertyChange('selectedMutex');
        });
      }
    }

    return value;
  },
  isSelectable: computed('_cardinality.max',function() {
    const max = this.get('_cardinality.max');
    return max === 'M' || max > 0;
  }),
 /**
  * The API exposes the 'disabled' property, when it changes disabledButtons responds to that
  * depending on the type of input received:
  *
  *    - If a BOOLEAN all of the registered controls are added/removed from the set.
  *    - If a STRING it will check first to see if the string starts with "ember..."
  *      if so then it will assume this is a direct reference to the elementId,
  *      otherwise it will assume its a value and any items which match this value will
  *      have their elementId looked up.
  *    - If an ARRAY it will just convert to a Set
  *    - If a SET is passed in then it will just proxy it across
  *
  * Regardless of disabled type, disabledButtons will be an ES6 Set which indicates
  * which elementId's should be disabled.
  */
  disabledMutex: null,
  disabled: computed({
    set(_,value,oldValue) {
      this.setDisabled(value,oldValue);
      return value;
    },
    get() {
      return this.getDisabled();
    }
  }),
  setDisabled(value) {
    const disabledButtons = this.get('disabledButtons');
    const process = (cmd, values) => {
      disabledButtons.clear();
      for(var i of values) {
        disabledButtons[cmd](i);
      }
      return cmd === 'add' ? true : false;
    };
    switch(typeOf(value)) {
      case 'boolean':
        const getRegisteredValues = () => {
          return this.get('_registeredItems').map(item => {
            return item.get('value');
          });
        };
        if(this.get('_registrationComplete')) {
          if(value) {
            process('add', getRegisteredValues());
          } else {
            process('delete', getRegisteredValues());
          }
        }
        run.next(()=>{
          if(value) {
            process('add', getRegisteredValues());
          } else {
            process('delete', getRegisteredValues());
          }
        });
        break;

      case 'string':
        value = value.split(',');
        process('add',value);
        break;

      case 'number':
        value = [value];
        process('add',value);
        break;

      case 'array':
        process('add',value);
        break;
    }
    this.sendAction('changed', 'disabled', Array.from(disabledButtons));
    this.notifyPropertyChange('disabledMutex');
  },
  getDisabled() {
    const disabledButtons = Array.from(this.get('disabledButtons'));
    this.sendAction('changed', 'disabled', disabledButtons);
    return disabledButtons;
  },
  disabledButtons: computed(function() {
    return new Set();
  }),

  icon: null,
  activeIcon: null,
  inactiveIcon: null,

  type: null,
  _type: computed('type', function() {
    const type = this.get('type');
    return type ? `ui-${type}-button` : `ui-button`;
  }),

  // INLINE Functionality
  // --------------------
  buttons: computed.alias('items'),
  items: null,
  _items: computed('items', {
    set(_,value) {
      debug('you should not directly set the _items CP');
      return value;
    },
    get() {
      return this._getItems();
    }
  }),
  _getItems() {
    let items = this.get('items');
    items = items ? items : [];
    items = typeOf(items) === 'string' ? items.split(',') : items;
    items = typeOf(items) === 'array' ? items : [items];

    return items.map( item => {
      const getTitleValue = (item) => {
        if(typeOf(item) === 'object') {
          return [null,null];
        }
        const elements = typeOf(item) === 'string' ? item.split('::') : [item];
        const extractLiteral = x => {
          if(String(x).substr(0,1) === ':') {
            switch(x.substr(1)) {
              case 'true':
                return true;
              case 'false':
                return false;
              case 'null':
                return null;
              default:
                if(!Number.isNaN(Number(x.substr(1)))) {
                  return Number(x.substr(1));
                }
                // check for array literal
                if(x.split('|').length > 1) {
                  return x.substr(1).split('|').map(item => {
                    return Number.isNaN(Number(item)) ? item : Number(item);
                  });
                }
                debug(`literal value "${x}" passed into inline ui-buttons was not understood`);
                return 'unknown';
            }
          }

          return x;
        };
        let [title,value] = elements;
        value = value ? extractLiteral(value) : dasherize(title);
        return {title: title, value: value};
      };
      const {title,value} = getTitleValue(item);
      return typeOf(item) === 'object' ? item : { value: value, title: title };
    });
  },
  _activateButton(value) {
    const {_cardinality,selectedButtons} = this.getProperties('_cardinality','selectedButtons');
    const type = typeOf(value);
    let status = {error:[], updated: false};
    if((type === 'array' && value.length === 0) || (this.nullNotValidOption() && new Set(['null','undefined']).has(type)) ) {
      status.updated = true;
      selectedButtons.clear();
    }
    else {
      if(typeOf(value) !== 'array') { value = [value]; }
      value.forEach(v => {
        if(_cardinality.max === 1 && selectedButtons.size === 1) {
          console.log('clearing: %s, %s', v, JSON.stringify(selectedButtons));
          selectedButtons.clear();
        }

        if(!selectedButtons.has(v)) {
          console.log('processing: %s, %s', v, JSON.stringify(selectedButtons));
          if(Number.isInteger(_cardinality.max) && selectedButtons.size >= _cardinality.max) {
            this.sendAction('error', CARDINALITY_MAX, `there must be no more than ${_cardinality.max} buttons`);
            status.error.push(CARDINALITY_MAX);
          } else {
            selectedButtons.add(v);
            console.log('added: %s, %s', v, JSON.stringify(selectedButtons));
            status.updated = true;
            if(this._rendered) {
              this.sendAction('action', 'selected', this, v);
              this.sendAction('changed', 'values', Array.from(selectedButtons));
            } else {
              this.sendAction('action', 'initiated', this, v);
            }
          }
        }
      });
    }

    if(status.updated) {
      this.notifyPropertyChange('selectedMutex');
      this._tellItems('button-selection-changed', selectedButtons);
    }
    console.log('finishin: %o, %s', value, JSON.stringify(selectedButtons));

    return true;
  },
  /**
   * deactivates a button who's value is passed in. There are two exceptions to behaviour:
   *
   *    1. if the value is 'null' and null is not a button value then deactivating 'null'
   *       will be seen as a request to erase ALL selected buttons.
   *    2. if an array of values is passed in then all items will be sequentially removed
   *       followed by a single signal to 'selectedMutex'
   *
   * @param  {mixed: scalar|array|null} value
   * @return {boolean}
   */
  _deactivateButton(value) {
    const {_cardinality,selectedButtons} = this.getProperties('_cardinality','selectedButtons');
    let status = {error: [], updated: false};
    console.log('deactiving: ', value);
    if(typeOf(value) === 'null' && this.nullNotValidOption()) {
      selectedButtons.clear();
      status.updated = true;
    }
    else {
      if(typeOf(value) !== 'array') { value = [value]; }
      value.forEach(v => {
        if(selectedButtons.has(v)) {
          if(selectedButtons.size <= _cardinality.min) {
            this.sendAction('error', CARDINALITY_MIN, `there must be at least ${_cardinality.min} button(s)`);
            this._tellItem(value, 'applyEffect', 'cardinalityEffect');
            status.error.push(CARDINALITY_MIN);
          }
          else {
            selectedButtons.delete(v);
            status.updated = true;
            if(this._rendered) {
              this.sendAction('action', 'deselected', this, v);
              this.sendAction('changed', 'values', Array.from(selectedButtons));
            }
            else {
              this.sendAction('action', 'initiated', this, v); // TODO: does this make sense?
            }
          }
        }
      });

    }
    if(status.updated) {
      this.notifyPropertyChange('selectedMutex');
    }
    return status.error ? false : true;
  },
  // if cardinality.min is non-zero ensure button is selected
  selectButtonIfNotSelected() {
    run.next(()=>{
      const {_cardinality,selectedButtons} = this.getProperties('_cardinality', 'selectedButtons');
      if(_cardinality && _cardinality.min === 1 && selectedButtons.size === 0) {
        this._activateButton(this.get('_registeredItems.0.value'));
      }
    });
  },

  /**
   * Ensures that:
   *   1. value, values, and selectedButtons are all initialised to the correct values
   *      when first rendering the component;
   *   2. defaultValue is applied where appropriate
   *   3. items object who are listed as "selected" are set at the item level too
   */
  initializeValueProperties() {
    const {value,values,nullValidOption} = this.getProperties('value', 'values','nullValidOption');
    const parameterKeys = new Set(keys(this.get('attrs') || {}));

    // Set bound Value & Values
    if(parameterKeys.has('value') || parameterKeys.has('values')) {
      if (parameterKeys.has('value') && parameterKeys.has('values')) {
        debug('you have bound both "value" and "values" to ui-buttons; this is could behave inconsistently, if you have cardinality greater than 1 then just bind to values.');
      }
      if(parameterKeys.has('value')) {
        this._activateButton(value);
      } else {
        values.forEach(v => this._activateButton(v));
      }
    }


    // Set default values
    const defaultValue = this.get('defaultValue');
    const type = typeOf(value);
    if(defaultValue && ( type ==='undefined' || (type === 'null' && !nullValidOption ))) {
      if(typeOf(defaultValue) === 'array') {
        this.set('values', defaultValue);
        run.next(() => {
          this._activateButton(defaultValue);
        });
      } else {
        this.set('value', defaultValue);
        run.next(() => {
          this._activateButton(defaultValue);
        });
      }
    }
  },

  buttonActions: {
    /**
     * When a button is clicked, it requests through this message to be toggled between active/inactive state (aka, button's "selected" prop).
     * @param  {object}   self reference to ui-buttons instance
     * @param  {object}   item reference to the requesting instance
     * @return {boolean}  passes back a boolean response to the requestor to indicate whether or not the request has been granted
     */
     pressed(self, item){
      const value = item.get('value');
      const {selectedButtons} = self.getProperties('selectedButtons');
      self.sendAction('action', 'pressed', item);
      if(selectedButtons.has(value)) {
        // asking for deactivation
        self._deactivateButton(value);
      } else {
        // asking for activation
        self._activateButton(value);
      }
      return true;
    },
    /**
     * Registration allows the container to add buttons to its registry but it
     * also is used to link button properties back to global/container properties
     * so that management can be handled at container level where appropriate
     * @param  {object} self I need to find a way to remove this but for now its needed for container ref
     * @param  {object} item A reference to the item registering itself
     * @return {void}
     */
    registration(self,item) {
      // properties which container will take over from buttons
      const containerProperties = ['selectedButtons','disabledButtons','isSelectable'];
      // properties which container will take over if NOT set by buttons
      const effects = [
        'clickEffect', 'onEffect', 'offEffect', 'toggleEffect',
        'enabledEffect', 'disabledEffect', 'activeEffect', 'inactiveEffect','cardinalityEffect'
      ];
      const uiFeatures = [
        'size', 'mood', 'activeMood', 'inactiveMood', 'icon', 'activeIcon', 'inactiveIcon'
      ];
      const containerBackup = [ ...effects, ...uiFeatures];
      // Helper functions
      const createComputed = prop => {
        return computed.alias(`group.${prop}`);
      };
      const isNotSet = (prop,value) => {
        const defaultValues = new Map([
          ['size','normal'],
          ['mood','default']
        ]);
        return isEmpty(value) || defaultValues.get(prop) === value;
      };

      // Register button
      const _registeredItems = self.get('_registeredItems');
      _registeredItems.pushObject(item);

      // Setup CP's
      for(var i of containerProperties) {
        const cp = createComputed(i);
        Ember.defineProperty(item, i, cp);
      }
      for(var i2 of containerBackup) {
        if(isNotSet(i2, item.get(i2)) ) {
          const cp2 = createComputed(i2);
          Ember.defineProperty(item, i2, cp2);
        }
      }

      // if groups value is already set, check against item's value
      const itemValue = item.get('value');
      const itemSelected = item.get('selected');
      self.get('valueOptions').add(itemValue);
      const groupValue = self.get('value');
      const groupValues = new Set(self.get('values'));
      if(groupValue === itemValue || groupValues.has(itemValue)) {
        if(!itemSelected) {
          self._activateButton(itemValue);
        }
      }

      run.debounce(self, self.registrationComplete, 1);
      self.sendAction('registered', item); // specific action only
    },
    btnEvent(self, evt, ...args) {
      console.log('button event: %s: %o', evt,args);
    },
  },

  // EVENTS
  // -------------------------
  _i: on('init', function() { return this._init(); }),
  _ia: on('didInitAttrs', function() { return this.didInitAttrs(); }),
  _r: on('willRender', function() { return this.willRender(); }),
  _d: on('willDestroyElement', function() { return this.willDestroyElement(); }),
  _dr: on('afterRender', function() { return this.didRender(); }),
  _rendered: false,

  _init() {
    // nothing yet
  },
  willRender() {
    // this.notifyPropertyChange('selectedMutex');
  },
  registrationComplete() {
    this.set('_registrationComplete', true);
    this.selectButtonIfNotSelected();
  },
  didInitAttrs() {
    this.initializeValueProperties();
  },
  willDestroyElement() {
    // nothing yet
  },
  didRender() {
    this._tellItems('rendered');
    this._rendered = true;
  }

});

export default uiButtons;
uiButtons[Ember.NAME_KEY] = 'UI Buttons';

