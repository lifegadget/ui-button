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
    // console.log('recieved message %s from %o', cmd, args);
    if (command) {
      return command(this, ...args);
    }

    return null;
  },
  /**
   * Send the group component a message
   * @param  {string}    cmd  the command that is being communicated
   * @param  {array} args the arguments passed to the group
   * @return {boolean}         a boolean value that is optionally sent back, could also be null if the given command doesn't merit a boolean flag
   */
  _tellGroup: function(cmd, ...args) {
    // console.log('sending %s command to group: %o', cmd, args);
    const group = this.get('group');
    if(group) {
      this.group._itemMessage(cmd, this, ...args);
    } else {
      this.sendAction(cmd, ...args);
    }
  },

});
