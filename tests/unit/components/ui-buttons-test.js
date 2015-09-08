import Ember from 'ember'; //jshint ignore:line
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line

import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('ui-buttons', 'Unit | Component | ui-buttons', {
  // Specify the other units that are required for this test
  needs: ['component:ui-button'],
  unit: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('Registration of inline buttons', function(assert) {
  let component = this.subject({
    buttons: 'Foo,Bar,Baz'
  });
  this.render();
  assert.equal(component.get('_registeredItems.length'), 3, 'three registered items');
  const values = new Set(component.get('_registeredItems').map(item => {
    return item.get('value');
  }));
  const titles = new Set(component.get('_registeredItems').map(item => {
    return item.get('title');
  }));

  assert.equal(values.has('foo'),true,'the value of one of the items should be "foo"');
  assert.equal(titles.has('Foo'),true,'the title of one of the items should be "Foo"');
});

test('Setting value', function(assert) {
  let component = this.subject({
    cardinality: '1:M',
    buttons: 'Foo,Bar,Baz'
  });
  this.render();
  Ember.run.next(()=> {
    let selectedButtons = component.get('selectedButtons');
    assert.equal(selectedButtons.size, 0, 'initially no buttons selected');
    component.set('value', 'foo');
    assert.equal(component.get('value'), 'foo', 'after setting foo, it should be accessible with get');
    assert.equal(selectedButtons.size, 1, 'one item should be selected');
    assert.equal(selectedButtons.has('foo'), true, 'selectedButtons has "foo"');
    component.set('value', 'bar');
    assert.equal(component.get('value'), 'bar', 'after setting bar, it should be accessible with get');
    assert.equal(selectedButtons.size, 1, 'still only one item should exist in selectedButtons');
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons should have "bar" ... in fact was "' + Array.from(selectedButtons)[0] + '"');
    let barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" should be selected');
    // Value set to null
    component.set('value', null);
    selectedButtons = component.get('selectedButtons');
    assert.equal(component.get('value'), null, 'after setting null, it should be accessible with get');
    assert.equal(selectedButtons.size, 0, 'zero items should be selected');
    assert.equal(selectedButtons.has('bar'), false, 'selectedButtons does not have "bar"');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), false, 'the button "bar" should no longer be selected');
  });
});

test('Setting values', function(assert) {
  let component = this.subject({
    cardinality: '0:M',
    buttons: 'Foo,Bar,Baz'
  });
  this.render();
  Ember.run.next(()=> {
    let selectedButtons = component.get('selectedButtons');
    assert.equal(selectedButtons.size, 0, 'initially no buttons selected');
    component.set('values', ['foo', 'bar']);
    assert.equal(component.get('values.length'), 2, 'two items should be in values');
    selectedButtons = component.get('selectedButtons');
    assert.equal(selectedButtons.size, 2, 'two items should be in selectedButtons');
    assert.equal(selectedButtons.has('foo'), true, `selectedButtons should contain foo (${JSON.stringify(selectedButtons)})`);
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons should contain bar');
    // check underlying buttons
    let fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), true, 'the button "foo" should be selected');
    let barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" should be selected');

    // Set to null
    component.set('values', null);
    selectedButtons = component.get('selectedButtons');
    assert.equal(component.get('values.length'), 0, 'no items should be in values after setting to null');
    assert.equal(selectedButtons.size, 0, 'no items should be in selectedButtons: ' + JSON.stringify(selectedButtons));
    assert.equal(selectedButtons.has('foo'), false, `selectedButtons should not contain foo (${JSON.stringify(selectedButtons)})`);
    assert.equal(selectedButtons.has('bar'), false, 'selectedButtons should not contain bar');
    // check underlying buttons
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), false, 'the button "foo" should NOT be selected');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), false, 'the button "bar" should NOT be selected');

    // Set to []
    component.set('values', []);
    assert.equal(component.get('values.length'), 0, 'no items should be in values after setting to []');
    selectedButtons = component.get('selectedButtons');
    assert.equal(selectedButtons.size, 0, 'no items should be in selectedButtons');
    // check underlying buttons
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), false, 'the button "foo" should NOT be selected');
  });
});

