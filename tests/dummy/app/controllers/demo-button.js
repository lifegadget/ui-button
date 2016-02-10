import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    onClick(hash) {
      this.get('flashMessages').success(`Recieved a click from ${hash.button.elementId} with a value of "${hash.value}"`);
      console.log('onClick');
      console.log(hash);
    }
  }
});
