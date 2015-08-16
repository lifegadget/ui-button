import Ember from 'ember';
const { keys } = Object;
const {observer, A, run, typeOf} = Ember;
const _styleProperties = ['maxWidth', 'width', 'minWidth','height','fontSize','fontFamily','fontWeight','fontStyle'];
const GOLDEN_RATIO = 1.618;
const ASPECT_RATIO = 1.3;

var AddonStylist = Ember.Mixin.create({
  _style: observer(..._styleProperties, function() {
    this._setStyle();
  }),
  _setStyle() {
    const styleProperties = this.getProperties(..._styleProperties);
    const sizer = size => {
      return Number(size) === size ? size + 'px' : size;
    };
    /**
     * Provides a per-type styler that allows for some sensible defaults
     * @param  {string} style The style property being evaluated
     * @param  {string} value The suggested value for this style property
     * @return {string}       A mildly processed/improved variant on the input
     */
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
    /**
     * Ensures that the value has been escaped before allowing through to the DOM
     * @param  {mixed}  input API or addon provided value
     * @return {string}       HTML escaped string
     */
    const securitize = input => {
      if(typeOf(input) === 'object') {
        input = input.toString();
      }
      return Ember.Handlebars.Utils.escapeExpression(input);
    };
    run.schedule('afterRender', ()=> {
      let style = this.get('element').style;
      keys(styleProperties).map(item => {
        style[item] = securitize(stylist(item,styleProperties[item]));
      });
    });
  },

});

AddonStylist[Ember.NAME_KEY] = 'Addon Stylist';
export default AddonStylist;