test('Activating and deactivating buttons', function(assert) {
  assert.expect(70);
  let component = this.subject({
    cardinality: '1:2',
    buttons: 'Foo,Bar,Baz'
  });
  this.render();
  Ember.run.next(()=> {
    let selectedButtons = component.get('selectedButtons');
    let value = component.get('value');
    let values = component.get('values');
    assert.equal(selectedButtons.size, 0, 'initially no buttons selected');
    // Activate FOO
    component._activateButton('foo');
    selectedButtons = component.get('selectedButtons');
    value = component.get('value');
    values = component.get('values');
    assert.equal(value, 'foo', 'after activating foo, value should be foo');
    assert.equal(new Set(values).has('foo'), true, 'values should be an array of "foo": ' + JSON.stringify(values));
    assert.equal(selectedButtons.size, 1, 'one item should be selected');
    assert.equal(selectedButtons.has('foo'), true, 'selectedButtons has "foo"');
    let fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), true, 'the button "foo" should be selected');
    let barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), false, 'the button "bar" should not be selected');
    let bazButton = component.get('_registeredItems').filterBy('value','baz')[0];
    assert.equal(bazButton.get('selected'), false, 'the button "baz" should not be selected');
    // Activate BAR
    component._activateButton('bar');
    selectedButtons = component.get('selectedButtons');
    value = component.get('value');
    values = component.get('values');
    assert.equal(value, 'foo,bar', 'after activating bar, value should be CSV string');
    assert.equal(new Set(values).has('foo'), true, 'values should have "foo": ' + JSON.stringify(values));
    assert.equal(new Set(values).has('bar'), true, 'values should have "bar" ');
    assert.equal(new Set(values).has('baz'), false, 'values should NOT have "baz"');
    assert.equal(selectedButtons.size, 2, 'two items should be selected');
    assert.equal(selectedButtons.has('foo'), true, 'selectedButtons has "foo"');
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons has "bar"');
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), true, 'the button "bar" should be selected');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" SHOULD be selected');
    bazButton = component.get('_registeredItems').filterBy('value','baz')[0];
    assert.equal(bazButton.get('selected'), false, 'the button "baz" should NOT be selected');
    // Activate BAZ (not allowed due to cardinality)
    component._activateButton('baz');
    selectedButtons = component.get('selectedButtons');
    value = component.get('value');
    values = component.get('values');
    assert.equal(value, 'foo,bar', 'value should be CSV string');
    assert.equal(new Set(values).has('foo'), true, 'values should have "foo": ' + JSON.stringify(values));
    assert.equal(new Set(values).has('bar'), true, 'values should have "bar" ');
    assert.equal(new Set(values).has('baz'), false, 'values should NOT have "baz"');
    assert.equal(selectedButtons.size, 2, 'two items should be selected');
    assert.equal(selectedButtons.has('foo'), true, 'selectedButtons has "foo"');
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons has "bar"');
    assert.equal(selectedButtons.has('baz'), false, 'selectedButtons does not have "baz"');
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), true, 'the button "bar" should be selected');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" should be selected');
    bazButton = component.get('_registeredItems').filterBy('value','baz')[0];
    assert.equal(bazButton.get('selected'), false, 'the button "baz" SHOULD NOT be selected');
    // Change cardinality and try again
    component.set('cardinality', '1:M');
    component._activateButton('baz');
    selectedButtons = component.get('selectedButtons');
    value = component.get('value');
    values = component.get('values');
    assert.equal(value, 'foo,bar,baz', 'value should be CSV string');
    assert.equal(new Set(values).has('foo'), true, 'values should have "foo": ' + JSON.stringify(values));
    assert.equal(new Set(values).has('bar'), true, 'values should have "bar" ');
    assert.equal(new Set(values).has('baz'), true, 'values should have "baz"');
    assert.equal(selectedButtons.size, 3, 'three items should be selected');
    assert.equal(selectedButtons.has('foo'), true, 'selectedButtons has "foo"');
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons has "bar"');
    assert.equal(selectedButtons.has('baz'), true, 'selectedButtons has "baz"');
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), true, 'the button "bar" should be selected');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" should be selected');
    bazButton = component.get('_registeredItems').filterBy('value','baz')[0];
    assert.equal(bazButton.get('selected'), true, 'the button "baz" SHOULD be selected');
    // DEACTIVATE FOO & BAZ
    component._deactivateButton('foo');
    component._deactivateButton('baz');
    selectedButtons = component.get('selectedButtons');
    value = component.get('value');
    values = component.get('values');
    assert.equal(value, 'bar', 'after deactivation, should just be singular string');
    assert.equal(new Set(values).has('foo'), false, 'values should not have "foo": ' + JSON.stringify(values));
    assert.equal(new Set(values).has('bar'), true, 'values should have "bar" ');
    assert.equal(new Set(values).has('baz'), false, 'values should not have "baz"');
    assert.equal(selectedButtons.size, 1, 'one item should be selected');
    assert.equal(selectedButtons.has('foo'), false, 'selectedButtons does not have "foo"');
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons has "bar"');
    assert.equal(selectedButtons.has('baz'), false, 'selectedButtons does not have "baz"');
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), false, 'the button "bar" should not be selected');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" should be selected');
    bazButton = component.get('_registeredItems').filterBy('value','baz')[0];
    assert.equal(bazButton.get('selected'), false, 'the button "baz" should not be selected');
    // DEACTIVATE BAR (not allowed based on cardinality)
    component._deactivateButton('bar');
    selectedButtons = component.get('selectedButtons');
    value = component.get('value');
    values = component.get('values');
    assert.equal(value, 'bar', 'after deactivation, should just be singular string');
    assert.equal(new Set(values).has('foo'), false, 'values should not have "foo": ' + JSON.stringify(values));
    assert.equal(new Set(values).has('bar'), true, 'values should have "bar" ');
    assert.equal(new Set(values).has('baz'), false, 'values should not have "baz"');
    assert.equal(selectedButtons.size, 1, 'one item should be selected');
    assert.equal(selectedButtons.has('foo'), false, 'selectedButtons does not have "foo"');
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons has "bar"');
    assert.equal(selectedButtons.has('baz'), false, 'selectedButtons does not have "baz"');
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), false, 'the button "bar" should not be selected');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" should be selected');
    bazButton = component.get('_registeredItems').filterBy('value','baz')[0];
    assert.equal(bazButton.get('selected'), false, 'the button "baz" should not be selected');
    // DEACTIVATE BAR (after adjusting cardinality)
    component.set('cardinality', '0:M');
    component._deactivateButton('bar');
    selectedButtons = component.get('selectedButtons');
    value = component.get('value');
    values = component.get('values');
    assert.equal(value, null, 'after deactivation, should be null');
    assert.equal(new Set(values).has('foo'), false, 'values should not have "foo": ' + JSON.stringify(values));
    assert.equal(new Set(values).has('bar'), false, 'values should have "bar" ');
    assert.equal(selectedButtons.size, 0, 'no items should be selected');
    assert.equal(selectedButtons.has('bar'), false, 'selectedButtons has "bar"');
    fooButton = component.get('_registeredItems').filterBy('value','foo')[0];
    assert.equal(fooButton.get('selected'), false, 'the button "bar" should not be selected');
    barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), false, 'the button "bar" should be selected');
    bazButton = component.get('_registeredItems').filterBy('value','baz')[0];
    assert.equal(bazButton.get('selected'), false, 'the button "baz" should not be selected');
  });
});

