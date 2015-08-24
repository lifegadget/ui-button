import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ui-buttons', 'Integration | Component | ui buttons', {
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
