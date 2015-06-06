import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line
const camelize = Ember.String.camelize;

export default Ember.Mixin.create({
  /**
   * Receive a message from the containing group
   * @param  {string}   cmd   command to execute
   * @param  {mixed}    args  whatever params are needed for command
   * @return {boolean}
   */
  _groupMessage: function(cmd, ...args) {
    const command = this.buttonActions[camelize(cmd)];
    if (command) {
      return command(this, ...args);
    }

    return null;
  },
  _tellGroup: function(cmd, ...args) {
    const group = this.get('group');
    if(group) {
      this.group._itemMessage(cmd, this, ...args);
    } else {
      this.sendAction(cmd, ...args);
    }
  },

});
