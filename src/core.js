var MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

window.requestAnimationFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };
})();

function hue2rgb(p, q, t) {
  if(t < 0) {
    t += 1;
  }

  if(t > 1) {
    t -= 1;
  }

  if(t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }

  if(t < 1 / 2) {
    return q;
  }

  if(t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }

  return p;
}

var $ = function(selector) {
  var canvas;

  if(arguments.length === 0) {
    canvas = $.createCanvas(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", function() {
      // canvas.width = window.innerWidth;
      // canvas.height = window.innerHeight;
    });
  } else if(typeof selector === "string") {
    canvas = document.querySelector(selector);
  } else if(typeof selector === "number") {
    canvas = $.createCanvas(arguments[0], arguments[1]);
  } else if(selector instanceof Image || selector instanceof HTMLImageElement) {
    canvas = $.createCanvas(selector);
  } else if(selector instanceof $.Wrapper) {
    return selector;
  } else {
    canvas = selector;
  }

  return new $.Wrapper(canvas);
};

$.extend = function() {
  for(var i = 1; i < arguments.length; i++) {
    if (arguments[i]) {
      for(var j in arguments[i]) {
        if (arguments[i][j]) {
          arguments[0][j] = arguments[i][j];
        }
      }
    }
  }

  return arguments[0];
};

$.augment = function() {
  for(var i = 1; i < arguments.length; i++) {
    _.extend(arguments[0], arguments[i]);
    arguments[i](arguments[0]);
  }
};

