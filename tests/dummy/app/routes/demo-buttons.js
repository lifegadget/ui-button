import Ember from 'ember';
const camelize = thingy => {
  return thingy ? Ember.String.camelize(thingy) : thingy;
};
const htmlSafe = Ember.String.htmlSafe;

export default Ember.Route.extend({
  setupController(controller, post) {
    this._super(controller, post);
    controller.set('basicSetter', ['bar']);
    controller.set('explicitSetter', ['monkey']);
    controller.set('cardinalityMin', []);
  },
  actions: {
    onChange(hash) {
      console.log('changed: ', hash);
      if(hash.context.name) {
        const controller = this.controllerFor('demo-buttons');
        controller.set(camelize(hash.context.name), hash.values);
      }
      Ember.run.next(() => {
        this.get('flashMessages').success(htmlSafe(`The "${hash.name}" component has changed. The code was <b>${hash.code}</b>. New value is: <b>${hash.values}</b>`));
      });
    },
    onError(hash) {
      console.log('error: ', hash);
      Ember.run.next(() => {
        if(hash.code === 'min-cardinality-not-met') {
          this.get('flashMessages').info(htmlSafe(`The "${hash.context.name}" component didn't meet <b>cardinality requirements</b>, taking advice on recommended additions`));
          const controller = this.controllerFor('demo-buttons');
          console.log('setting: ', hash.context.name, hash.suggestedValues);
          controller.set(camelize(hash.context.name), hash.suggestedValues);
        } else {
          this.get('flashMessages').danger(htmlSafe(`The "${hash.context.name}" component has experienced an error: <b>${hash.code}</b>:<br><p>${hash.message}</p>`));
        }
      });
    }
  }
});
