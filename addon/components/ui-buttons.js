import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject, merge } = Ember;    // jshint ignore:line
import layout from '../templates/components/ui-buttons';
import GroupMessaging from 'ui-button/mixins/group-messaging';
const dasherize = Ember.String.dasherize;
const globalItemProps = ['mood','moodActive','moodInactive','size','icon','iconActive','iconInactive'];
const xtend = (core, options, override=false) => {
  for (var index in options) {
    if(override || !core[index]) {
      core[index] = options[index];
    }
  }

  return core;
};
const DEFAULT_CARDINALITY = { min: 0, max: 0 };
const CARDINALITY_MIN = 'cardinality-min-threashold';
const CARDINALITY_MAX = 'cardinality-max-threashold';

export default Ember.Component.extend(GroupMessaging,{
  layout: layout,
  tagName: 'div',
  classNames: ['ui-button', 'btn-group'],
  classNameBindings: ['disabled:disabled:enabled'],

  /**
   * A set of buttons/items which are selected
   */
  selected: computed({
    set: function(prop,value) {
      return typeOf(value) === 'array' ? new Set(value) : new Set([value]);
    },
    get: function() {
      return new Set();
    }
  }),

  values: computed('selected',{
    set: function(prop,value) {
      if(typeOf(value) === 'string') {
        value = value.split(',');
      }
      console.log('buttons values set: %o', value);

      return new A(value);
    },
    get: function() {
      const {selected,_registeredItems} = this.getProperties('selected','_registeredItems');
      return _registeredItems.filter(item => {
        return selected.has(item.get('elementId'));
      }).map(item => {
        return item.get('value');
      });
    }
  }),

  value: computed('selected','cardinality.max',{
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
  cardinality: computed({
    set: function(prop,value) {
      if(typeOf(value) === 'string') {
        const [min,max] = value.split(':');
        return {min: min, max: max};
      }

      return value;
    },
    get: function() {
      return DEFAULT_CARDINALITY;
    }
  }),
  disabled: computed({
     set: function(param,value) {
       if(typeOf(value) === 'string') {
         value = value.split(',');
       }
       console.log('buttons disabled set: %o', value);
       return value;
     },
     get: function() {
       return false;
     }
   }),

  // defaultValue: null,
  // // set default after 'init' but before 'render'
  // _setDefaultValue: on('didInsertElement', function() {
  //   const defaultValue = this.get('defaultValue');
  //   const defaultButton = this.get('_registeredItems').findBy('value', defaultValue);

  //   this.set('selected', defaultButton ? defaultButton.get('elementId') : null);
  // }),
  // emptyNestObserver: on('init',observer('selected','canBeEmpty', function() {
  //   const { selected, canBeEmpty, _registeredItems } = this.getProperties('selected', 'value', 'canBeEmpty', '_registeredItems' );
  //   if (!canBeEmpty && !selected && _registeredItems.length > 0) {
  //     this._tellItem(_registeredItems[0].get('elementId'), 'activate');
  //   }
  // })),
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
    btnPressed: function(self, item){
      const id = item.get('elementId');
      const {cardinality,selected} = self.getProperties('cardinality','selected');
      if(selected.has(id)) {
        // asking for deactivation
        if(selected.size <= cardinality.min) {
          self.sendAction('onError', CARDINALITY_MIN, `there must be at least ${cardinality.min} buttons`);
          return false;
        }
        selected.delete(id);
        self.sendAction('onChanged', 'unselected', item);
    } else {
        // asking for activation
        if(Number.isInteger(cardinality.max) && selected.size >= cardinality.max) {
          self.sendAction('onError', CARDINALITY_MAX, 'there must be no more than ${cardinality.max} buttons');
          return false;
        }
        selected.add(id);
        self.sendAction('onChanged', 'selected', item);
      }
      return true;
    },
    registration: function(self,item) {
      const _registeredItems = self.get('_registeredItems');
      const selectedValues = computed.alias('group.selected');
      const disabled = computed.alias('group.disabled');
      const size = computed.alias('group.size');
      const cardinality = computed.alias('group.cardinality');
      _registeredItems.pushObject(item);
      // link globally managed properties back to item ("data down")
      Ember.defineProperty(item,'selectedValues',selectedValues);
      Ember.defineProperty(item,'disabledValues',disabled);
      Ember.defineProperty(item,'size',size);
      Ember.defineProperty(item,'cardinality',cardinality);
      // there WAS a problem where 'elementId' wasn't available at init but it should be now
      // so set the 'value' of the item to the elementId if it is still null
      if(item.get('value') === null) {
        item.set('value', item.get('elementId'));
      }

      self.sendAction('registered', item); // specific action only
    },
    btnEvent: function(self, evt, ...args) {
      console.log('button event: %s: %o', evt,args);
    }
  },

});