test('Setting explicit values with inline form', function(assert) {
  let component = this.subject({
    cardinality: '1:M',
    buttons: 'Foo::1,Bar::hello dolly,Baz:::null,Monkey:::false'
  });
  this.render();
  Ember.run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    const fooButton = registeredButtons.filterBy('title','Foo')[0];
    const barButton = registeredButtons.filterBy('title','Bar')[0];
    const bazButton = registeredButtons.filterBy('title','Baz')[0];
    const monkeyButton = registeredButtons.filterBy('title','Monkey')[0];
    assert.equal(registeredButtons.length, 4, 'all buttons registered');
    assert.equal(fooButton.get('value'), 1, 'Foo should be a numeric 1');
    assert.equal(barButton.get('value'), 'hello dolly', 'Bar should be a string');
    assert.equal(bazButton.get('value'), null, 'Baz should be null');
    assert.equal(monkeyButton.get('value'), false, 'Monkey should be false');
  });
});

test('Setting explicit numeric values with inline form', function(assert) {
  let component = this.subject({
    cardinality: '1:M',
    buttons: 'Foo:::1,Bar:::-22,Baz::3,4'
  });
  this.render();
  Ember.run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    const fooButton = registeredButtons.filterBy('title','Foo')[0];
    const barButton = registeredButtons.filterBy('title','Bar')[0];
    const bazButton = registeredButtons.filterBy('title','Baz')[0];
    const monkeyButton = registeredButtons.filterBy('title','4')[0];
    assert.equal(registeredButtons.length, 4, 'all buttons registered');
    assert.equal(typeOf(fooButton.get('value')), 'number', 'Foo should be a numeric');
    assert.equal(typeOf(barButton.get('value')), 'number', 'Bar should be a numeric');
    assert.equal(typeOf(bazButton.get('value')), 'string', 'Baz should be a string');
    assert.equal(typeOf(monkeyButton.get('value')), 'string', 'Monkey should be a string');
  });
});

