import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const { RSVP: {Promise, all, race, resolve, defer} } = Ember; // jshint ignore:line
const { inject: {service} } = Ember; // jshint ignore:line
const { computed, observer, $, run, on, typeOf, isPresent } = Ember;  // jshint ignore:line
const { defineProperty, get, set, inject, isEmpty, merge } = Ember; // jshint ignore:line
const a = Ember.A; // jshint ignore:line
const MAX_CARDINALITY = 9999;
const parseCardinality = representation => {
  let [min, max] = representation.split(':');
  if (max === 'M') {
    max = MAX_CARDINALITY;
  }
  return {min: Number(min), max: Number(max)};
};
const dasherize = thingy => {
  return thingy ? Ember.String.dasherize(thingy) : thingy;
};
const parse = {
  literalNameValue: (name, value) => {
    if(!isNaN(value)) {
      value = Number(value);
    } else if (value === 'false') {
      value = false;
    } else if (value === 'true') {
      value = true;
    } else if (value === 'null') {
      value = null;
    }
    return {title: name, value: value};
  },
  nameValue: (name, value) => {
    return {title: name, value: value};
  },
  dasherizedNameValue: (name) => {
    let value = dasherize(name);
    return {title: name, value: value};
  }
};

const parseButtons = buttonsString => {
  if(typeOf(buttonsString) !== 'string') {
    console.warn(`Buttons parameter passed into ui-buttons component was invalid:`, buttonsString);
    return [];
  }
  const buttons = buttonsString.split(',');
  return buttons.map(b => {
    if(b.indexOf(':::') !== -1) {
      return parse.literalNameValue(b.split(':::'));
    } else if (b.indexOf('::') !== -1) {
      return parse.nameValue(b.split('::'));
    } else {
      return parse.dasherizedNameValue(b);
    }
  });
};

import layout from '../templates/components/ui-buttons';


export default Ember.Component.extend({
  layout,
  tagName: '',
  buttons: null,
  _buttons: computed('buttons', function() {
    const {buttons} = this.getProperties('buttons');
    return typeOf(buttons) === 'array' ? buttons : parseButtons(buttons);
  }),
  cardinality: '0:1',
  _cardinality: computed('cardinality', function() {
    const {cardinality} = this.getProperties('cardinality');
    return typeOf(cardinality) === 'object' ? cardinality : parseCardinality(cardinality);
  }),
  values: [],
  disabled: false,
  name: 'undefined',
  mood: 'secondary',
  size: 'default',

  addValue(value) {
    const {values, name} = this.getProperties('values', 'name');
    const newValues = values.slice(0); // clone
    newValues.push(value);
    if (this.attrs.onChange) {
      let response = this.attrs.onChange({
        code: 'add-value',
        values: newValues,
        oldValues: values,
        newValue: value,
        context: this,
        name: name,
        value: newValues.join(', ')
      });
      if(!this.attrs.values && response !== false ) {
        // if container isn't bound to values then take their
        // approval as right to go ahead with the change
        this.set('values', newValues);
        // Note: if they are bound to values then container is responsible for updating
      }
    } else {
      this.notBoundOnChange();
    }
  },
  /**
   * Replace the values array with a new single element array
   */
  setValue(value) {
    const {values, name} = this.getProperties('values', 'name');
    const newValues = [value];
    if (this.attrs.onChange) {
      let response = this.attrs.onChange({
        code: 'set-value',
        values: newValues,
        oldValues: values,
        context: this,
        name: name,
        value: newValues.join(', ')
      });
      if(!this.attrs.values && response !== false ) {
        // if container isn't bound to values then take their
        // approval as right to go ahead with the change
        this.set('values', newValues);
        // Note: if they are bound to values then container is responsible for updating
      }
    } else {
      this.notBoundOnChange();
    }
  },
  removeValue(value) {
    const {values, name} = this.getProperties('values', 'name');
    const newValues = values.slice(0).filter(v => v !== value);

    if (this.attrs.onChange) {
      let response = this.attrs.onChange({
        code: 'remove-value',
        values: newValues,
        oldValues: values,
        removedValue: value,
        context: this,
        name: name,
        value: newValues.join(', ')
      });
      if(!this.attrs.values && response !== false ) {
        // if container isn't bound to values then take their
        // approval as right to go ahead with the change
        this.set('values', newValues);
        // Note: if they are bound to values then container is responsible for updating
      }
    } else {
      this.notBoundOnChange();
    }
  },
  rejectValue(action, value, code) {
    const messageLookup = {
      'max-cardinality-limit': `Attempt to add "${value}" failed because the maximum cardinality was breached [${get(this, '_cardinality.max')}]`,
      'min-cardinality-limit': `Attempt to remove "${value}" failed because the minimum cardinality must be maintained [${get(this, '_cardinality.min')}]`
    };

    if (this.attrs.onError) {
      this.attrs.onError({
        code: code,
        message: messageLookup[code],
        context: this,
        details: {
          valueAttempted: value
        }
      });
    }
  },
  notBoundOnChange() {
    console.warn(`The container of ${this.elementId}/${name} did not bind to onChange()`);
    this.set('disabled', true);
    this.set('mood', 'danger');
    if(this.attrs.onError) {
      this.attrs.onError({
        code: 'onchange-not-bound',
        message: 'containers of ui-buttons must listen to the onChange event to manage state.',
        context: this,
        details: {}
      });
    }
  },

  actions: {
    onClick(hash) {
      const {_cardinality, values} = this.getProperties('_cardinality', 'values');
      console.log(`click: ${hash.value}`);
      console.log(hash);
      const action = a(values).contains(hash.value) ? 'remove' : 'add';
      if(action === 'add') {
        // ADD
        console.log('cardinality:', _cardinality);
        if(_cardinality.max > values.length) {
          this.addValue(hash.value);
        } else if (_cardinality.max === 1) {
          this.setValue(hash.value);
        } else {
          this.rejectValue(action, hash.value, 'max-cardinality-limit');
        }
      } else {
        // REMOVE
        if(_cardinality.min < values.length) {
          this.removeValue(hash.value);
        } else {
          this.rejectValue(action, hash.value, 'min-cardinality-limit');
        }
      }
    },
    onToggle(hash) {
      console.log('toggle');
      console.log(hash);
    }
  }
});
