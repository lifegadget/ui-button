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

const uiButtons = Ember.Component.extend(GroupMessaging,{
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

  // SELECTED BUTTONS
  // Contains a list of elementIds which are selected
  selectedButtons: computed({
    set: function(param,value) {
      debug('selectedButtons should never be set!');
      return value;
    },
    get: function() {
      return new Set();
    }
  }),
  // VALUES
  values: computed('selectedButtons',{
    set: function(prop,value) {
      if(typeOf(value) === 'string') {
        value = value.split(',');
      }
      console.log('buttons values set: %o', value);

      return new A(value);
    },
    get: function() {
      const {selectedButtons,_registeredItems} = this.getProperties('selectedButtons','_registeredItems');
      return _registeredItems.filter(item => {
        return selectedButtons.has(item.get('elementId'));
      }).map(item => {
        return item.get('value');
      });
    }
  }),

  /**
   * VALUE
   * Returns a scalar value which represents the first element in the
   * values array; null if empty values
   */
  value: computed('selectedButtons',{
    set: function(_,value) {
      this.setValue(value);
      return value;
    },
    get: function() {
      return this.getValue();
    }
  }),
  getValue() {
    const {selectedButtons, cardinality} = this.getProperties('selectedButtons','cardinality');
    if(cardinality.max === 1) {
      return selectedButtons.size > 0 ? selectedButtons[0].value : null;
    } else if (cardinality.max === 0) {
      return null;
    } else {
      return Array.from(selectedButtons).map(item => {
        return item.get('value');
      }).join(',');
    }
  },
  setValue(value) {
    if(value) {
      console.log('buttons value set: %o', value);
      // this.get('selectedButtons').add(value);
      // this._tellItems('notify', 'selectedButtons');
      // this.notifyPropertyChange('selectedButtons');
    }
  },
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
    if(!value) {
      value = this.get('defaultCardinality') ? this.get('defaultCardinality') : {min:0,max:0};
    }
    if(typeOf(value) === 'string') {
      let [min,max] = value.split(':');
      if (!max) {
        max = min;
      }
      value = {min: Number(min), max: Number(max)};
    } else if(typeOf(value) === 'object' && value.min && value.max) {
      // nothing to do
    } else {
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
  makeSelectable: computed.gt('_cardinality.max',0),
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
      const {_cardinality,selectedButtons} = self.getProperties('_cardinality','selectedButtons');
      if(selectedButtons.has(id)) {
        // asking for deactivation
        console.log('%s asking for deactivation', id);
        if(selectedButtons.size <= _cardinality.min) {
          self.sendAction('onError', CARDINALITY_MIN, `there must be at least ${_cardinality.min} buttons`);
          console.log('rejected', id);
          return false;
        }
        selectedButtons.delete(id);
        self.sendAction('action', 'unselected', item);
      } else {
        // asking for activation
        console.log('%s asking for activation', id);
        // if cardinality is 'x:1' then requests for activation will be granted even if 1 item is
        // selected; in this scenario the correct behavior is to toggle the value
        if(_cardinality.max === 1 && selectedButtons.size === 1) {
          selectedButtons.clear();
          selectedButtons.add(id);
        } else if(Number.isInteger(_cardinality.max) && selectedButtons.size >= _cardinality.max) {
          self.sendAction('error', CARDINALITY_MAX, 'there must be no more than ${_cardinality.max} buttons');
          return false;
        } else {
          selectedButtons.add(id);
        }
        self.sendAction('action', 'selected', item);
      }
      console.log('selectedButtons is now: %o', selectedButtons);
      self._tellItems('notify', 'selectedButtons');
      // self.notifyPropertyChange('selectedButtons');
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
      const selectedButtons = computed.alias('group.selectedButtons');
      const disabledButtons = computed.alias('group.disabledButtons');
      const makeSelectable = computed.alias('group.makeSelectable');
      const size = computed.alias('group.size');
      // const cardinality = computed.alias('group.cardinality');
      _registeredItems.pushObject(item);
      // link globally managed properties back to item ("data down")
      Ember.defineProperty(item,'selectedButtons',selectedButtons);
      Ember.defineProperty(item,'disabledButtons',disabledButtons);
      Ember.defineProperty(item,'isSelectable',makeSelectable);
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

export default uiButtons;
uiButtons[Ember.NAME_KEY] = 'UI Buttons';