test('Setting explicit array values with inline form', function(assert) {
  let component = this.subject({
    cardinality: '1:M',
    buttons: 'Foo:::1|2|3,Bar:::foo|bar|baz'
  });
  this.render();
  Ember.run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    const fooButton = registeredButtons.filterBy('title','Foo')[0];
    const barButton = registeredButtons.filterBy('title','Bar')[0];
    assert.equal(registeredButtons.length, 2, 'all buttons registered');
    assert.equal(typeOf(fooButton.get('value')), 'array', 'Foo should be an array: ' + JSON.stringify(fooButton.get('value')));
    assert.equal(typeOf(fooButton.get('value.0')), 'number', 'Foo values shoud be numbers');
    assert.equal(typeOf(barButton.get('value')), 'array', 'Bar should be an array');
    assert.equal(typeOf(barButton.get('value.0')), 'string', 'Bar values should be strings');
  });
});

test('Setting active and inactive icons', function(assert) {
  let component = this.subject({
    cardinality: '1:M',
    buttons: 'foo,bar,baz',
    activeIcon: 'circle'
  });
  this.render();
  Ember.run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    const fooButton = registeredButtons.filterBy('value','foo')[0];
    const barButton = registeredButtons.filterBy('value','bar')[0];
    assert.equal(component.get('activeIcon'), 'circle', 'activeIcon starts as circle');
    component.set('value','foo');
    assert.equal(fooButton.get('selected'), true, 'the foo button should be selected');
    assert.equal(fooButton.get('activeIcon'), 'circle', 'foo has been passed groups value');
    assert.equal(fooButton.get('_icon'), 'circle', 'foo returns the selected icon');
    assert.equal(barButton.get('_icon'), null, 'bar returns no icon');
  });
});

test('Setting empty array for buttons does not error', function(assert) {
  let component = this.subject({
    buttons: []
  });
  this.render();
  Ember.run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    assert.equal(registeredButtons.length, 0);
  });
});

