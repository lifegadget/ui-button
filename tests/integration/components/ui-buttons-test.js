import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line
const titles = (selector) => {
  let result = [];
  selector.map( (i, item) => {
    console.log($(item).text().trim());
    result.push($(item).text().trim());
  });
  return result;
};

moduleForComponent('ui-buttons', 'Integration | Component | ui-buttons', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ui-buttons}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#ui-buttons}}
      template block text
    {{/ui-buttons}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});


test('inline buttons created', function(assert) {
  assert.expect(3);
  this.render(hbs`
    {{ui-buttons buttons='One,Two,Three'}}
  `);

  assert.equal(this.$('.btn').length, 3, 'there are three buttons');
  assert.equal(this.$('.btn:first').text().trim(), 'One', 'title is "One"');
  assert.equal(this.$('.btn:last').text().trim(), 'Three', 'title is "Three"');
});

test('empty inline buttons array handled', function(assert) {
  assert.expect(2);

  this.set('buttons', []);
  this.render(hbs`
    {{ui-buttons buttons=buttons}}
  `);

  assert.equal(this.$('.btn').length, 0, 'there should be zero buttons');
  assert.equal(this.$().text().trim(), '');
});

test('values and titles incorporated correctly', function(assert) {
  assert.expect(4);

  var value = 'two';
  this.set('value', value);
  var buttonTitles = ['One','Two','Three More'];
  this.set('buttons', buttonTitles);
  this.render(hbs`
    {{ui-buttons buttons=buttons value=value cardinality='1:1'}}
  `);

  assert.deepEqual(titles(this.$('.btn')), buttonTitles, 'PREP: button titles match');
  run.next(()=> {
    assert.equal(this.value, value, 'PREP: button\'s value correct');
    this.$('.btn')[2].click();
    run.next(()=> {
      assert.equal(this.value, 'three-more', 'button\'s value switched to snake case on click');
      assert.equal(this.$('.btn.active').text().trim(), 'Three More', 'title in UI is correct');
    });
  });
});

test('values wins out over defaultValue', function(assert) {
  var value = 'three';
  this.set('value', value);
  var defaultValue = 'two';
  this.set('defaultValue', defaultValue);
  this.render(hbs`
    {{ui-buttons buttons='One,Two,Three' cardinality='1:1' value=value defaultValue=defaultValue}}
  `);
  run(()=> {
    assert.equal(this.$('.btn.active').text().trim(), 'Three');
  });

});

test('empty inline buttons array handled', function(assert) {
  assert.expect(2);

  this.set('buttons', []);
  this.render(hbs`
    {{ui-buttons buttons=buttons}}
  `);

  assert.equal(this.$('.btn').length, 0, 'there should be zero buttons');
  assert.equal(this.$().text().trim(), '');
});

test('button with "null" value passed-in is selected (when a button value is also null)', function(assert) {
  assert.expect(2);

  this.set('value', null);
  this.render(hbs`
    {{ui-buttons buttons='One::1,Two::2,NullValue:::null' value=value cardinality='1:1'}}
  `);

  run(()=> {
    assert.equal(this.$('.btn.active').text().trim(), 'NullValue', 'NullValue should be selected ');
    assert.equal(this.get('value'), null, 'container value still null');
  });
});

test('button with "false" passed-in is selected (when a button value is also false)', function(assert) {
  assert.expect(2);

  this.set('value', false);
  this.render(hbs`
    {{ui-buttons buttons='One::1,Two::2,FalseValue:::false' value=value cardinality='1:1'}}
  `);

  run(()=> {
    assert.equal(this.$('.btn.active').text().trim(), 'FalseValue', 'FalseValue should be selected ');
    assert.equal(this.get('value'), false, 'container value still false');
  });
});

test('button with "null" value is selected when clicked', function(assert) {
  assert.expect(4);

  this.set('value', 2);
  this.render(hbs`
    {{ui-buttons buttons='One:::1,Two:::2,NullValue:::null' value=value cardinality='1:1'}}
  `);
  assert.equal(this.get('value'), '2', 'container\'s value initialized correctly');
  assert.equal(this.$('.btn.active').text().trim(), 'Two', 'Initial title set properly');
  this.$('.btn')[2].click();
  run.next(()=> {
    assert.equal(this.$('.btn.active').text().trim(), 'NullValue', 'button with NullValue title should be selected ');
    assert.equal(this.get('value'), null, 'container\'s value is now null');
  });
});
