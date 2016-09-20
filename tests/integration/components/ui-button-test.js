import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ui-button', 'Integration | Component | ui-button', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{ui-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#ui-button}}
      template block text
    {{/ui-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

test('inline button respond to "orient"', function(assert) {
  this.set('orient', 'horizontal'); // default state
  this.render(hbs`{{ui-button
    'foobar'
    icon='envelope'
    orient=orient
  }}`);
  assert.equal(this.$('button .content').css('flex-direction'), 'row', 'row is default');
  this.set('orient', 'vertical');
  assert.equal(this.$('button .content').css('flex-direction'), 'column', 'switched to column when vertical orient specified');
  this.set('orient', null);
  assert.equal(this.$('button .content').css('flex-direction'), 'row', 'switched back to "row" when stack is null');
});
