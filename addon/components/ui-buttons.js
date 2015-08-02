import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug } = Ember;    // jshint ignore:line
import layout from '../templates/components/ui-buttons';
import GroupMessaging from 'ui-button/mixins/group-messaging';
const dasherize = Ember.String.dasherize;
const globalItemProps = ['mood','moodActive','moodInactive','size','icon','iconActive','iconInactive'];
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

export default Ember.Component.extend(GroupMessaging,{
  init() {
    this._super();
    this.disabled = new Set();
    this.selected = new Set();
  },
  preRender() {

  },
  layout: layout,
  tagName: 'div',
  classNames: ['ui-button', 'btn-group'],
  classNameBindings: ['disabled:disabled:enabled'],

  // SELECTED VALUES
  selectedValues: computed('selected', {
    set: function(prop,value) {
      debug('"selectedValues" should not be SET, set/bind to "select" property instead!');
      this.set('selected', value);
      return value;
    },
    get: function() {
      return this.getSelectedValues();
    }
  }),
  getSelectedValues() {
    const selected = this.get('selected');
    console.log('selectedValues for %s: %o', this.get('elementId'), selected);
    if(typeOf(selected) === 'object' && selected.size) {
      return selected;
    }
    if(typeOf(selected) === 'string') {
      return new Set(selected);
    }

    return new Set();
  },

  // VALUES
  values: computed('selectedValues',{
    set: function(prop,value) {
      if(typeOf(value) === 'string') {
        value = value.split(',');
      }
      console.log('buttons values set: %o', value);

      return new A(value);
    },
    get: function() {
      const {selectedValues,_registeredItems} = this.getProperties('selectedValues','_registeredItems');
      return _registeredItems.filter(item => {
        return selectedValues.has(item.get('elementId'));
      }).map(item => {
        return item.get('value');
      });
    }
  }),

  /**
   * Returns a scalar value which represents the first element in the values array; null if empty values
   */
  value: computed('selectedValues',{
    set: function(param,value) {
      console.log('buttons value set: %o', value);
      this.set('values', [value]);
      return value;
    },
    get: function() {
      const {values, cardinality} = this.getProperties('values','cardinality');
      if(cardinality.max === 1) {
        return values.length > 0 ? values[0] : null;
      } else if (cardinality.max === 0) {
        return null;
      } else {
        // Cardinality greater than 1
        return values.join(',');
      }
    }
  }),
  // CARDINALITY
  defaultCardinality: {min: 0, max: 0},
  cardinality: computed('_cardinality', {
    set: function(_,value) {
      this.setCardinality(value);
      return value;
    },
    get: function() {
      return this.getCardinality();
    }
  }),
  setCardinality(value) {
    if(typeOf(value) === 'string') {
      let [min,max] = value.split(':');
      if (!max) {
        max = min;
      }
      value = {min: Number(min), max: Number(max)};
    } else if(typeOf(value) !== 'object' || !value.min || !value.max) {
      debug('Trying to set cardinality with improper structure so using default cardinality instead. Attempted: %o', value);
      value = this.get('defaultCardinality');
    }

    this.set('_cardinality', value);
  },
  getCardinality() {
    const {_cardinality, defaultCardinality} = this.getProperties('_cardinality', 'defaultCardinality');
    if(typeOf(_cardinality) === 'undefined') {
      this.set('_cardinality', defaultCardinality);
      return defaultCardinality;
    } else {
      return _cardinality;
    }
  },
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
  disabled: new Set(),
  disabledButtons: computed('disabled', {
    set(_,value) {
      debug('disabledButtons should not be SET, set disabled property instead!');
      this.set('disabled', value);
      return value;
    },
    get() {
      return this._disabledButtons();
    }
  }),
  _disabledButtons() {
    let disabled = this.get('disabled');
    if (disabled.size) {
      return disabled;
    }
    // get elementIds from registered buttons
    const ids = this.get('_registeredItems').map(item => {
      return item.get('elementId');
    });
    if(typeOf(disabled) === 'string') {
      if(disabled.substr(0,5) === 'ember') {
        const id = this.get('_registeredItems').filterBy('elementId', disabled);
        return new Set().add(id);
      } else {
        const idsWithValue = ids.filterBy('value',disabled);
        return idsWithValue ? new Set(idsWithValue) : new Set();
      }
    }
    if(typeOf(disabled) === 'boolean' ) {
      return disabled ? new Set(ids) : new Set();
    }
    return typeOf(disabled) === 'array' ? new Set(disabled) : new Set();
  },
  defaultValues: null, // a representative set of values to look for in registered items
  _setDefaultValues: on('willRender', function() {
    const defaultValue = this.get('defaultValue');
    const defaultButtons = this.get('_registeredItems').filterBy('value', defaultValue).map(item=>{
      return item.get('elementId');
    });

    this.set('selected', defaultButtons);
  }),
  emptyNestObserver: on('init',observer('selected','canBeEmpty', function() {
    const { selected, canBeEmpty, _registeredItems } = this.getProperties('selected', 'value', 'canBeEmpty', '_registeredItems' );
    if (!canBeEmpty && !selected && _registeredItems.length > 0) {
      this._tellItem(_registeredItems[0].get('elementId'), 'activate');
    }
  })),
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

  buttonActions: {
    /**
     * When a button is clicked, it requests through this message to be toggled between active/inactive state (aka, button's "selected" prop).
     * @param  {object}   self reference to ui-buttons instance
     * @param  {object}   item reference to the requesting instance
     * @return {boolean}  passes back a boolean response to the requestor to indicate whether or not the request has been granted
     */
     pressed(self, item){
      console.log('buttons pressed: %o', item);
      const id = item.get('elementId');
      const {cardinality,selectedValues} = self.getProperties('cardinality','selectedValues');
      if(selectedValues.has(id)) {
        // asking for deactivation
        if(selectedValues.size <= cardinality.min) {
          self.sendAction('onError', CARDINALITY_MIN, `there must be at least ${cardinality.min} buttons`);
          return false;
        }
        selectedValues.delete(id);
        self.sendAction('onChanged', 'unselected', item);
      } else {
        // asking for activation
        if(Number.isInteger(cardinality.max) && selectedValues.size >= cardinality.max) {
          self.sendAction('onError', CARDINALITY_MAX, 'there must be no more than ${cardinality.max} buttons');
          return false;
        }
        selectedValues.add(id);
        self.sendAction('onChanged', 'selected', item);
        item.notifyPropertyChange('selectedValues');
      }
      return true;
    },
    /**
     * A request to select or deselect a button item
     * @param  {object}   self
     * @param  {object}   item
     * @param  {boolean}  state   whether to enable(true) or disable(false)
     * @return {null}
     */
    select(self, item, state) { //jshint ignore:line
      // TODO: implement
    },
    registration: function(self,item) {
      const _registeredItems = self.get('_registeredItems');
      const selectedValues = computed.alias('group.selectedValues');
      const disabledButtons = computed.alias('group.disabledButtons');
      const size = computed.alias('group.size');
      // const cardinality = computed.alias('group.cardinality');
      _registeredItems.pushObject(item);
      // link globally managed properties back to item ("data down")
      Ember.defineProperty(item,'selectedValues',selectedValues);
      Ember.defineProperty(item,'disabledButtons',disabledButtons);
      Ember.defineProperty(item,'size',size);
      // Ember.defineProperty(item,'cardinality',cardinality);
      // there WAS a problem where 'elementId' wasn't available at init but it should be now
      // so set the 'value' of the item to the elementId if it is still null
      if(item.get('value') === null) {
        item.set('value', item.get('elementId'));
      }

      self.sendAction('registered', item); // specific action only
    },
    btnEvent: function(self, evt, ...args) {
      console.log('button event: %s: %o', evt,args);
    },
    _willRender: on('willRender', function() {
      this.preRender();
    })
  },

});
