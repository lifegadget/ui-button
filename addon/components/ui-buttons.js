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
  selected: null, // used just for container binding purposes
  _selected: computed.oneWay('selected'),
  selectedItem: computed('selected', function() {
    const { selected, _registeredItems} = this.getProperties('selected', '_registeredItems');
    return new A(_registeredItems).findBy('elementId', selected);
  }),
  value: computed.oneWay('selectedItem.value'),
  _value: computed.oneWay('value'),
  emptyNestObserver: on('init',observer('selected','canBeEmpty', function() {
    const { selected, value, canBeEmpty, _registeredItems } = this.getProperties('selected', 'value', 'canBeEmpty', '_registeredItems' );
    if (!canBeEmpty && !selected && _registeredItems.length > 0) {
      _registeredItems[0]._tellItems('activate');
    }
  })),
  canBeEmpty: true,
  disabled: null,
  // Disable (false), Enable(true), by value (array/string), or ignore (null) Item's disablement state
  disabledObserver: on('didInsertElement',observer('disabled', function() {
    const disabled = this.get('disabled');
    const disabledItems = typeOf(disabled) === 'boolean' ? null : new A(typeOf(disabled) === 'array' ? disabled : String(disabled).split(','));
    if(disabled !== null) {
      this._tellItems('disable', disabled ? true : false, disabledItems);
    }
  })),
  howMany: computed.alias('_registeredItems.length'),
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
          obj[prop] = propValue
        }
      })
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
      self.set('selected', item.get('elementId'));
    },
    deactivate: function(self) {
      self.set('selected', null);
    },
    registration: function(self,item) {
      const _registeredItems = self.get('_registeredItems');
      _registeredItems.pushObject(item);
    }
  },
});
