import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line
import layout from '../templates/components/ui-buttons';
const dasherize = Ember.String.dasherize;

export default Ember.Component.extend({
  layout: layout,
  tagName: 'div',
  classNames: ['ui-button', 'btn-group'],
  classNameBindings: ['disabled:disabled:enabled'],
  _registeredItems: new A([]),
  selected: null,
  selectedItem: computed('selected', function() {
    const { selected, _registeredItems} = this.getProperties('selected', '_registeredItems');
    return new A(_registeredItems).findBy('elementId', selected);
  }),
  value: computed.alias('selected'),
  emptyNestObserver: on('afterRender',observer('selected','canBeEmpty', function() {
    const { selected, canBeEmpty, _registeredItems } = this.getProperties('selected', 'canBeEmpty', '_registeredItems' );
    if (!canBeEmpty && !selected && _registeredItems.length > 0) {
      _registeredItems[0]._tellItem('activate');
    }
  })),
  canBeEmpty: true,
  _registerItem: function(child) {
    console.log('registering %o with %o', child, this.get('elementId'), this.get('_registeredItems.length'));
    this.get('_registeredItems').pushObject(child);
  },
  disabled: false,
  disabledObserver: observer('disabled', function() {
    const { _registeredItems, disabled } = this.getProperties('_registeredItems','disabled');
    _registeredItems.forEach( item => {
      item._tellItem('disabled', disabled);
    })
  }),
  howMany: computed.alias('_registeredItems.length'),
  type: null,
  _type: computed('type', function() {
    const type = this.get('type');
    return type ? `ui-${type}-button` : `ui-button`;
  }),

  // INLINE Functionality
  // --------------------
  items: null,
  buttons: computed.alias('items'),
  _items: computed('items', function() {
    let items = this.get('items');
    items = items ? items : [];
    items = typeOf(items) === 'string' ? items.split(',') : new A(items);
    return new A(items.map( item => {
      return typeOf(item) === 'object' ? item : { value: dasherize(item), title: item };
    }));
  })
});