test('null value passed-in selects button with null value', function(assert) {
  let component = this.subject({
    buttons: ['One','Two','Three:::null'],
    cardinality: '1:1',
    value: null
  });
  this.render();
  run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    assert.deepEqual(registeredButtons.map(item => item.get('value')), ['one', 'two', null], 'registered buttons have appropriate values');
    assert.equal(component.get('value'), null, 'ui-buttons value set');
    assert.deepEqual(component.get('values'), [null], 'ui-buttons values set');
    assert.equal(component.get('selectedButtons').has(null), true, 'selectedButtons includes null value');
  });
});
test('false value passed-in selects button with false value', function(assert) {
  let component = this.subject({
    buttons: ['One','Two','Three:::false'],
    cardinality: '1:1',
    value: false
  });
  this.render();
  run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    assert.deepEqual(registeredButtons.map(item => item.get('value')), ['one', 'two', false], 'registered buttons have appropriate values');
    assert.equal(component.get('value') === false, true, 'ui-buttons "value" set');
    run.next(() => {
      assert.deepEqual(component.get('values'), [false], 'ui-buttons "values" set');
      assert.equal(component.get('selectedButtons').has(false), true, 'selectedButtons includes false value');
    });
  });
});
test('Switching to null value after initial render (where null IS valid)', function(assert) {
  var value = 'two';
  let component = this.subject({
    buttons: ['One','Two','Three:::null'],
    cardinality: '0:1',
    value: value
  });
  this.render();
  run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    assert.deepEqual(registeredButtons.map(item => item.get('value')), ['one', 'two', null], 'PREP: registered buttons have appropriate values, including null');
    assert.equal(component.nullValidOption(), true, 'PREP: null has been marked as a "valid option"');
    assert.equal(component.get('value'), value, 'PREP: ui-buttons "value" set');
    assert.deepEqual(component.get('values'), [value], 'PREP: ui-buttons "values" set');
    assert.equal(component.get('selectedButtons').has(value), true, 'PREP: selectedButtons includes value');
    component.set('value', null);
    run.next(()=> {
      assert.equal(component.get('value'), null, 'ui-buttons value set to null');
      assert.deepEqual(component.get('values'), [null], 'ui-buttons values set');
      assert.equal(component.get('selectedButtons').has(null), true, 'selectedButtons includes null');
    });
  });
});
test('Switching to null value after initial render (where null IS NOT valid value)', function(assert) {
  var value = 'two';
  let component = this.subject({
    buttons: ['One','Two','Three'],
    cardinality: '0:1',
    value: value
  });
  this.render();
  run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    assert.deepEqual(registeredButtons.map(item => item.get('value')), ['one', 'two', 'three'], 'PREP: registered buttons have appropriate values');
    assert.equal(component.nullValidOption(), false, 'PREP: null has been marked as an "invalid option"');
    assert.equal(component.get('value'), value, 'PREP: ui-buttons "value" set');
    assert.deepEqual(component.get('values'), [value], 'PREP: ui-buttons "values" set');
    assert.equal(component.get('selectedButtons').has(value), true, 'PREP: selectedButtons includes value');
    component.set('value', null);
    run.next(()=> {
      assert.equal(component.get('value'), null, 'ui-buttons value set to null');
      assert.deepEqual(component.get('values'), [], 'ui-buttons values set to []');
      assert.equal(component.get('selectedButtons').has(null), false, 'selectedButtons does not includes null');
    });
  });
});

test('Switching to false value after initial render', function(assert) {
  var value = 'two';
  let component = this.subject({
    buttons: ['One','Two','Three:::false'],
    cardinality: '1:1',
    value: value
  });
  this.render();
  run.next(()=> {
    const registeredButtons = component.get('_registeredItems');
    assert.deepEqual(registeredButtons.map(item => item.get('value')), ['one', 'two', false], 'PREP: registered buttons have appropriate values');
    assert.equal(component.get('value'), value, 'PREP: ui-buttons value set');
    assert.deepEqual(component.get('values'), [value], 'PREP: ui-buttons values set');
    assert.equal(component.get('selectedButtons').has(value), true, 'PREP: selectedButtons includes value');
    component.set('value', false);
    run.next(()=> {
      assert.equal(component.get('value'), false, 'ui-buttons value set to false');
      assert.deepEqual(component.get('values'), [false], 'ui-buttons values set');
      let selectedButtons = component.get('selectedButtons');
      assert.equal(selectedButtons.has(false), true, 'selectedButtons includes "false": ' + JSON.stringify(selectedButtons));
    });
  });
});
