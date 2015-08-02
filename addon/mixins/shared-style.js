import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line
const htmlSafe = Ember.String.htmlSafe;
const dasherize = Ember.String.dasherize;
const _styleProperties = ['maxWidth', 'width', 'minWidth','height','fontSize','fontFamily','fontWeight','fontStyle'];
const GOLDEN_RATIO = 1.618;
const ASPECT_RATIO = 1.3;

var SharedStyle = Ember.Mixin.create({
  attributeBindings: ['_style:style'],
  concatenatedProperties: ['classNames', 'classNameBindings', 'attributeBindings','_propertyUnset'],

  _propertyUnset: _styleProperties, // properties to UNSET on a component so component can manage them instead of base class

  _style: computed(..._styleProperties, function() {
    const styles = this.getProperties(..._styleProperties);
    const sizer = size => {
      return Number(size) === size ? size + 'px' : size;
    };

    const stylist = (style, value) => {
      switch(style) {
        case 'fontSize':
        case 'width':
        case 'minWidth':
        case 'maxWidth':
          return sizer(value);
        case 'height':
          let width = this.get('width');
          console.log('getting height where width is %o', width);
          if(!width || String(width).substr(-2) !== 'px') {
            return sizer(value);
          }
          width = width.substr(0,width.length - 2);
          if(value === 'golden') {
             return width / GOLDEN_RATIO + 'px';
          } else if (value === 'square' && this.get('width')) {
            return width / ASPECT_RATIO + 'px';
          } else {
            return sizer(value);
          }
          return value;
        default:
          return value;
      }
    };
    return htmlSafe(keys(styles).filter( key => {
      return styles[key];
    }).map( key => {
      return dasherize(key) + ': ' + stylist(key, get(this,key));
    }).join('; '));
  }),

  _propertyRemapping: on('init', function() {
    const props = new A(this.get('_propertyUnset'));
    props.forEach( prop => {
      new A(this.get('attributeBindings')).removeObject(prop);
    });
  }),

});

SharedStyle[Ember.NAME_KEY] = 'Shared Style Manager';
export default SharedStyle;
