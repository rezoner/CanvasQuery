$.Wrapper = function(canvas) {
  this.context = canvas.getContext("2d");
  this.canvas = canvas;
}

$.Wrapper.prototype = {
  appendTo: function(selector) {
    var element;

    if(typeof selector === "object") {
      element = selector;
    } else {
      element = document.querySelector(selector);
    }

    element.appendChild(this.canvas);

    return this;
  },

  blendOn: function(what, mode, mix) {
    $.blend(what, this, mode, mix);

    return this;
  },

  blend: function(what, mode, mix) {
    if(typeof what === "string") {
      var color = what;
      what = $($.createCanvas(this.canvas.width, this.canvas.height));
      what.fillStyle(color).fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    $.blend(this, what, mode, mix);

    return this;
  },

  circle: function(x, y, r) {
    this.context.arc(x, y, r, 0, Math.PI * 2);
    return this;
  },

  crop: function(x, y, w, h) {

    var canvas = $.createCanvas(w, h);
    var context = canvas.getContext("2d");

    context.drawImage(this.canvas, x, y, w, h, 0, 0, w, h);
    this.canvas.width = w;
    this.canvas.height = h;
    this.clear();
    this.context.drawImage(canvas, 0, 0);

    return this;
  },

  set: function(properties) {
    $.extend(this.context, properties);
  },

  resize: function(width, height) {
    var w = width,
      h = height;
    if(height === null) {
      if(this.canvas.width > width) {
        h = this.canvas.height * (width / this.canvas.width) | 0;
        w = width;
      } else {
        w = this.canvas.width;
        h = this.canvas.height;
      }
    } else if(width === null) {
      if(this.canvas.width > width) {
        w = this.canvas.width * (height / this.canvas.height) | 0;
        h = height;
      } else {
        w = this.canvas.width;
        h = this.canvas.height;
      }
    }

    var $resized = $(w, h).drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, w, h);
    this.canvas = $resized.canvas;
    this.context = $resized.context;

    return this;
  },


  trim: function(color, changes) {
    var transparent;

    if(color) {
      color = $.color(color).toArray();
      transparent = !color[3];
    } else {
      transparent = true;
    }

    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;

    var bound = [this.canvas.width, this.canvas.height, 0, 0];

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      if(transparent) {
        if(!sourcePixels[i + 3]) {
          continue;
        }
      } else if(sourcePixels[i + 0] === color[0] && sourcePixels[i + 1] === color[1] && sourcePixels[i + 2] === color[2]) {
        continue;
      }

      var x = (i / 4 | 0) % this.canvas.width | 0;
      var y = (i / 4 | 0) / this.canvas.width | 0;

      if(x < bound[0]) {
        bound[0] = x;
      }

      if(x > bound[2]) {
        bound[2] = x;
      }

      if(y < bound[1]) {
        bound[1] = y;
      }

      if(y > bound[3]) {
        bound[3] = y;
      }
    }

    if(!(bound[2] === 0 || bound[3] === 0)) {
      if(changes) {
        changes.left = bound[0];
        changes.top = bound[1];
        changes.width = bound[2] - bound[0];
        changes.height = bound[3] - bound[1];
      }
      
      this.crop(bound[0], bound[1], bound[2] - bound[0] + 1, bound[3] - bound[1] + 1);
    }

    return this;
  },

  resizePixel: function(pixelSize) {

    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;
    var canvas = document.createElement("canvas");
    var context = canvas.context = canvas.getContext("2d");

    canvas.width = this.canvas.width * pixelSize | 0;
    canvas.height = this.canvas.height * pixelSize | 0;

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      if(!sourcePixels[i + 3]) {
        continue;
      }

      context.fillStyle = $.rgbToHex(sourcePixels[i + 0], sourcePixels[i + 1], sourcePixels[i + 2]);

      var x = (i / 4) % this.canvas.width;
      var y = (i / 4) / this.canvas.width | 0;

      context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }

    this.canvas.width = canvas.width;
    this.canvas.height = canvas.height;
    this.clear().drawImage(canvas, 0, 0);

    return this;

    /* this very clever method is working only under Chrome *

    var x = 0,
        y = 0;

    var canvas = document.createElement("canvas");
    var context = canvas.context = canvas.getContext("2d");

    canvas.width = this.canvas.width * pixelSize | 0;
    canvas.height = this.canvas.height * pixelSize | 0;

    while(x < this.canvas.width) {
      y = 0;

      while(y < this.canvas.height) {
        context.drawImage(this.canvas, x, y, 1, 1, x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        y++;
      }

      x++;
    }

    this.canvas = canvas;
    this.context = context;

    return this;

    */
  },


  matchPalette: function(palette) {
    var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var rgbPalette = [];

    var i, j

    for(i = 0; i < palette.length; i++) {
      rgbPalette.push($.color(palette[i]));
    }


    for(i = 0; i < imgData.data.length; i += 4) {
      var difList = [];

      for(j = 0; j < rgbPalette.length; j++) {
        var rgbVal = rgbPalette[j];
        var rDif = Math.abs(imgData.data[i] - rgbVal[0]),
          gDif = Math.abs(imgData.data[i + 1] - rgbVal[1]),
          bDif = Math.abs(imgData.data[i + 2] - rgbVal[2]);
        difList.push(rDif + gDif + bDif);
      }

      var closestMatch = 0;

      for(j = 0; j < palette.length; j++) {
        if(difList[j] < difList[closestMatch]) {
          closestMatch = j;
        }
      }

      var paletteRgb = cq.hexToRgb(palette[closestMatch]);
      imgData.data[i] = paletteRgb[0];
      imgData.data[i + 1] = paletteRgb[1];
      imgData.data[i + 2] = paletteRgb[2];
    }

    this.context.putImageData(imgData, 0, 0);

    return this;
  },

  getPalette: function() {
    var palette = [];
    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      if(sourcePixels[i + 3]) {
        var hex = $.rgbToHex(sourcePixels[i + 0], sourcePixels[i + 1], sourcePixels[i + 2]);
        if(palette.indexOf(hex) === -1) {
          palette.push(hex);
        }
      }
    }

    return palette;
  },

  pixelize: function(size) {
    if(!size) {
      return this;
    }

    size = size || 4;

    var mozImageSmoothingEnabled = this.context.mozImageSmoothingEnabled;
    var webkitImageSmoothingEnabled = this.context.webkitImageSmoothingEnabled;

    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;

    var scale = (this.canvas.width / size) / this.canvas.width;

    var temp = cq(this.canvas.width, this.canvas.height);

    temp.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width * scale | 0, this.canvas.height * scale | 0);
    this.clear().drawImage(temp.canvas, 0, 0, this.canvas.width * scale | 0, this.canvas.height * scale | 0, 0, 0, this.canvas.width, this.canvas.height);

    this.context.mozImageSmoothingEnabled = mozImageSmoothingEnabled;
    this.context.webkitImageSmoothingEnabled = webkitImageSmoothingEnabled;

    return this;
  },

  colorToMask: function(color, inverted) {
    color = $.color(color).toArray();
    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;

    var mask = [];

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      if(sourcePixels[i + 0] == color[0] && sourcePixels[i + 1] == color[1] && sourcePixels[i + 2] == color[2]) {
        mask.push(inverted || false);
      } else {
        mask.push(!inverted);
      }
    }

    return mask;
  },

  grayscaleToMask: function(color) {
    color = $.color(color).toArray();
    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;

    var mask = [];

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      mask.push((sourcePixels[i + 0] + sourcePixels[i + 1] + sourcePixels[i + 2]) / 3 | 0);
    }

    return mask;
  },

  grayscaleToAlpha: function() {
    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;

    var mask = [];

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      sourcePixels[i + 3] = (sourcePixels[i + 0] + sourcePixels[i + 1] + sourcePixels[i + 2]) / 3 | 0;

      sourcePixels[i + 0] = sourcePixels[i + 1] = sourcePixels[i + 2] = 255;
    }

    this.context.putImageData(sourceData, 0, 0);

    return this;
  },

  applyMask: function(mask) {
    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;

    var mode = typeof mask[0] === "boolean" ? "bool" : "byte";

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      var value = mask[i / 4];

      if(mode === "bool") sourcePixels[i + 3] = 255 * value | 0;
      else {
        sourcePixels[i + 3] = value | 0;
      }
    }


    this.context.putImageData(sourceData, 0, 0);
    return this;
  },

  fillMask: function(mask) {

    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var sourcePixels = sourceData.data;

    var maskType = typeof mask[0] === "boolean" ? "bool" : "byte";
    var colorMode = arguments.length === 2 ? "normal" : "gradient";

    var color = $.color(arguments[1]);
    if(colorMode === "gradient") colorB = $.color(arguments[2]);

    for(var i = 0, len = sourcePixels.length; i < len; i += 4) {
      var value = mask[i / 4];

      if(maskType === "byte") value /= 255;

      if(colorMode === "normal") {
        if(value) {
          sourcePixels[i + 0] = color[0] | 0;
          sourcePixels[i + 1] = color[1] | 0;
          sourcePixels[i + 2] = color[2] | 0;
          sourcePixels[i + 3] = value * 255 | 0;
        }
      } else {
        sourcePixels[i + 0] = color[0] + (colorB[0] - color[0]) * value | 0;
        sourcePixels[i + 1] = color[1] + (colorB[1] - color[1]) * value | 0;
        sourcePixels[i + 2] = color[2] + (colorB[2] - color[2]) * value | 0;
        sourcePixels[i + 3] = 255;
      }
    }

    this.context.putImageData(sourceData, 0, 0);
    return this;
  },

  clear: function(color) {
    if(color) {
      this.context.fillStyle = color;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    return this;
  },

  clone: function() {
    var result = $.createCanvas(this.canvas.width, this.canvas.height);
    result.getContext("2d").drawImage(this.canvas, 0, 0);
    return $(result);
  },

  fillStyle: function(fillStyle) {
    this.context.fillStyle = fillStyle;
    return this;
  },

  strokeStyle: function(strokeStyle) {
    this.context.strokeStyle = strokeStyle;
    return this;
  },

  gradientText: function(text, x, y, maxWidth, gradient) {

    var words = text.split(" ");

    var h = this.font().match(/\d+/g)[0] * 2;

    var ox = 0;
    var oy = 0;

    if(maxWidth) {
      var line = 0;
      var lines = [""];

      for(var i = 0; i < words.length; i++) {
        var word = words[i] + " ";
        var wordWidth = this.context.measureText(word).width;

        if(ox + wordWidth > maxWidth) {
          lines[++line] = "";
          ox = 0;
        }

        lines[line] += word;

        ox += wordWidth;
      }
    } else var lines = [text];

    for(var i = 0; i < lines.length; i++) {
      var oy = y + i * h * 0.6 | 0;
      var lingrad = this.context.createLinearGradient(0, oy, 0, oy + h * 0.6 | 0);

      for(var j = 0; j < gradient.length; j += 2) {
        lingrad.addColorStop(gradient[j], gradient[j + 1]);
      }

      var text = lines[i];

      this.fillStyle(lingrad).fillText(text, x, oy);
    }

    return this;
  },

  setHsl: function() {

    if(arguments.length === 1) {
      var args = arguments[0];
    } else {
      var args = arguments;
    }

    var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var pixels = data.data;
    var r, g, b, a, h, s, l, hsl = [],
      newPixel = [];

    for(var i = 0, len = pixels.length; i < len; i += 4) {
      hsl = $.rgbToHsl(pixels[i + 0], pixels[i + 1], pixels[i + 2]);

      h = args[0] === null ? hsl[0] : $.limitValue(args[0], 0, 1);
      s = args[1] === null ? hsl[1] : $.limitValue(args[1], 0, 1);
      l = args[2] === null ? hsl[2] : $.limitValue(args[2], 0, 1);

      newPixel = $.hslToRgb(h, s, l);

      pixels[i + 0] = newPixel[0];
      pixels[i + 1] = newPixel[1];
      pixels[i + 2] = newPixel[2];
    }

    this.context.putImageData(data, 0, 0);

    return this;
  },

  shiftHsl: function() {

    if(arguments.length === 1) {
      var args = arguments[0];
    } else {
      var args = arguments;
    }

    var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var pixels = data.data;
    var r, g, b, a, h, s, l, hsl = [],
      newPixel = [];

    for(var i = 0, len = pixels.length; i < len; i += 4) {
      hsl = $.rgbToHsl(pixels[i + 0], pixels[i + 1], pixels[i + 2]);

      h = args[0] === null ? hsl[0] : $.wrapValue(hsl[0] + args[0], 0, 1);
      s = args[1] === null ? hsl[1] : $.limitValue(hsl[1] + args[1], 0, 1);
      l = args[2] === null ? hsl[2] : $.limitValue(hsl[2] + args[2], 0, 1);

      newPixel = $.hslToRgb(h, s, l);

      pixels[i + 0] = newPixel[0];
      pixels[i + 1] = newPixel[1];
      pixels[i + 2] = newPixel[2];
    }


    this.context.putImageData(data, 0, 0);

    return this;
  },

  replaceHue: function(src, dst) {

    var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var pixels = data.data;
    var r, g, b, a, h, s, l, hsl = [],
      newPixel = [];

    for(var i = 0, len = pixels.length; i < len; i += 4) {
      hsl = $.rgbToHsl(pixels[i + 0], pixels[i + 1], pixels[i + 2]);

      if(Math.abs(hsl[0] - src) < 0.05) h = $.wrapValue(dst, 0, 1);
      else h = hsl[0];

      newPixel = $.hslToRgb(h, hsl[1], hsl[2]);

      pixels[i + 0] = newPixel[0];
      pixels[i + 1] = newPixel[1];
      pixels[i + 2] = newPixel[2];
    }

    this.context.putImageData(data, 0, 0);

    return this;
  },

  invert: function(src, dst) {

    var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var pixels = data.data;
    var r, g, b, a, h, s, l, hsl = [],
      newPixel = [];

    for(var i = 0, len = pixels.length; i < len; i += 4) {
      pixels[i + 0] = 255 - pixels[i + 0];
      pixels[i + 1] = 255 - pixels[i + 1];
      pixels[i + 2] = 255 - pixels[i + 2];
    }

    this.context.putImageData(data, 0, 0);

    return this;
  },

  roundRect: function(x, y, width, height, radius) {

    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();

    return this;
  },

  wrappedText: function(text, x, y, maxWidth, newlineCallback) {

    var words = text.split(" ");

    var h = this.font().match(/\d+/g)[0] * 2;

    var ox = 0;
    var oy = 0;

    if(maxWidth) {
      var line = 0;
      var lines = [""];

      for(var i = 0; i < words.length; i++) {
        var word = words[i] + " ";
        var wordWidth = this.context.measureText(word).width;

        if(ox + wordWidth > maxWidth) {            
          lines[++line] = "";
          ox = 0;            
        }

        lines[line] += word;

        ox += wordWidth;
      }
    } else {
      var lines = [text];
    }

    for(var i = 0; i < lines.length; i++) {
      var oy = y + i * h * 0.6 | 0;

      var text = lines[i];

      if(newlineCallback) newlineCallback.call(this, x, y + oy);

      this.fillText(text, x, oy);
    }

    return this;
  },

  textBoundaries: function(text, maxWidth) {
    var words = text.split(" ");

    var h = this.font().match(/\d+/g)[0] * 2;

    var ox = 0;
    var oy = 0;

    if(maxWidth) {
      var line = 0;
      var lines = [""];

      for(var i = 0; i < words.length; i++) {
        var word = words[i] + " ";
        var wordWidth = this.context.measureText(word).width;

        if(ox + wordWidth > maxWidth) {
          lines[++line] = "";
          ox = 0;
        }

        lines[line] += word;

        ox += wordWidth;
      }
    } else {
      var lines = [text];
      maxWidth = this.measureText(text).width;
    }

    return {
      height: lines.length * h * 0.6 | 0,
      width: maxWidth
    }
  },

  paperBag: function(x, y, width, height, blowX, blowY) {
    var lx, ly;
    this.beginPath();
    this.moveTo(x, y);
    this.quadraticCurveTo(x + width / 2 | 0, y + height * blowY | 0, x + width, y);
    this.quadraticCurveTo(x + width - width * blowX | 0, y + height / 2 | 0, x + width, y + height);
    this.quadraticCurveTo(x + width / 2 | 0, y + height - height * blowY | 0, x, y + height);
    this.quadraticCurveTo(x + width * blowX | 0, y + height / 2 | 0, x, y);
  },

  borderImage: function(image, x, y, w, h, t, r, b, l, fill) {

    /* top */
    this.drawImage(image, l, 0, image.width - l - r, t, x + l, y, w - l - r, t);

    /* bottom */
    this.drawImage(image, l, image.height - b, image.width - l - r, b, x + l, y + h - b, w - l - r, b);

    /* left */
    this.drawImage(image, 0, t, l, image.height - b - t, x, y + t, l, h - b - t);

    /* right */
    this.drawImage(image, image.width - r, t, r, image.height - b - t, x + w - r, y + t, r, h - b - t);

    /* top-left */
    this.drawImage(image, 0, 0, l, t, x, y, l, t);

    /* top-right */
    this.drawImage(image, image.width - r, 0, r, t, x + w - r, y, r, t);

    /* bottom-right */
    this.drawImage(image, image.width - r, image.height - b, r, b, x + w - r, y + h - b, r, b);

    /* bottom-left */
    this.drawImage(image, 0, image.height - b, l, b, x, y + h - b, l, b);

    if(fill) {
      if(typeof fill === "string") {
        this.fillStyle(fill).fillRect(x + l, y + t, w - l - r, h - t - b);
      } else {
        this.drawImage(image, l, t, image.width - r - l, image.height - b - t, x + l, y + t, w - l - r, h - t - b);
      }
    }
  },

  /* www.html5rocks.com/en/tutorials/canvas/imagefilters/ */

  convolve: function(matrix, mix, divide) {

    if(typeof divide === "undefined") divide = 1;
    if(typeof mix === "undefined") mix = 1;

    var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var matrixSize = Math.sqrt(matrix.length) + 0.5 | 0;
    var halfMatrixSize = matrixSize / 2 | 0;
    var src = sourceData.data;
    var sw = sourceData.width;
    var sh = sourceData.height;
    var w = sw;
    var h = sh;
    var output = $.createImageData(this.canvas.width, this.canvas.height);
    var dst = output.data;

    for(var y = 1; y < h - 1; y++) {
      for(var x = 1; x < w - 1; x++) {

        var dstOff = (y * w + x) * 4;
        var r = 0,
          g = 0,
          b = 0,
          a = 0;
        for(var cy = 0; cy < matrixSize; cy++) {
          for(var cx = 0; cx < matrixSize; cx++) {
            var scy = y + cy - halfMatrixSize;
            var scx = x + cx - halfMatrixSize;
            if(scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy * sw + scx) * 4;
              var wt = matrix[cy * matrixSize + cx] / divide;
              r += src[srcOff + 0] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
              a += src[srcOff + 3] * wt;
            }
          }
        }
        dst[dstOff + 0] = $.mix(src[dstOff + 0], r, mix);
        dst[dstOff + 1] = $.mix(src[dstOff + 1], g, mix);
        dst[dstOff + 2] = $.mix(src[dstOff + 2], b, mix);
        dst[dstOff + 3] = src[dstOff + 3];
      }
    }

    this.context.putImageData(output, 0, 0);

    return this;
  },

  blur: function(mix) {
    return this.convolve([1, 1, 1, 1, 1, 1, 1, 1, 1], mix, 9);
  },

  gaussianBlur: function(mix) {
    return this.convolve([0.00000067, 0.00002292, 0.00019117, 0.00038771, 0.00019117, 0.00002292, 0.00000067, 0.00002292, 0.00078633, 0.00655965, 0.01330373, 0.00655965, 0.00078633, 0.00002292, 0.00019117, 0.00655965, 0.05472157, 0.11098164, 0.05472157, 0.00655965, 0.00019117, 0.00038771, 0.01330373, 0.11098164, 0.22508352, 0.11098164, 0.01330373, 0.00038771, 0.00019117, 0.00655965, 0.05472157, 0.11098164, 0.05472157, 0.00655965, 0.00019117, 0.00002292, 0.00078633, 0.00655965, 0.01330373, 0.00655965, 0.00078633, 0.00002292, 0.00000067, 0.00002292, 0.00019117, 0.00038771, 0.00019117, 0.00002292, 0.00000067], mix, 1);
  },

  sharpen: function(mix) {
    return this.convolve([0, -1, 0, -1, 5, -1, 0, -1, 0], mix);
  },

  threshold: function(threshold) {
    var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var pixels = data.data;
    var r, g, b;

    for(var i = 0; i < pixels.length; i += 4) {
      r = pixels[i];
      g = pixels[i + 1];
      b = pixels[i + 2];
      v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;

      pixels[i] = pixels[i + 1] = pixels[i + 2] = v
    }

    this.context.putImageData(data, 0, 0);

    return this;
  },

  sepia: function() {
    var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var pixels = data.data;
    var r, g, b;

    for(var i = 0; i < pixels.length; i += 4) {
      pixels[i + 0] = $.limitValue((pixels[i + 0] * 0.393) + (pixels[i + 1] * 0.769) + (pixels[i + 2] * 0.189), 0, 255);
      pixels[i + 1] = $.limitValue((pixels[i + 0] * 0.349) + (pixels[i + 1] * 0.686) + (pixels[i + 2] * 0.168), 0, 255);
      pixels[i + 2] = $.limitValue((pixels[i + 0] * 0.272) + (pixels[i + 1] * 0.534) + (pixels[i + 2] * 0.131), 0, 255);
    }

    this.context.putImageData(data, 0, 0);

    return this;
  },

  measureText: function() {
    return this.context.measureText.apply(this.context, arguments);
  },

  createRadialGradient: function() {
    return this.context.createRadialGradient.apply(this.context, arguments);
  },

  createLinearGradient: function() {
    return this.context.createLinearGradient.apply(this.context, arguments);
  },

  getImageData: function() {
    return this.context.getImageData.apply(this.context, arguments);
  },    

  /* framework */

  framework: function(args, context) {
    if(context) {
      this.tempContext = context === true ? args : context;
    }

    for(var name in args) {
      if(this[name]) this[name](args[name], undefined, undefined);
    }

    this.tempContext = null;

    return this;
  },

  onStep: function(callback, interval) {
    var self = this.tempContext || this;
    var lastTick = Date.now();

    this.timer = setInterval(function() {
      var delta = Date.now() - lastTick;
      lastTick = Date.now();
      callback.call(self, delta, lastTick);
    }, interval);

    return this;
  },

  onRender: function(callback) {
    var self = this.tempContext || this;

    var lastTick = Date.now();

    function step() {
      var delta = Date.now() - lastTick;
      lastTick = Date.now();
      requestAnimationFrame(step)
      callback.call(self, delta, lastTick);
    };

    requestAnimationFrame(step);

    return this;
  },

  onMouseMove: function(callback) {
    var self = this.tempContext || this;

    if(!MOBILE) this.canvas.addEventListener("mousemove", function(e) {
      var pos = $.mousePosition(e);
      callback.call(self, pos.x, pos.y);
    });

    else this.canvas.addEventListener("touchmove", function(e) {
      e.preventDefault();
      var pos = $.mousePosition(e);
      callback.call(self, pos.x, pos.y);
    });

    return this;
  },

  onMouseDown: function(callback) {
    var self = this.tempContext || this;

    if(!MOBILE) {
      this.canvas.addEventListener("mousedown", function(e) {
        var pos = $.mousePosition(e);
        callback.call(self, pos.x, pos.y, e.button);
      });
    } else {
      this.canvas.addEventListener("touchstart", function(e) {
        var pos = $.mousePosition(e);
        callback.call(self, pos.x, pos.y, e.button);
      });
    }

    return this;
  },

  onMouseUp: function(callback) {
    var self = this.tempContext || this;

    if(!MOBILE) {
      this.canvas.addEventListener("mouseup", function(e) {
        var pos = $.mousePosition(e);
        callback.call(self, pos.x, pos.y, e.button);
      });
    } else {
      this.canvas.addEventListener("touchend", function(e) {
        var pos = $.mousePosition(e);
        callback.call(self, pos.x, pos.y, e.button);
      });
    }

    return this;
  },


  onSwipe: function(callback, threshold, timeout) {
    var self = this.tempContext || this;

    var swipeThr = threshold || 35;
    var swipeTim = timeout || 350;

    var swipeSP = 0;
    var swipeST = 0;
    var swipeEP = 0;
    var swipeET = 0;

    function swipeStart(e) {
      e.preventDefault();
      swipeSP = $.mousePosition(e);
      swipeST = Date.now();
    }

    function swipeUpdate(e) {
      e.preventDefault();
      swipeEP = $.mousePosition(e);
      swipeET = Date.now();
    }

    function swipeEnd(e) {
      e.preventDefault();

      var xDif = (swipeSP.x - swipeEP.x);
      var yDif = (swipeSP.y - swipeEP.y);
      var x = (xDif * xDif);
      var y = (yDif * yDif);
      var swipeDist = Math.sqrt(x + y);
      var swipeTime = (swipeET - swipeST);
      var swipeDir = undefined;

      if(swipeDist > swipeThr && swipeTime < swipeTim) {
        if(Math.abs(xDif) > Math.abs(yDif)) {
          if(xDif > 0) {
            swipeDir = "left";
          } else {
            swipeDir = "right";
          }
        } else {
          if(yDif > 0) {
            swipeDir = "up";
          } else {
            swipeDir = "down";
          }
        }
        callback.call(self, swipeDir);
      }
    }

    this.canvas.addEventListener("touchstart", function(e) {
      swipeStart(e);
    });
    this.canvas.addEventListener("touchmove", function(e) {
      swipeUpdate(e);
    });
    this.canvas.addEventListener("touchend", function(e) {
      swipeEnd(e);
    });
    this.canvas.addEventListener("mousedown", function(e) {
      swipeStart(e);
    });
    this.canvas.addEventListener("mousemove", function(e) {
      swipeUpdate(e);
    });
    this.canvas.addEventListener("mouseup", function(e) {
      swipeEnd(e);
    });

    return this;
  },

  onKeyDown: function(callback) {
    document.addEventListener("keydown", function(e) {
      if(e.which >= 48 && e.which <= 90) var keyName = String.fromCharCode(e.which).toLowerCase();
      else var keyName = $.keycodes[e.which];
      callback.call(self, keyName);
    });
    return this;
  },

  onKeyUp: function(callback) {
    document.addEventListener("keyup", function(e) {
      if(e.which >= 48 && e.which <= 90) var keyName = String.fromCharCode(e.which).toLowerCase();
      else var keyName = $.keycodes[e.which];
      callback.call(self, keyName);
    });
    return this;
  },

  onResize: function(callback) {
    var self = this;

    window.addEventListener("resize", function() {
      callback.call(self, window.innerWidth, window.innerHeight);
    });

    callback.call(self, window.innerWidth, window.innerHeight);

    return this;
  },

  onDropImage: function(callback) {
    var self = this;
    document.addEventListener('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();

      var file = e.dataTransfer.files[0];

      if(!(/image/i).test(file.type)) return false;
      var reader = new FileReader();

      reader.onload = function(e) {
        var image = new Image;

        image.onload = function() {
          callback.call(self, this);
        };

        image.src = e.target.result;
      };

      reader.readAsDataURL(file);

    });

    document.addEventListener("dragover", function(e) {
      e.preventDefault();
    });

    return this;
  }

};

