/* color */

$.Color = function() {
  if(arguments.length) this.parse(arguments);
}

$.Color.prototype = {
  parse: function(args) {
    if(typeof args[0] === "string") {
      var rgb = $.hexToRgb(args[0]);
      this[0] = rgb[0];
      this[1] = rgb[1];
      this[2] = rgb[2];
      this[3] = 255;
    } else {
      this[0] = args[0];
      this[1] = args[1];
      this[2] = args[2];
      this[3] = typeof args[3] === "undefined" ? 255 : args[3];
    }
  },

  toArray: function() {
    return [this[0], this[1], this[2], this[3]];
  },

  toRgb: function() {
    return "rgb(" + this[0] + ", " + this[1] + ", " + this[2] + ")";
  },

  toRgba: function() {
    return "rgb(" + this[0] + ", " + this[1] + ", " + this[2] + ", " + this[3] + ")";
  },

  toHex: function() {
    return $.rgbToHex(this[0], this[1], this[2]);
  },

  toHsl: function() {
    return $.rgbToHsl(this[0], this[1], this[2]);
  },

  toHsv: function() {
    return $.rgbToHsv(this[0], this[1], this[2]);
  }

};