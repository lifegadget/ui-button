import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ui-toggle-button', 'Integration | Component | ui toggle button', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{ui-toggle-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#ui-toggle-button}}
      template block text
    {{/ui-toggle-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
