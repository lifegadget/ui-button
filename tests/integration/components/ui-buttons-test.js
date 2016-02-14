import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ui-buttons', 'Integration | Component | ui buttons', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{ui-buttons}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#ui-buttons}}
      template block text
    {{/ui-buttons}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

test('inline buttons are parsed into proper config', function(assert) {
  this.render(hbs`{{ui-buttons buttons='Foo,Bar::bar-fly,Baz:::false'}}`);

  assert.equal(this.$('.ui-button').length, 3, 'three buttons');
  assert.equal(this.$('.ui-button')[0].value, 'foo', 'stardard dasharized conversion worked');
  assert.equal(this.$('.ui-button')[1].value, 'bar-fly', 'name-value parsed');
  assert.equal(this.$('.ui-button')[2].value, false, 'boolean literal value parsed');
  // NOTE: numeric literal can't be tested for by picking off DOM value as its always a string
  // assert.equal(this.$('.ui-button')[3].value, 5, 'numeric literal value parsed');
});

test('on initialization, active button highlighted', function(assert) {
  this.set('values', ['bar']);
  this.render(hbs`{{ui-buttons buttons='Foo,Bar,Baz' values=values}}`);

  assert.equal(this.$('.ui-button').length, 3, 'three buttons');
  assert.equal(this.$('.ui-button.active').length, 1, 'one active button');
  assert.equal(this.$('.ui-button.active').val(), 'bar', 'correct button selected');
});

test('on initialization, set three buttons active with cardinality limit of 2', function(assert) {
  const onError = (hash) => {
    if (hash.suggestedValues && hash.code === 'max-cardinality-not-met') {
      console.log('setting values: ', hash.suggestedValues);
      this.set('values', hash.suggestedValues);
    }
  };
  this.set('values', ['foo', 'bar', 'baz']);
  this.set('actions.onError', onError);

  this.render(hbs`{{ui-buttons
    buttons='Foo,Bar,Baz'
    cardinality='0:2'
    values=values
    onError=(action 'onError')
  }}`);

  assert.equal(this.$('.ui-button').length, 3, 'three buttons');
  assert.equal(this.$('.ui-button.active').length, 2, 'two active buttons');
  assert.equal(this.$('.ui-button.active')[0], 'foo', 'correct button selected');
  assert.equal(this.$('.ui-button.active')[1], 'bar', 'correct button selected');
});
