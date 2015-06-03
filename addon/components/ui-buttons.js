import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line
import layout from '../templates/components/ui-buttons';
import GroupMessaging from 'ui-button/mixins/group-messaging';
const dasherize = Ember.String.dasherize;

export default Ember.Component.extend(GroupMessaging,{
  layout: layout,
  tagName: 'div',
  classNames: ['ui-button', 'btn-group'],
  classNameBindings: ['disabled:disabled:enabled'],
  selected: null,
  selectedItem: computed('selected', function() {
    const { selected, _registeredItems} = this.getProperties('selected', '_registeredItems');
    return new A(_registeredItems).findBy('elementId', selected);
  }),
  value: null,
  emptyNestObserver: on('init',observer('selected','canBeEmpty', function() {
    const { selected, value, canBeEmpty, _registeredItems } = this.getProperties('selected', 'value', 'canBeEmpty', '_registeredItems' );
    if (!canBeEmpty && !selected && _registeredItems.length > 0) {
      _registeredItems[0]._tellItems('activate');
    }
  })),
  canBeEmpty: true,
  disabled: false,
  // Sends messages to some or all items to disable themselves
  disabledObserver: observer('disabled', function() {
    const { _registeredItems, disabled } = this.getProperties('_registeredItems','disabled');
    if(disabled === true) {
      _registeredItems.forEach( item => {
        item._tellItems('disabled', disabled);
      });
    }
  }),
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
    items = items ? items : [];
    items = typeOf(items) === 'string' ? items.split(',') : new A(items);
    return new A(items.map( item => {
      return typeOf(item) === 'object' ? item : { value: dasherize(item), title: item };
    }));
  }),

  buttonActions: {
    buttonPressed: function(self, item){
      self.set('selected', item.get('elementId'));
    }
  }
});
