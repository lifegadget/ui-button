import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const { RSVP: {Promise, all, race, resolve, defer} } = Ember; // jshint ignore:line
const { inject: {service} } = Ember; // jshint ignore:line
const { computed, observer, $, run, on, typeOf, debug } = Ember;  // jshint ignore:line
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
    } else if (value === 'undefined') {
      value = undefined;
    }
    return {title: name, value: value};
  },
  nameValue: ([name, value]) => {
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
      return parse.literalNameValue(...b.split(':::'));
    } else if (b.indexOf('::') !== -1) {
      return parse.nameValue(b.split('::'));
    } else {
      return parse.dasherizedNameValue(b);
    }
  });
};

import layout from '../templates/components/ui-buttons';


const buttons = Ember.Component.extend({
  layout,
  tagName: '',
  init() {
    this._super(...arguments);
    const defaultValue = this.get('defaultValue');
    const type = typeOf(defaultValue);
    if(!get(this, 'values') && defaultValue) {
      this.ddau('onChange', {
        code: 'default-value',
        values: type === 'array' ? defaultValue : defaultValue.split(/,\s*/),
        value: type === 'array' ? defaultValue.join(',') : defaultValue,
        context: this,
        name: get(this, 'name')
      }, defaultValue);
    }

    const {_cardinality, values} = this.getProperties('_cardinality', 'values');
    run.schedule('afterRender', () => {
      if(_cardinality.min > values.length) {
        this.requestMinimumCardinality();
      }
      if(_cardinality.max < values.length) {
        this.requireMaximumCardinality();
      }
    });
  },

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
  values: computed('value', {
    set(_,values) {
      if(typeOf(values) !== 'array') {
        debug(`values property of ui-buttons should be always be an array, was set as "${typeOf(values)}". Will default to an empty array as a fallback.`);
        return [];
      } else {
        return values;
      }
    },
    get() {
      const value = this.get('value');
      if(typeOf(value) !== 'undefined') {
        return value ? [value] : [];
      }
      return [];
    }
  }),
  disabled: false,
  name: '',
  activeMood: 'secondary',
  inactiveMood: 'secondary',
  activeSize: 'default',
  inactiveSize: 'default',
  tooltipPlace: 'top',
  orientation: computed.alias('orient'),
  orient: 'horizontal',
  fill: false,
  stretch: computed.alias('fill'),
  isDDAU: true, // allows for manual override to make a non-DDAU component
  rotate: computed({
    set(_, value) {
      return value;
    },
    get() {
      const {_cardinality} = this.getProperties('_cardinality');
      if (_cardinality.min === _cardinality.max || _cardinality.max === 1) {
        return 'fifo';
      } else {
        return null;
      }
    }
  }),

  addValue(value) {
    const {values, name} = this.getProperties('values', 'name');
    const newValues = values.slice(0); // clone
    newValues.push(value);

    return this.handleMutationOrAction({
        code: 'add-value',
        values: newValues,
        oldValues: values,
        newValue: value,
        context: this,
        name: name,
        value: newValues.join(', ')
    });
  },

  /**
   * Rotate a new value in for old based on `rotate` property (fifo, lifo)
   */
  rotateValue(value) {
    const {values, name, rotate} = this.getProperties('values', 'name', 'rotate');
    const newValues = values.slice(0);
    if (rotate === 'fifo') {
      newValues.shift();
    } else {
      newValues.pop();
    }
    newValues.push(value);

    return this.handleMutationOrAction({
      code: 'rotate-value',
      values: newValues,
      oldValues: values,
      context: this,
      name: name,
      value: newValues.join(', ')
    });
  },

  removeValue(value) {
    const {values, name} = this.getProperties('values', 'name');
    const newValues = values.slice(0).filter(v => v !== value);

    return this.handleMutationOrAction({
      code: 'remove-value',
      values: newValues,
      oldValues: values,
      removedValue: value,
      context: this,
      name: name,
      value: newValues.join(', ')
    });
  },

  handleMutationOrAction(hash) {
    let response;
    if (this.attrs.onChange && this.attrs.onChange.update) {
      if(this.attrs.value) {
        this.attrs.onChange.update(hash.value);
      } else if (this.attrs.values) {
        this.attrs.onChange.update(hash.values);
      } else {
        debug('The "mut" helper was used but container is not listening to "value" or "values" properties!');
      }
      response = true;
    } else if (this.attrs.onChange){
      response = this.attrs.onChange(hash);
    } else {
      this.notBoundOnChange();
      response = false;
    }
    // if not bound to values then container is responsible for updating
    // "values" and there is no risk to that bleeding out to the container
    if(!this.attrs.values && response !== false ) {
      this.set('values', hash.values);
    }

    return response;
  },

  rejectValue(action, value, code) {
    const messageLookup = {
      'max-cardinality-limit': `Attempt to add "${value}" failed because the maximum cardinality was breached [${get(this, '_cardinality.max')}]`,
      'min-cardinality-limit': `Attempt to remove "${value}" failed because the minimum cardinality must be maintained [${get(this, '_cardinality.min')}]`
    };

    if (this.attrs.onError) {
      this.attrs.onError({
        code: code,
        subCode: 'rejected',
        valueAttempted: value,
        message: messageLookup[code],
        context: this
      });
    }
  },

  requestMinimumCardinality() {
    if(this.attrs.onError) {
      const {name,id,values,_cardinality,_buttons} = this.getProperties('name', 'id', 'values', '_cardinality','_buttons');
      let delta = _cardinality.min - values.length;
      const possibleValues = _buttons.map(b=>b.value);
      const suggestedValues = a(values.slice(0));
      possibleValues.forEach(p => {
        if(!suggestedValues.includes(p) && delta > 0) {
          suggestedValues.pushObject(p);
          delta--;
        }
      });

      let response;
      if(this.attrs.onError) {
        response = this.attrs.onError({
          code: 'min-cardinality-not-met',
          message: `The ${id}/${name} component -- with ${values.length} buttons -- does not meet minimum cardinality requirements of ${get(this, '_cardinality.min')}`,
          suggestedValues: suggestedValues,
          context: this
        });
      }
      // run.next(() => {
        if (response !== false) {
          return this.handleMutationOrAction({
            code: 'cardinality-suggestion',
            values: suggestedValues,
            oldValues: values,
            name: this.get('name'),
            context: this,
            message: `Minimum cardinality for this group ${_cardinality.min} was not met, suggested values will move the group back in line with constraints.`
          });
        } else {
          this.set('disabled', true);
        }
      // });

    }
  },

  requireMaximumCardinality() {
    if(this.attrs.onError) {
      const {name,id,values,_cardinality,_buttons} = this.getProperties('name', 'id', 'values', '_cardinality','_buttons');
      const suggestedValues = _buttons.map(b=>b.value).slice(0,_cardinality.max);

      const response = this.attrs.onError({
        code: 'max-cardinality-not-met',
        message: `The ${id}/${name} component -- with ${values.length} buttons -- does not meet minimum cardinality requirements of ${get(this, '_cardinality.min')}`,
        context: this,
        name: this.get('name'),
        suggestedValues: suggestedValues,
        max: _cardinality.max,
        current: values.length
      });
      // run.next(() => {
        if (response !== false) {
          return this.handleMutationOrAction({
            code: 'cardinality-suggestion',
            values: suggestedValues,
            oldValues: values,
            context: this,
            name: this.get('name'),
            message: `Maximum cardinality for this group ${_cardinality.max} was exceeded, suggested values will move the group back in line with constraints.`
          });
        } else {
          this.set('disabled', true);
        }
      // });
    }
  },

  notBoundOnChange() {
    console.warn(`The container of ${this.id}/${name} did not bind to onChange()`);
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
      const {_cardinality, values, rotate} = this.getProperties('_cardinality', 'values', 'rotate');
      const action = a(values).includes(hash.value) ? 'remove' : 'add';
      if(action === 'add') {
        // ADD
        if(_cardinality.max > values.length) {
          this.addValue(hash.value);
        } else if (rotate) {
          this.rotateValue(hash.value);
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
    onToggle() {
      // console.log(hash);
    }
  }
});

buttons.reopenClass({
  positionalParams: ['buttons']
});
buttons[Ember.NAME_KEY] = 'ui-buttons';
export default buttons;
