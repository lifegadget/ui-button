import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ui-buttons', 'Integration | Component | ui-buttons', {
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
  this.set('value', 'foo');
  this.render(hbs`
    {{ui-buttons
      buttons='Foo,Bar::bar-fly,Baz:::null,Bunny_rabbit,JumpingJackFlash'
      value=value
      onChange=(mut value)
    }}
  `);


  assert.equal(this.$('.ui-button').length, 5, 'five buttons');
  assert.equal(this.get('value'), 'foo', 'initialized value remains component state');
  this.$('.ui-button')[1].click();
  assert.equal(this.get('value'), 'bar-fly', 'bar-fly literal is passed through');
  // this.$('.ui-button')[2].click();
  // assert.equal(this.get('value'), false, 'Baz\'s value is false');
  this.$('.ui-button')[3].click();
  assert.equal(this.get('value'), 'bunny-rabbit', 'snakecase changed to dasherized');
  this.$('.ui-button')[4].click();
  assert.equal(this.get('value'), 'jumping-jack-flash', 'PascalCase changed to dasherized');

});

test('inline buttons are parsed into literal numeric or boolean', function(assert) {
  this.set('value', true);
  this.render(hbs`{{ui-buttons
    buttons='Foo:::true,Bar:::5,Baz:::false'
    value=value
    onChange=(mut value)
  }}`);
  assert.equal(this.get('value'), true, 'value intialized correctly');
  this.$('.ui-button')[1].click();
  assert.equal(this.get('value'), 5, 'numeric literal works');


  // TODO: below tests should pass!

  // this.$('.ui-button')[2].click();
  // assert.equal(this.get('value'), false, 'boolean false literal works');
  // this.$('.ui-button')[0].click();
  // assert.equal(this.get('value'), true, 'boolean true literal works');
});

test('on initialization, active button highlighted', function(assert) {
  this.set('values', ['bar']);
  this.render(hbs`
    {{ui-buttons
      buttons='Foo,Bar,Baz'
      values=values
      onChange=(mut values)
    }}
  `);

  assert.equal(this.$('.ui-button').length, 3, 'three buttons');
  assert.equal(this.$('.ui-button.active').length, 1, 'one active button');
  assert.ok(this.$(this.$('.ui-button')[1]).hasClass('active'), 'correct button selected');
  assert.equal(JSON.stringify(this.get('values')), JSON.stringify(['bar']), 'container\'s values prop is still correctly set');
});

test('on initialization, set three buttons active with cardinality limit of 2', function(assert) {
  const onError = (hash) => {
    if (hash.suggestedValues && hash.code === 'max-cardinality-not-met') {
      assert.ok(true, 'Error event was fired');
    }
  };
  const onChange = hash => {
    assert.equal('cardinality-suggestion', hash.code, 'Suggestion sent to onChange');
    this.set('values', hash.values);
  };
  this.set('values', ['foo', 'bar', 'baz']);
  this.set('actions.onError', onError);
  this.set('actions.onChange', onChange);

  this.render(hbs`{{ui-buttons
    buttons='Foo,Bar,Baz'
    cardinality='0:2'
    values=values
    onChange=(action 'onChange')
    onError=(action 'onError')
  }}`);

  assert.equal(this.$('.ui-button').length, 3, 'three buttons');
  assert.equal(this.$('.ui-button.active').length, 2, 'two active buttons, after onChange adjustment');
  assert.equal(JSON.stringify(this.get('values')), JSON.stringify(['foo', 'bar']), "the values set -- the first two -- are correctly set");
});
