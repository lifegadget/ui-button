import Ember from 'ember';

export default Ember.Controller.extend({

  isDisabled: false,
  howMany: null,
  canBeEmpty: [
    { title: 'Yes', value: true },
    { title: 'No', value: false }
  ],
  sizes: [
    { title: 'Tiny', value: 'tiny' },
    { title: 'Small', value: 'small' },
    { title: 'Default', value: null },
    { title: 'Large', value: 'large' },
    { title: 'Huge', value: 'huge' }
  ]
});
