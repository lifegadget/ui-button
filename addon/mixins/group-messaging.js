import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject, run } = Ember;    // jshint ignore:line
const camelize = Ember.String.camelize;

export default Ember.Mixin.create({
  _registeredItems: new A([]),
  _registerItem: function(child) {
    console.log('registering %o with %o', child, this.get('elementId'), this.get('_registeredItems.length'));
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
    const command = this.buttonActions[camelize(cmd)];
    if (command) {
        return command(this,item,args);
    }

    return null;
  },
  /**
   * Send a specific command to a registered Item
   * @param  {string}    id     reference to the objects elementId property
   * @param  {string}    cmd    command/action for item to process
   * @param  {mixed}     args   any other arguments needed for command
   * @return {boolean}
   */
  _tellItem: function(id, cmd, ...args) {
    console.log('telling item [%s,%s]: %o', id, cmd, args);

    const item = this.get('_registeredItems').findBy('elementId', id);
    if(item) {
      item._groupMessage(cmd, args);
    }
  },
  /** Send a specific command to ALL registered Items */
  _tellItems: function(cmd, ...args) {
    const itemIds = new A(this.get('_registeredItems').map(item => {
      return item.get('elementId');
    }));
    itemIds.forEach(id => {
      this._tellItem(id, cmd, args);
    });
  },

});
