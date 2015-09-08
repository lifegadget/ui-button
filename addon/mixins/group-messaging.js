import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, get, set, inject } = Ember;    // jshint ignore:line
const camelize = Ember.String.camelize;

export default Ember.Mixin.create({
  _registeredItems: computed(function() {
    return new A([]);
  }),
  _registerItem: function(child) {
    // console.log('registering %o with %o', child, this.get('elementId'), this.get('_registeredItems.length'));
    const _registeredItems = this.get('_registeredItems');
    _registeredItems.pushObject(child);
  },
  /**
   * Receive message from a registered Item
   * @param  {string} cmd    a command name for the message
   * @param  {object} item   a reference to the item
   * @param  {array} ..args  any remaining arguments needed
   * @return {void}
   */
  _itemMessage: function(cmd, item, ...args) {
    // console.log('received %s command from: %o', cmd, item);
    const command = this.buttonActions[camelize(cmd)];
    if (command) {
      return command(this,item,args);
    }

    return null;
  },
  /**
   * Send a specific command to a registered Item
   * @param  {string}    id     reference to the objects value property
   * @param  {string}    cmd    command/action for item to process
   * @param  {mixed}     args   any other arguments needed for command
   * @return {boolean}
   */
  _tellItem: function(id, cmd, ...args) {
    const item = this.get('_registeredItems').findBy('value', id);
    if(item) {
      item._groupMessage(cmd, ...args);
    }
  },
  /** Send a specific command to ALL registered Items */
  _tellItems: function(cmd, ...args) {
    const items = this.get('_registeredItems');
    if(!items) {
      debug(`Received "${cmd}" to communicate to registered items but there are NOT any currently registered!`);
    }
    else {
      items.forEach(item => {
        item._groupMessage(cmd, ...args);
      });
    }
  },

});
