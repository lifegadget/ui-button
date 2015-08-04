import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug } = Ember;    // jshint ignore:line
import layout from '../templates/components/ui-buttons';
import GroupMessaging from 'ui-button/mixins/group-messaging';
const dasherize = Ember.String.dasherize;
const capitalize = Ember.String.capitalize;
const propertyIsSet = thingy => {
  return typeOf(thingy) !== 'null' && typeOf(thingy) !== 'undefined';
};
const isUndefined = thingy => {
  return Ember.typeOf(thingy) === 'undefined';
};
const globalItemProps = ['mood','activeMood','inactiveMood','size','icon','iconActive','iconInactive'];
const xtend = function (core, options, override=false){
  for (var index in options) {
    if(override || !core[index]) {
      core[index] = options[index];
    }
  }

  return core;
};
const CARDINALITY_MIN = 'cardinality-min-threashold';
const CARDINALITY_MAX = 'cardinality-max-threashold';
const VALUES_CARDINALITY_ERROR = 'values-cardinality-error';

const uiButtons = Ember.Component.extend(GroupMessaging,{

  layout: layout,
  tagName: 'div',
  classNames: ['ui-button', 'btn-group'],
  classNameBindings: ['disabled:disabled:enabled'],

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
    console.log('values is now: %o. Cardinality: %s:%s', values, _cardinality.min, _cardinality.max);
    if(_cardinality.max === 'M' || _cardinality.max >= values.length ) {
      selectedButtons.clear();
      for(var i of values) {
        this._activateButton(i);
      }
      console.log('selectedButtons added (value setter): %o', selectedButtons);
    } else {
      console.log('selectedButtons ERROR (value setter): %o, %o', values, selectedButtons);
      this.sendAction('error', VALUES_CARDINALITY_ERROR, `Couldn't set the "values" property because it did not meet the cardinality constraints [${_cardinality.min}:${_cardinality.max}]`);
      run.next(()=>{
        for(var i of oldValue) {
          this._activateButton(i);
        }
      });
    }
  },
  getValues() {
    const selectedButtons = this.get('selectedButtons');
    console.log('GET values: %o', Array.from(selectedButtons));

    return Array.from(selectedButtons);
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
  getValue() {
    const {selectedButtons, _cardinality} = this.getProperties('selectedButtons','_cardinality');
    console.log('getting value [%s]: %o. (%o)', this.get('elementId'), Array.from(selectedButtons), _cardinality);
    if(_cardinality.max === 1) {
      return selectedButtons.size > 0 ? Array.from(selectedButtons)[0] : null;
    } else if (_cardinality.max === 0) {
      return null;
    } else {
      const csvValue = Array.from(selectedButtons).join(',');
      console.log('GET value: %o', csvValue);
      return csvValue ? csvValue : null;
    }
  },
  setValue(value) {
      const {selectedButtons, _cardinality} = this.getProperties('selectedButtons','_cardinality');
      if(_cardinality.max !== 0) {
        console.log('setting value to: %o', value);
        if(value) {
          this._activateButton(value, true);
        } else {
          selectedButtons.clear();
          this.notifyPropertyChange('selectedMutex');
        }
      } else {
        console.log('Trying to set value[%o] with a cardinality of 0', value);
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
          console.log('deactivating: %s', item);
          selectedButtons.delete(item);
        }
        console.log('after deactivation: %o, %o', selectedButtons, this.get('selectedButtons'));
        run.next(()=>{
          this.notifyPropertyChange('selectedMutex');
        });
      }
    }

    return value;
  },
  makeSelectable: computed('_cardinality.max',function() {
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
  disabled: false,
  disabledButtons: computed('disabled',{
    set(_,value) {
      this.set('_disabledButtons', value);
      return value;
    },
    get() {
      return this.getDisabledButtons();
    }
  }),
  getDisabledButtons() {
    const disabled = this.get('disabled');
    const disabledButtons = this.get('_disabledButtons') || new Set();
    const _registeredItems = this.get('_registeredItems');
    if (typeOf(disabled) === 'object' && disabled.size) {
      return disabled;
    }
    disabledButtons.clear();
    // get elementIds from registered buttons
    const ids = new Set(_registeredItems.map(item => {
      return item.get('elementId');
    }));
    const processArray = (disabledArray) => {
      for (let disabledItem of disabledArray) {
        console.log('processing %s', disabledItem);
        if(disabledItem.substr(0,5) === 'ember') {
          if(ids.has(disabledItem)) {
            disabledButtons.delete(disabledItem);
          } else {
            disabledButtons.add(disabledItem);
          }
        } else {
          const idsWithValue = _registeredItems.filterBy('value',disabledItem).map(item => {
            return item.get('elementId');
          });
          for(let i of idsWithValue) {
              disabledButtons.add(i);
          }
        }
      }
    };
    if(typeOf(disabled) === 'string') {
      const disabledArray = disabled.split(',');
      processArray(disabledArray);
    }
    if(typeOf(disabled) === 'array') {
      processArray(disabled);
    }
    if(typeOf(disabled) === 'boolean' ) {
      if(disabled) {
        console.log('disabling all');
        for(let i of ids) {
          disabledButtons.add(i);
        }
      } else {
        console.log('enabling all');
        disabledButtons.clear();
      }
    }
    console.log('returning: %o', disabledButtons);

    return disabledButtons;
  },

  icon: null,
  iconActive: null,
  iconInactive: null,

  type: null,
  _type: computed('type', function() {
    const type = this.get('type');
    return type ? `ui-${type}-button` : `ui-button`;
  }),

  // INLINE Functionality
  // --------------------
  buttons: computed.alias('items'),
  items: null,
  _items: computed('items', function() {
    let items = this.get('items');
    const getPropertyValues = props => {
      let obj = {};
      new A(props).forEach( prop => {
        const propValue = this.get(prop);
        if (propValue) {
          obj[prop] = propValue;
        }
      });
      return obj;
    };
    items = items ? items : [];
    items = typeOf(items) === 'string' ? items.split(',') : new A(items);

    return new A(items.map( item => {
      const baseline = typeOf(item) === 'object' ? item : { value: dasherize(item), title: item, mood: 'default' };
      return xtend(baseline,getPropertyValues(globalItemProps));
    }));
  }),
  _activateButton(value, forcedClear=false) {
    const {_cardinality,selectedButtons} = this.getProperties('_cardinality','selectedButtons');
    if(forcedClear) {
      selectedButtons.clear();
    }
    if(_cardinality.max === 1 && selectedButtons.size === 1) {
      selectedButtons.clear();
      selectedButtons.add(value);
    } else if(Number.isInteger(_cardinality.max) && selectedButtons.size >= _cardinality.max) {
      this.sendAction('error', CARDINALITY_MAX, 'there must be no more than ${_cardinality.max} buttons');
      return false;
    } else {
      selectedButtons.add(value);
    }
    this.sendAction('action', 'selected', value);
    this.notifyPropertyChange('selectedMutex');
    return true;
  },
  _deactivateButton(value) {
    const {_cardinality,selectedButtons} = this.getProperties('_cardinality','selectedButtons');
    console.log('%s asking for deactivation', value);
    if(selectedButtons.size <= _cardinality.min) {
      this.sendAction('onError', CARDINALITY_MIN, `there must be at least ${_cardinality.min} buttons`);
      return false;
    }
    selectedButtons.delete(value);
    this.sendAction('action', 'unselected', value);
    this.notifyPropertyChange('selectedMutex');
    return true;
  },
  // if cardinality.min is non-zero ensure button is selected
  selectButtonIfNotSelected() {
    run.next(()=>{
      const {_cardinality,selectedButtons} = this.getProperties('_cardinality', 'selectedButtons');
      if(_cardinality.min === 1 && selectedButtons.size === 0) {
        this._activateButton(this.get('_registeredItems.0.value'));
      }
    });
  },

  setDefaultPropertyValues() {
    const properties = ['value'];
    for(var prop of properties) {
      const propValue = this.get(prop);
      const defaultValue = this.get('default' + capitalize(prop));
      if(propertyIsSet(defaultValue) && isUndefined(propValue)) {
        console.log('defaultValue for group prop [%s] is: %s', this.get('elementId'),defaultValue);
        this.set(prop, defaultValue);
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
      const selectedButtons = self.get('selectedButtons');
      const value = item.get('value');
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
    registration(self,item) {
      const _registeredItems = self.get('_registeredItems');
      const selectedButtons = computed.alias('group.selectedButtons');
      const disabledButtons = computed.alias('group.disabledButtons');
      const makeSelectable = computed.alias('group.makeSelectable');
      const size = computed.alias('group.size');
      _registeredItems.pushObject(item);
      // link globally managed properties back to item ("data down")
      Ember.defineProperty(item,'selectedButtons',selectedButtons);
      Ember.defineProperty(item,'disabledButtons',disabledButtons);
      Ember.defineProperty(item,'isSelectable',makeSelectable);
      Ember.defineProperty(item,'size',size);
      // if groups value is already set, check against item's value
      const groupValue = self.get('value');
      const itemValue = item.get('value');
      if(groupValue && groupValue === itemValue) {
        console.log('activating: %o, %o', groupValue, self.get('_cardinality'));
        self._activateButton(groupValue);
        run.next(()=> {
          /**
           * there seems to be a small break in Ember where setting a property
           * before it is fully initialized doesn't propagate observer events
           */
          self.notifyPropertyChange('selectedMutex');
        });
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

  _init() {
    // nothing yet
  },
  willRender() {
    // nothing yet
  },
  registrationComplete() {
    this.set('_registrationComplete', true);
    this.selectButtonIfNotSelected();
  },
  didInitAttrs() {
    this.setDefaultPropertyValues();
  },
  willDestroyElement() {
    // nothing yet
  }

});

export default uiButtons;
uiButtons[Ember.NAME_KEY] = 'UI Buttons';

