import Ember from 'ember';
import SharedStyleMixin from 'ui-button/mixins/shared-style';
import { module, test } from 'qunit';

module('Unit | Mixin | shared style');

// Replace this with your real tests.
test('it works', function(assert) {
  var SharedStyleObject = Ember.Object.extend(SharedStyleMixin);
  var subject = SharedStyleObject.create();
  assert.ok(subject);
});
