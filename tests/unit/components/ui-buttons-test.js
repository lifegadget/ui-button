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

test('Inline buttons with initial value set', function(assert) {
  let component = this.subject({
    buttons: 'Foo,Bar,Baz',
    value: 'foo'
  });
  this.render();
  const foo = component.get('_registeredItems').filter(item => {
    return item.get('value') === 'foo';
  })[0];
  const fooId = foo.get('elementId');

  assert.equal(String(fooId).substr(0,5),'ember',`registered item with value foo has an elementId [${fooId}]`);
  assert.equal(component.get('selectedItems').has(fooId),true,'the elementId of foo should be in valueItems');
});
