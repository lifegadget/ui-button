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

export default Ember.Component.extend(GroupMessaging,{
  layout: layout,
  tagName: 'div',
  classNames: ['ui-button', 'btn-group'],
  classNameBindings: ['disabled:disabled:enabled'],
  selected: null, // TODO: make this into a proper one-way binding
  selectedItem: computed('selected', function() {
    const { selected, _registeredItems} = this.getProperties('selected', '_registeredItems');
    return new A(_registeredItems).findBy('elementId', selected);
  }),
  selectedValue: computed('selected', function() {
    const { selected, _registeredItems} = this.getProperties('selected', '_registeredItems');
    const valueObject = new A(_registeredItems).findBy('elementId', selected);
    return valueObject ? valueObject.get('value') : null;
  }),
  value: computed('selected', {
    set: function(prop,value) {
      const items = this.get('_registeredItems');
      let newSelected = items.findBy('value', value);

      if(typeOf(newSelected) === 'instance') {
        console.log('setting value to: %s', newSelected.value);
        this.set('selected', newSelected.get('elementId'));
      } else {
        console.log('could not find value [%s] in registered items', value);
      }
      return this.get('selectedItem.value');
    },
    get: function() {
      return this.get('selectedItem.value');
    }
  }),
  defaultValue: null,
  // set default after 'init' but before 'render'
  _setDefaultValue: on('didInsertElement', function() {
    const defaultValue = this.get('defaultValue');
    const defaultButton = this.get('_registeredItems').findBy('value', defaultValue);

    this.set('selected', defaultButton ? defaultButton.get('elementId') : null);
  }),
  emptyNestObserver: on('init',observer('selected','canBeEmpty', function() {
    const { selected, canBeEmpty, _registeredItems } = this.getProperties('selected', 'value', 'canBeEmpty', '_registeredItems' );
    if (!canBeEmpty && !selected && _registeredItems.length > 0) {
      this._tellItem(_registeredItems[0].get('elementId'), 'activate');
    }
  })),
  canBeEmpty: true,
  icon: null,
  iconActive: null,
  iconInactive: null,
  disabled: null,
  // Disable (false), Enable(true), by value (array/string), or ignore (null) Item's disablement state
  disabledObserver: on('didInsertElement',observer('disabled', function() {
    const disabled = this.get('disabled');
    const disabledItems = typeOf(disabled) === 'boolean' ? null : new A(typeOf(disabled) === 'array' ? disabled : String(disabled).split(','));
    if(disabled !== null) {
      console.log('disabling: %o, %o, %o', disabled, disabledItems, this.get('_registeredItems'));
      this._tellItems('disable', disabled ? true : false, disabledItems);
    }
  })),
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
        const baseline = typeOf(item) === 'object' ? item : { value: dasherize(item), title: item };
        return xtend(baseline,getPropertyValues(globalItemProps));
    }));
  }),

  buttonActions: {
    activate: function(self, item){
      self.sendAction('changed', item ? item.value : null, self.get('selectedValue'), item); // new value, old value, object
      self.set('selected', item.get('elementId'));
      self.sendAction('activated', item); // specific action
      return true;
    },
    deactivate: function(self, item) {
      // reject single-item states which can not be empty
      if(!self.get('canBeEmpty') && typeOf(self.selected) !== 'array') {
        return false;
      }
      self.sendAction('changed', null, self.get('selectedValue'), item); // general action gets the value
      self.set('selected', null);
      self.sendAction('deactivated', item); // specific action gets the "deactivated item"
      return true;
    },
    registration: function(self,item) {
      const _registeredItems = self.get('_registeredItems');
      _registeredItems.pushObject(item);
      self.set('howMany', _registeredItems.length);
      self.sendAction('registered', item); // specific action only
    },
    btnEvent: function(self, evt, ...args) {
      console.log('button event: %s: %o', evt,args);
    }
  },

});
