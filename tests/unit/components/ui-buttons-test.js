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

test('Inline buttons: setting value', function(assert) {
  let component = this.subject({
    cardinality: '1:M',
    buttons: 'Foo,Bar,Baz'
  });
  this.render();
  Ember.run.next(()=> {
    const selectedButtons = component.get('selectedButtons');
    assert.equal(selectedButtons.size, 0, 'initially no buttons selected');
    component.set('value', 'foo');
    assert.equal(component.get('value'), 'foo', 'after setting foo, it should be accessible with get');
    assert.equal(selectedButtons.size, 1, 'one item should be selected');
    assert.equal(selectedButtons.has('foo'), true, 'selectedButtons has "foo"');
    component.set('value', 'bar');
    assert.equal(component.get('value'), 'bar', 'after setting bar, it should be accessible with get');
    assert.equal(selectedButtons.size, 1, 'still only one item should exist in selectedButtons');
    assert.equal(selectedButtons.has('bar'), true, 'selectedButtons should have "bar" ... in fact was "' + Array.from(selectedButtons)[0] + '"');
    const barButton = component.get('_registeredItems').filterBy('value','bar')[0];
    assert.equal(barButton.get('selected'), true, 'the button "bar" should be selected');

  });
});
