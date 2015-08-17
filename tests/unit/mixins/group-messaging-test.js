import Ember from 'ember';
import GroupMessagingMixin from 'ui-button/mixins/group-messaging';
import { module, test } from 'qunit';

module('Unit | Mixin | group messaging');

// Replace this with your real tests.
test('it works', function(assert) {
  Ember.run(()=>{
    var GroupMessagingObject = Ember.Object.extend(GroupMessagingMixin);
    var subject = GroupMessagingObject.create();
    assert.ok(subject);
  });
});
