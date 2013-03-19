Canvas Query
============

* use HTML5 Canvas like jQuery
* extended canvas for gamedevelopers
* easy setup for a game loop, rendering loop, mouse, touch and keyboard

```javascript
cq(640, 480)
  .drawImage(image, 0, 0)
  .fillStyle("#ff0000")
  .fillRect(64, 64, 32, 32)
  .blur()
  .appendTo("body");
```

# Overviews

<div>
  <a href=http://cssdeck.com/labs/full/canvas-query-08-whats-new>0.8</a>
  <a href=http://cssdeck.com/labs/full/canvas-query-08-whats-new>0.7</a>
</div>

# Download

Current version 0.8

* [Development](http://canvasquery.com/canvasquery.js) 45 k (8k gzipped) 
* [Production](http://canvasquery.com/canvasquery.js) 30 k (6k gzipped)

# Showcase

# Getting started

You can try the code using [button playground](http://cssdeck.com/labs/canvasquery-framework-basic-setup)

## Creating wrapper

### From existing canvas

```javascript
var canvas = document.create("canvas");
var canvas = document.getElementById("something");

cq(canvas);
```

### From image

```javascript
var image = new Image;
var image = document.getElementById("something");

cq(image);
```

### From CSS Selector

```javascript
cq("#canvas");
cq(".image");
```


### Empty

```javascript
cq(320, 240);
```

### Fullscreen

```javascript
cq();
```

* Wrapper will have all original Canvas2DContext methods and properties.
* For reference print [this](http://www.nihilogic.dk/labs/canvas_sheet/HTML5_Canvas_Cheat_Sheet.pdf) and learn [this](http://www.html5canvastutorials.com/tutorials/html5-canvas-lines/)

You can still access original context and canvas element

```javascript
cq("#something").canvas;
cq("#something").context;
```

## Chaining

CanvasQuery provides methods chaining similar to jQuery:

```javascript
cq().fillStyle("#ff0000").fillRect(0, 0, 640, 480).drawImage(image, 0, 0).blur();
```

All setters/getters has been transformed to functions:

```javascript
cq().fillStyle("#ff0000").globalAlpha(0.2).lineWidth(6);
```

However sometimes it is more convenient to use .set() method

```javascript
cq().set({
  fillStyle: "#ff0000",
  globalAlpha: 0.2,
  lineWidth: 6
});
```

## Clone

Any change done to the wrapper will be applied to the original provided (or created) canvas element. Whenever you want to break the chain reaction and get a fresh copy use .clone() method:

```javascript
cq().clone().setHsl(...);
```

## Appending

If you want to insert your canvas to document body use .appendTo() method:

```javascript
cq(320, 240).fillStyle("#00ff00").fill(0, 0).appendTo("body");
```

You can use either css selector or provide a DOM element.

# Help

If you have any question ask it [here](https://github.com/rezoner/CanvasQuery/issues/new) or on stackoverlow

# Extensions

These are out of box extensions which are used in the same way that original canvas methods for example:

```javascript
  var myScreen = cq(320, 240);
  
  myScreen.drawImage(image, 32, 64);
  myScreen.setHsl(1.0, 0.5, 0.5);
```

## Basic

### clear

`.clear (color = null)`

Clears the canvas using clearRect or fillRect if the color is specified.

### crop

`.crop (x, y, width, height)`

Crops the canvas to specified rect.

### trim

`.trim (color = false, data)`

* `color` transparent color
* `data` if an object is provided it will contain trim boundaries

Automatically trims the image. If no color is provided transparent pixels will be used to determine boundaries.

```javascript
var boundaries = { };

/* trim transparent pixels and save boundaries */
cq(someImage).trim(null, boundaries);
```

### resizePixel(size)

`.resizePixel (size)`

Scales each pixel to match new size. Aka resize without bluring.

### roundRect

`.roundRect (x, y, width, height, radius)`

Rounded rectangle. Equivalent of border-radius in css. Remember that it's a path, so requires calling .fill or .stroke right after.

### paperBag

`.paperBag (x, y, width, height, modX, modY)`

* modX, modY `[0.0 - 1.0]`

Creates useless paper bag shape. Remember that it's a path, so requires calling .fill or .stroke right after.

### borderImage

`.borderImage (image, x, y, top, right, bottom, left, fill)`

Create expandable widgets (buttons, frames, e.t.c) - fill can be set to false, true, or color as a string.

## Blending

Blending is mixing two images/canvases using a special function like in gimp/photoshop - [explanation](http://docs.gimp.org/en/gimp-concepts-layer-modes.html)

Canvas query blend modes [example](http://canvasquery.com/examples/blend/)

use `.blend (above, mode, mix)`

Allows you to blend two layers using a blend mode like in gimp/photoshop. Wrapper will be used as a bottom layer. All changes are applied to the bottom layer.

* above `[canvas, image, cq, color]` - top layer to be mixed - you can even provide a color.
* mode `[addition, burn, color, darkenOnly, difference, divide, dodge, grainExtract, grainMerge, hardLight, hue, lightenOnly, multiply, normal, overlay, saturation, screen, softLight, substract, value]`
* mix `[0 - 1]` - blending ammount

```javascript
cq(someImage).blend(anotherImage, "hardLight", 0.6);
cq(someImage).blend("#ff0000", "hue", 1.0);
```

## Colors

### cq.color

Creates Canvas Query color object which can be used to convert color throught variety of formats.
It is CQ's internal property - not a context extension

```javascript
var color = cq.color(arguments);

cq.color(128, 64, 32, 0.5);
cq.color("#ff00aa");
cq.color("rgb(32, 64, 128)");
cq.color("rgba(32, 64, 128, 0.5)");
cq.color("hsl(0.5, 1.0, 0.2)");
cq.color("hsv(0.1, 0.4, 0.5)");
```

### conversions

Available conversions are rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, rgbToHex, hexToRgb

```javascript
var color = cq.color(128, 64, 32, 0.5);

color.toArray() // [128, 64, 32, 0.5]
color.toRgb()   // "rgb(128, 64, 32)"
color.toRgba()  // "rgba(128, 64, 32, 0.5)"
color.toHex()   // "#804020"
color.toHsl()   // [0.05, 0.6, 0.31]
color.toHsv()   // [0.05, 0.75, 0.5]

```

### setHsl

Very useful for [coloring units and bullets](http://canvasquery.com/examples/units/)

`.setHsl (hue, saturation, lighting)`

Filters canvas setting HSL values for each pixel. Values are between 0 and 1. If you don't want to change the value provide null as an argument.

```javascript
cq().setHsl(0.5, null, null); // changes Hue only
```

### shiftHsl

`.shiftHsl (hue, saturation, lighting)`

Same as .setHsl but instead of being set each component is shifted in positive or negative direction between -1 and 1;

```javascript
cq().adjustHsl(null, -1.0, null); // completly desaturate image
```

### grayscaleToAlpha

.grayscaleToAlpha ()

Convert grayscale of an image to its transparency. Light pixels become opaque. Dark - transparent.

### getPalette

`.getPalette ()`

Returns an array with all colors of an image in hex represantation.

### matchPalette

`.matchPalette (palette)`

Reduces colors to a certain palette. Palette is in array of hex colors ["#ffaa00", "#844223"]

[example](http://canvasquery.com/examples/matchPalette/)

## Effects

### convolve 

`.convolve (matrix, mix = 1, divide = 1)`

matrix `[array]` - kernel for the convolution

mix `[0 - 1]` - ammount of convolution

divide `[number]` - all values in matrix will be divided by this number

Some materials which can help you understanding convolutions:

http://beej.us/blog/data/convolution-image-processing/
http://www.html5rocks.com/en/tutorials/canvas/imagefilters/

### blur

`.blur ()`

Very simple blur filter.

### gaussianBlur

`.gaussianBlur ()`

Very simple gaussian blur filter.

### sharpen

`.sharpen ()`

Makes the image look sharper. Very useful after resizing an image.

### sepia

`.sepia ()`

Sepia filter - according to Microsoft's formulas

### threshold

`.threshold (limit)`

limit `[0-255]`

Filters out pixels which grayscale value is beyond provided limit.

### pixelize

`.pixelize (size)`

Applies pixelize effect.

## Text

### textBoundaries

`.textBoundaries (text, x, y, maxWidth)`

Gets boundaries { width, height } of a wrapped text.

### wrappedText

`.wrappedText (text, x, y, maxWidth)`

Fills word wrapped text

### gradientText

`.gradientText (text, x, y, maxWidth, gradient)`

Fills text with a gradient. For best crossbrowser experience text baseline should be set to top before using this method.

Gradient is an array of color stops and values:

```javascript
cq()
  .textBaseline("top")
  .gradientText("some text", 32, 32, 160, [
    0.0, "#ff0000",
    0.5, "#ffff00",
    0.8, "#00aaaa"
  ]);
```

## Masking

### grayscaleToMask 

`.grayscaleToMask ()`

Creates [byte] mask from grayscale values. So if you have pixel [96, 96, 96] it is pushed to the array as [96]

### colorToMask

`.colorToMask (transparentColor, inverted)`

* inverted `[false/true]` wether the transparent pixel should be pushed as false or true

Create [boolean] mask. Selected color will be treated as transparent.

For example using following code on image with red background:

```javascript
cq(image).colorToMask("#ff0000");
```

Will result in boolean array [true, false false, true, ... ] where all red pixels become false.

### applyMask

`.applyMask (mask)`

Applies [boolean] mask to a canvas - false pixels become transparent.

### fillMask

`.fillMask (mask, color)`

Fill [boolean or byte] mask with given color.

`.fillMask (mask, colorA, colorB)`

Fill [boolean or byte] mask using a gradient before colorA and colorB.

Check out using mask and [game-icons](http://canvasquery.com/examples/gameicons/)

#Framework

Additionally Canvas Query contains micro framework which allows you to quickly deploy bare bones canvas application with mouse and keyboard. Especially useful for javascript playgrounds.

Check out [example usage](http://cssdeck.com/labs/canvasquery-framework-basic-setup)


## Setup

```javascript
cq().framework({

  /* game logic loop */
  onStep: function(delta, time) { },
  
  /* rendering loop */
  onRender: function(delta, time) { },
  
  /* window resize */
  onResize: function(width, height) { },

  /* mouse and touch events */
  onMouseDown: function(x, y) { },
  onMouseUp: function(x, y) { },
  onMouseMove: function(x, y) { },
  
  /* keyboard events */
  onKeyDown: function(key) { },
  onKeyUp: function(key) { },
  
  /* swipe event */
  onSwipe: function(direction) { },
  
  /* user drops image from disk */
  onDropImage: function(image) { }

}).appendTo("body");
```

Within the framework - if context is not specified `this` becomes a reference to the canvas wrapper which was used to call the framework method. It is explained later under [advanced usage](#advanced-usage)

### Game loop

onStep is internally a setInterval - it should be used to update game logic - as it does **NOT** pause when user changes tab.

Provided `delta` argument is a difference of time between current and last frame in miliseconds.
You should use it in your calculations to ensure same game speed on different machines:

```javascript
onStep: function(delta) {
  
  player.x = player.speed * delta / 1000;
}
```

### Rendering loop

onRender is a shortcut for requestAnimationFrame. You should use it to draw your game as it **IS** paused when user changes tab - which saves users CPU and battery.

### Keyboard 

in keyboard events `key` is translated to string ex. `"escape", "a", "f4", "pagedown"`

### Mouse

on mobile devices:

* onMouseMove becomes onTouchMove
* onMouseDown becomes onTouchStart
* onMouseUp becomes onTouchEnd

### Drop image

Provides a way to quickly deploy an application which expects image from users disk. Check the following example:

http://cssdeck.com/labs/html5-drag-and-drop-image-tool-with-canvasquery

### Advanced usage

In fact framework method takes two arguments `.framework(events, context)` first one is set of events to be applied the other is context which defaults to the canvas wrapper.

Professional application could be built like this:

```javascript
var game = {
  
  setup: function() {  
   
    this.layer = cq().framework(this, this);    
    this.layer.appendTo("body");
  },
  
  onStep: function(delta) {
  
    this.entities.step(delta);
  },
  
  onRender: function() {
  
  	this.entities.render(this.layer);
  }
  
}

game.setup();
```

# Plugins API

Similar to jQuery - however uses no shorthands.

Extending the wrapper

```javascript
CanvasQuery.Wrapper.prototype.newMethod = function() { ... }
```

is equal to jQuery:

```javascript
jQuery.fn.newMethod = function() { ... }
```

Extending CanvasQuery itself

```javascript
CanvasQuery.newMethod = function() { ... }
```

Example plugin

```javascript
CanvasQuery.Wrapper.prototype.fillWithColor = function(color) {
  this.context.fillStyle = color;
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  return this;
}
```

Please [let me know](mailto:rezoner1337@gmail.com) if you write any plugin.

Credits
=======

* [Przemyslaw Sikorski / rezoner](http://rezoner.net)

**Main contributors**

* [Kothe Markus](https://twitter.com/daandruff)
* [Kaselow Dennis](https://github.com/denniskaselow)
* [Giles Thomas](https://github.com/wthit56)

**Thanks to**

* [Artur Reterski/ perski](http://artperski.com/) - for wicked insectoid ships
* [David Capello](http://www.aseprite.org/) for Aseprite - awesome pixelart editor and insane drunk convolution kernel
* [Ilmari Heikkinen](http://www.html5rocks.com/en/tutorials/canvas/imagefilters/) for great article about image filtering and code for convolutions
* [Michael Jackson](http://mjijackson.com/) for color conversion formulas

