import Ember from 'ember';
const htmlSafe = Ember.String.htmlSafe;

export default Ember.Route.extend({
  actions: {
    onToggle(hash) {
      if(hash.code !== 'default-value') {
        console.log(hash);
        Ember.run.next(() => {
          this.get('flashMessages').success(htmlSafe(`The toggle button titled "${hash.title}" has toggled,<br/>and is now in a state of <b>${hash.value}</b>`));
        });
      }
      if(hash.name === 'ddauExplicit') {
        const controller = this.controllerFor('demo-toggle-button');
        controller.set('ddauExplicit', hash.value);
      }
    },
    onError(hash) {
      console.log(hash);
      Ember.run.next(() => {
        this.get('flashMessages').danger(hash.message);
      });
    }
  },

});