$.extend($, {

  keycodes: {
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    45: "insert",
    46: "delete",
    8: "backspace",
    9: "tab",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    19: "pause",
    20: "capslock",
    27: "escape",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    112: "f1",
    113: "f2",
    114: "f3",
    115: "f4",
    116: "f5",
    117: "f6",
    118: "f7",
    119: "f8",
    120: "f9",
    121: "f10",
    122: "f11",
    123: "f12",
    144: "numlock",
    145: "scrolllock",
    186: "semicolon",
    187: "equal",
    188: "comma",
    189: "dash",
    190: "period",
    191: "slash",
    192: "graveaccent",
    219: "openbracket",
    220: "backslash",
    221: "closebraket",
    222: "singlequote"
  },

  cleanArray: function(array, property) {

    var lastArgument = arguments[arguments.length - 1];
    var isLastArgumentFunction = typeof lastArgument === "function";

    for(var i = 0, len = array.length; i < len; i++) {
      if(array[i] === null || (property && array[i][property])) {
        if(isLastArgumentFunction) {
          lastArgument(array[i]);
        }
        array.splice(i--, 1);
        len--;
      }
    }
  },

  specialBlendFunctions: ["color", "value", "hue", "saturation"],

  blendFunctions: {
    normal: function(a, b) {
      return b;
    },

    overlay: function(a, b) {
      a /= 255;
      b /= 255;

      var result = (a < 0.5) ? (2 * a * b) : (1 - 2 * (1 - a) * (1 - b));

      return Math.min(255, Math.max(0, result * 255 | 0));
    },

    hardLight: function(a, b) {
      return $.blendFunctions.overlay(b, a);
    },

    softLight: function(a, b) {
      a /= 255;
      b /= 255;

      var v = (1 - 2 * b) * (a * a) + 2 * b * a;
      return $.limitValue(v * 255, 0, 255);
    },

    dodge: function(a, b) {
      return Math.min(256 * a / (255 - b + 1), 255);
    },

    burn: function(a, b) {
      return 255 - Math.min(256 * (255 - a) / (b + 1), 255);
    },

    multiply: function(a, b) {
      return b * a / 255;
    },

    divide: function(a, b) {
      return Math.min(256 * a / (b + 1), 255);
    },

    screen: function(a, b) {
      return 255 - (255 - b) * (255 - a) / 255;
    },

    grainExtract: function(a, b) {
      return $.limitValue(a - b + 128, 0, 255);
    },

    grainMerge: function(a, b) {
      return $.limitValue(a + b - 128, 0, 255);
    },

    difference: function(a, b) {
      return Math.abs(a - b);
    },

    addition: function(a, b) {
      return Math.min(a + b, 255);
    },

    substract: function(a, b) {
      return Math.max(a - b, 0);
    },

    darkenOnly: function(a, b) {
      return Math.min(a, b);
    },

    lightenOnly: function(a, b) {
      return Math.max(a, b);
    },

    color: function(a, b) {
      var aHSL = $.rgbToHsl(a);
      var bHSL = $.rgbToHsl(b);

      return $.hslToRgb(bHSL[0], bHSL[1], aHSL[2]);
    },

    hue: function(a, b) {
      var aHSV = $.rgbToHsv(a);
      var bHSV = $.rgbToHsv(b);

      return (!bHSV[1]) ? $.hsvToRgb(aHSV[0], aHSV[1], aHSV[2]) : $.hsvToRgb(bHSV[0], aHSV[1], aHSV[2]);
    },

    value: function(a, b) {
      var aHSV = $.rgbToHsv(a);
      var bHSV = $.rgbToHsv(b);

      return $.hsvToRgb(aHSV[0], aHSV[1], bHSV[2]);
    },

    saturation: function(a, b) {
      var aHSV = $.rgbToHsv(a);
      var bHSV = $.rgbToHsv(b);

      return $.hsvToRgb(aHSV[0], bHSV[1], aHSV[2]);
    }
  },

  blend: function(below, above, mode, mix) {
    if(typeof mix === "undefined") {
      mix = 1;
    }

    below = $(below);
    above = $(above);

    var belowCtx = below.context;
    var aboveCtx = above.context;

    var belowData = belowCtx.getImageData(0, 0, below.canvas.width, below.canvas.height);
    var aboveData = aboveCtx.getImageData(0, 0, above.canvas.width, above.canvas.height);

    var belowPixels = belowData.data;
    var abovePixels = aboveData.data;

    var imageData = this.createImageData(below.canvas.width, below.canvas.height);
    var pixels = imageData.data;

    var blendingFunction = $.blendFunctions[mode];

    var i,
        len = belowPixels.length;

    if($.specialBlendFunctions.indexOf(mode) !== -1) {
      for(i = 0; i < len; i += 4) {
        var rgb = blendingFunction([belowPixels[i + 0], belowPixels[i + 1], belowPixels[i + 2]], [abovePixels[i + 0], abovePixels[i + 1], abovePixels[i + 2]]);

        pixels[i + 0] = belowPixels[i + 0] + (rgb[0] - belowPixels[i + 0]) * mix;
        pixels[i + 1] = belowPixels[i + 1] + (rgb[1] - belowPixels[i + 1]) * mix;
        pixels[i + 2] = belowPixels[i + 2] + (rgb[2] - belowPixels[i + 2]) * mix;

        pixels[i + 3] = belowPixels[i + 3];
      }
    } else {
      for(i = 0; i < len; i += 4) {
        var r = blendingFunction(belowPixels[i + 0], abovePixels[i + 0]);
        var g = blendingFunction(belowPixels[i + 1], abovePixels[i + 1]);
        var b = blendingFunction(belowPixels[i + 2], abovePixels[i + 2]);

        pixels[i + 0] = belowPixels[i + 0] + (r - belowPixels[i + 0]) * mix;
        pixels[i + 1] = belowPixels[i + 1] + (g - belowPixels[i + 1]) * mix;
        pixels[i + 2] = belowPixels[i + 2] + (b - belowPixels[i + 2]) * mix;

        pixels[i + 3] = belowPixels[i + 3];
      }
    }

    below.context.putImageData(imageData, 0, 0);

    return below;
  },

  wrapValue: function(value, min, max) {
    var d = Math.abs(max - min);
    return min + (value - min) % d;
  },

  limitValue: function(value, min, max) {
    return value < min ? min : value > max ? max : value;
  },

  mix: function(a, b, ammount) {
    return a + (b - a) * ammount;
  },

  hexToRgb: function(hex) {
    return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
  },

  rgbToHex: function(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7);
  },

  /* author: http://mjijackson.com/ */

  rgbToHsl: function(r, g, b) {

    if(r instanceof Array) {
      b = r[2];
      g = r[1];
      r = r[0];
    }

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max === min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      }
      h /= 6;
    }

    return [h, s, l];
  },

  /* author: http://mjijackson.com/ */

  hslToRgb: function(h, s, l) {
    var r, g, b;

    if(s === 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255 | 0, g * 255 | 0, b * 255 | 0];
  },

  rgbToHsv: function(r, g, b) {
    if(r instanceof Array) {
      b = r[2];
      g = r[1];
      r = r[0];
    }

    r = r / 255, g = g / 255, b = b / 255;
    var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max === 0 ? 0 : d / max;

    if(max === min) {
      h = 0; // achromatic
    } else {
      switch(max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      }
      h /= 6;
    }

    return [h, s, v];
  },

  hsvToRgb: function(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6) {
    case 0:
      r = v, g = t, b = p;
      break;
    case 1:
      r = q, g = v, b = p;
      break;
    case 2:
      r = p, g = v, b = t;
      break;
    case 3:
      r = p, g = q, b = v;
      break;
    case 4:
      r = t, g = p, b = v;
      break;
    case 5:
      r = v, g = p, b = q;
      break;
    }

    return [r * 255, g * 255, b * 255];
  },

  color: function() {
    var result = new $.Color();
    result.parse(arguments);
    return result;
  },

  createCanvas: function(width, height) {
    var result = document.createElement("canvas");

    if(arguments[0] instanceof Image || arguments[0] instanceof HTMLImageElement) {
      var image = arguments[0];
      result.width = image.width;
      result.height = image.height;
      result.getContext("2d").drawImage(image, 0, 0);
    } else {
      result.width = width;
      result.height = height;
    }

    return result;
  },

  createImageData: function(width, height) {
    return document.createElement("Canvas").getContext("2d").createImageData(width, height);
  },


  /* https://gist.github.com/3781251 */

  mousePosition: function(event) {
    var totalOffsetX = 0,
      totalOffsetY = 0,
      coordX = 0,
      coordY = 0,
      currentElement = event.target || event.srcElement,
      mouseX = 0,
      mouseY = 0;

    // Traversing the parents to get the total offset
    do {
      totalOffsetX += currentElement.offsetLeft;
      totalOffsetY += currentElement.offsetTop;
    }
    while ((currentElement = currentElement.offsetParent));
    // Set the event to first touch if using touch-input
    if(event.changedTouches && event.changedTouches[0] !== undefined) {
      event = event.changedTouches[0];
    }
    // Use pageX to get the mouse coordinates
    if(event.pageX || event.pageY) {
      mouseX = event.pageX;
      mouseY = event.pageY;
    }
    // IE8 and below doesn't support event.pageX
    else if(event.clientX || event.clientY) {
      mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    // Subtract the offset from the mouse coordinates
    coordX = mouseX - totalOffsetX;
    coordY = mouseY - totalOffsetY;

    return {
      x: coordX,
      y: coordY
    };
  }
});