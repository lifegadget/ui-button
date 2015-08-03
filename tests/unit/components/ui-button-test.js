import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('ui-button', 'Unit | Component | ui-button', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
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

test('size, mood, icon, and value private CP\'s set', function(assert) {
  let component = this.subject();
  component.set('size', 'large');
  component.set('mood', 'success');
  component.set('icon', 'envelope');
  component.set('value', 'foobar');
  this.render();
  assert.equal(component.get('_size'), 'btn-lg', 'size ok');
  assert.equal(component.get('_mood'), 'btn-success', 'mood ok');
  assert.equal(component.get('_icon'), 'envelope', 'icon ok');
  assert.equal(component.get('value'), 'foobar', 'value ok');
});

test('icon toggled between on,off states', function(assert) {
  assert.expect(3);
  let component = this.subject();
  component.set('onIcon', 'envelope');
  component.set('offIcon', 'clock');
  component.set('isToggleable', true);
  this.render();
  assert.equal(component.get('_icon'), 'clock');
  Ember.run.next(()=> {
    component.toggle();
    assert.equal(component.get('_icon'), 'envelope');
    component.toggle();
    assert.equal(component.get('_icon'), 'clock');
  });
});

test('mood toggled between on,off states', function(assert) {
  assert.expect(3);
  let component = this.subject();
  component.set('offMood', 'error');
  component.set('onMood', 'warning');
  component.set('isToggleable', true);
  this.render();
  assert.equal(component.get('_mood'), 'btn-error');
  Ember.run.next(()=> {
    component.toggle();
    assert.equal(component.get('_mood'), 'btn-warning');
    component.toggle();
    assert.equal(component.get('_mood'), 'btn-error');
  });
});

test('value toggled between on,off states', function(assert) {
  assert.expect(3);
  let component = this.subject();
  component.set('offValue', false);
  component.set('onValue', true);
  component.set('isToggleable', true);
  this.render();
  assert.equal(component.get('value'), false);
  Ember.run.next(()=> {
    component.toggle();
    assert.equal(component.get('value'), true);
    component.toggle();
    assert.equal(component.get('value'), false);
  });
});

test('value defaults to camelized title if not set', function(assert) {
  assert.expect(1);
  let component = this.subject({
    title: 'Foo Bar'
  });
  this.render();
  assert.equal(component.get('value'), 'foo-bar', 'value is set to foo-bar');
});

test('value defaults to elementId if not set (and no title set)', function(assert) {
  assert.expect(1);
  let component = this.subject();
  this.render();
  assert.equal(component.get('value'), component.get('elementId'), 'value is set to elementId: ' + component.get('elementId'));
});


test('value set back and forth with setter and toggling (toggleable button)', function(assert) {
  assert.expect(8);
  let component = this.subject();
  component.set('isToggleable', true);
  component.set('offValue', false);
  component.set('onValue', true);
  this.render();
  assert.equal(component.get('value'),false, 'value starts in the offValue state of false');
  Ember.run.next(()=> {
    component.set('value', 'bar'); // sets the offValue
    assert.equal(component.get('offValue'), 'bar', 'setting the value to "bar" sets the offValue to "bar"');
    assert.equal(component.get('toggled'), false, 'toggled property remains set to false');
    component.toggle();
    assert.equal(component.get('toggled'), true, 'toggled property has changed to true');
    assert.equal(component.get('onValue'), true, 'the onValue has remained set at true');
    assert.equal(component.get('value'), component.get('onValue'), 'the value is now reporting the "onValue"');
    component.set('value', 'bar');
    assert.equal(component.get('toggled'), false, 'setting value to the offValue should have resulted in toggled returning to a false state');
    assert.equal(component.get('value'), component.get('offValue'), 'the value is back to reporting the "offValue"');
  });
});

test('value toggling ignored on non-toggleable button', function(assert) {
  assert.expect(3);
  let component = this.subject();
  component.set('isToggleable', false);
  component.set('offValue', false);
  component.set('onValue', true);
  this.render();
  assert.equal(
    component.get('value'),
    component.get('offValue'),
    'value starts in the offValue state of false'
  );
  Ember.run.next(()=> {
    component.set('value', component.get('onValue'));
    assert.equal(
      component.get('toggled'),
      false,
      'setting value to the onValue did NOT create a toggled state'
    );
    assert.equal(
      component.get('offValue'),
      component.get('offValue'),
      'setting the value did change the "offValue" to true');
  });
});


test('value set at instantiation; effects toggle', function(assert) {
  assert.expect(2);
  let component = this.subject({
    isToggleable: true,
    offValue: false,
    onValue: true,
    value: true
  });
  assert.equal(component.get('value'), true, 'value should start out as true');
  assert.equal(component.get('toggled'), true, 'toggled should habe been switched to true as well');
});

test('selected flag impacted by selectedButtons', function(assert) {
  assert.expect(2);
  let component = this.subject({
    isSelectable: true
  });
  this.render();
  Ember.run.next(() => {
    const id = component.get('elementId');
    assert.equal(component.get('selected'), false, '"selected" should be false when nothing is in selectedButtons');
    component.set('selectedButtons', new Set().add(id));
    assert.equal(component.get('selected'), true, '"selected" should have switched to true');
  });
});

test('selected flag ignores selectedButtons if isSelectable = false', function(assert) {
  assert.expect(2);
  let component = this.subject({
    isSelectable: false
  });
  this.render();
  Ember.run.next(() => {
    const id = component.get('elementId');
    assert.equal(component.get('selected'), false, '"selected" should be false when nothing is in selectedButtons');
    component.set('selectedButtons', new Set().add(id));
    assert.equal(component.get('selected'), false, '"selected" should have maintained a false status');
  });
});

test('disabled flag impacted by changes to disabledButtons', function(assert) {
  assert.expect(4);
  let component = this.subject();
  this.render();
  Ember.run.next(() => {
    const id = component.get('elementId');
    assert.equal(component.get('disabled'), false, '"disabled" should be false when nothing is in disabledButtons');
    component.set('disabledButtons', new Set().add(id));
    assert.equal(component.get('disabled'), true, '"disabled" should switch to true when new Set replacement provided');
    component.set('disabledButtons', new Set());
    assert.equal(component.get('disabled'), false, '"disabled" should switch to false when new empty Set replacement provided');
    component.set('disabledButtons', new Set().add(id+'zzz'));
    assert.equal(component.get('disabled'), false, '"disabled" should remain false when new Set added but which only has other elementIds');
  });
});

test('setting disabled sets disabledButtons', function(assert) {
  assert.expect(3);
  let component = this.subject();
  assert.equal(component.get('disabledButtons').size, 0, 'there should be zero disabledButtons to start');
  component.set('disabled', true);
  assert.equal(component.get('disabledButtons.size'), 1, 'there should be one element in disabledButtons after setting button to disabled');
  component.set('disabled', false);
  assert.equal(component.get('disabledButtons.size'), 0, 'should be back to zero elements after setting disabled to false');
});

test('setting selected directly impacts selectedButtons (although not suggested use-case)', function(assert) {
  assert.expect(3);
  let component = this.subject({
    isSelectable: true
  });
  assert.equal(component.get('selectedButtons').size, 0, 'there should be zero selectedButtons to start');
  component.set('selected', true);
  assert.equal(component.get('selectedButtons.size'), 1, 'there should be one element in selectedButtons after setting "selected" to true');
  component.set('selected', false);
  assert.equal(component.get('selectedButtons.size'), 0, 'should be back to zero elements after setting selected to false');
});

test('setting selected on non-selectable button is ignored', function(assert) {
  assert.expect(2);
  let component = this.subject({
    isSelectable: false
  });
  assert.equal(component.get('selectedButtons').size, 0, 'there should be zero selectedButtons to start');
  component.set('selected', true);
  assert.equal(component.get('selectedButtons.size'), 0, 'even after setting select to true, selectedButtons should remain uneffected');
});

test('setting value to selectedButtons property selects it', function(assert) {
  assert.expect(3);
  let component = this.subject({
    isSelectable: true,
    value: 'bar',
    selectedButtons: new Set().add('foo')
  });
  assert.equal(component.get('selected'), false, 'button is NOT selected to start');
  component.set('value', 'foo');
  assert.equal(component.get('selectedButtons').has(component.get('value')), true, 'it is confirmed that value is within selectedButtons');
  assert.equal(component.get('selected'), true, 'after setting value, button should now be selected');
});

test('value set at initialisation part of selectedButtons property selects it', function(assert) {
  assert.expect(1);
  let component = this.subject({
    isSelectable: true,
    value: 'foo',
    selectedButtons: new Set().add('foo')
  });
  assert.equal(component.get('selected'), true);
});
