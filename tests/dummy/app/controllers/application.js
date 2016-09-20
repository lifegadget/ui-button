import Ember from 'ember';

export default Ember.Controller.extend({

  isRepressed: false,
  toggledEnablement: false,
  isIndexPage: Ember.computed.equal('currentPath', 'index'),
  notIndexPage: Ember.computed.not('isIndexPage'),

  actions: {
    navChange: function(args) {
      const [context] = args;
      const {routeTo, linkTo} = context.getProperties('routeTo', 'linkTo');
      if(linkTo) {
        window.open(linkTo);
      }
      if (routeTo) {
        if (this.transitionToRoute) {

          this.transitionToRoute(routeTo);
        } else {
          Ember.debug('component needs to have transitionToRoute passed in');
        }
      }
    }
  }

});
