import Ember from 'ember';
const { computed, observer, $, A, run, on, typeOf, debug, keys, get, set, inject } = Ember;    // jshint ignore:line
const htmlSafe = Ember.String.htmlSafe;
const dasherize = Ember.String.dasherize;
const _styleProperties = ['maxWidth', 'width', 'minWidth','height'];

var SharedStyle = Ember.Mixin.create({
  attributeBindings: ['_style:style'],

  _propertyUnset: [], // properties to UNSET on a component so component can manage them instead of base class

  _style: computed(..._styleProperties, function() {
    const styles = this.getProperties(..._styleProperties);
    const sizer = size => {
      return Number(size) === size ? size + 'px' : size;
    };
    const stylist = style => {
      switch(style) {
        case 'font-size':
        case 'width':
        case 'height':
        case 'minWidth':
        case 'maxWidth':
          return sizer(style);
        default:
          return style;
      }
    };
    return htmlSafe(keys(styles).filter( key => {
      return styles[key];
    }).map( key => {
      return dasherize(key) + ': ' + stylist(get(this,key));
      return `${snakeCase}: ${styles[key]}`;
    }).join('; '));
  }),

  _propertyRemapping: on('init', function() {
    const props = new A(this.get('_propertyUnset'));
    props.forEach( prop => {
      A(this.get('attributeBindings')).removeObject(prop);
    });
  }),

});

SharedStyle[Ember.NAME_KEY] = 'Shared Style Manager';
export default SharedStyle;