/* extend wrapper with drawing context methods */

var methods = ["arc", "arcTo", "beginPath", "bezierCurveTo", "clearRect", "clip", "closePath", "createImageData", "createLinearGradient", "createRadialGradient", "createPattern", "drawFocusRing", "drawImage", "fill", "fillRect", "fillText", "getImageData", "isPointInPath", "lineTo", "measureText", "moveTo", "putImageData", "quadraticCurveTo", "rect", "restore", "rotate", "save", "scale", "setTransform", "stroke", "strokeRect", "strokeText", "transform", "translate"];
for(var i = 0; i < methods.length; i++) {
  var name = methods[i];
  if(!$.Wrapper.prototype[name]) $.Wrapper.prototype[name] = Function("this.context." + name + ".apply(this.context, arguments); return this;");
};

/* create setters and getters */

var properties = ["canvas", "fillStyle", "font", "globalAlpha", "globalCompositeOperation", "lineCap", "lineJoin", "lineWidth", "miterLimit", "shadowOffsetX", "shadowOffsetY", "shadowBlur", "shadowColor", "strokeStyle", "textAlign", "textBaseline"];
for(var i = 0; i < properties.length; i++) {
  var name = properties[i];
  if(!$.Wrapper.prototype[name]) $.Wrapper.prototype[name] = Function("if(arguments.length) { this.context." + name + " = arguments[0]; return this; } else { return this.context." + name + "; }");
};