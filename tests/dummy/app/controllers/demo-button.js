import Ember from 'ember';
const {get} = Ember;

export default Ember.Controller.extend({
  actions: {
    handleClick(hash) {
      this.get('flashMessages').success(`Recieved a click from ${get(hash, 'button.id')} with a value of "${hash.value}"`);
      console.log('onClick');
      console.log(hash);
    }
  }
});
