import Ember from 'ember';
const { keys, create } = Object; // jshint ignore:line
const {computed, observer, $, A, run, on, typeOf, debug, defineProperty, get, set, inject, isEmpty} = Ember;  // jshint ignore:line
const _styleProperties = ['maxWidth', 'width', 'minWidth','height','fontSize','fontFamily','fontWeight','fontStyle'];
const GOLDEN_RATIO = 1.618;
const ASPECT_RATIO = 1.3;

var SharedStyle = Ember.Mixin.create({
  concatenatedProperties: ['classNames', 'classNameBindings', '_propertyUnset'],

  _style: observer(..._styleProperties, function() {
    this._setStyle();
  }),
  _setStyle() {
    const styleProperties = this.getProperties(..._styleProperties);
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
          if(new A(['undefined','null']).contains(typeOf(value))) {
            return null;
          }
          return value;
      }
    };
    run.schedule('afterRender', ()=> {
      let style = this.get('element').style;
      keys(styleProperties).map(item => {
        style[item] = stylist(item,styleProperties[item]);
      });
    });
  },

});

SharedStyle[Ember.NAME_KEY] = 'Shared Style Manager';
export default SharedStyle;
