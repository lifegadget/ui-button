import Ember from 'ember';
import ItemMessagingMixin from '../../../mixins/item-messaging';
import { module, test } from 'qunit';

module('Unit | Mixin | item messaging');

// Replace this with your real tests.
test('it works', function(assert) {
  var ItemMessagingObject = Ember.Object.extend(ItemMessagingMixin);
  var subject = ItemMessagingObject.create();
  assert.ok(subject);
});
