import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';


moduleForComponent('ui-button', 'Integration | Component | ui-button', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ui-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#ui-button}}
      template block text
    {{/ui-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

test('inline title sets', function(assert) {
  assert.expect(1);
  this.render(hbs`{{ui-button title='hello world'}}`);
  assert.equal(this.$().text().trim(), 'hello world');
});


