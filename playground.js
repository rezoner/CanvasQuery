/*     
  Playground 1.0.0
  http://canvasquery.org
  (c) 2012-2014 http://rezoner.net
  Playground may be freely distributed under the MIT license.
*/

function playground(args) {
  return new Playground(args);
};

playground.extend = function() {
  for (var i = 1; i < arguments.length; i++) {
    for (var j in arguments[i]) {
      arguments[0][j] = arguments[i][j];
    }
  }

  return arguments[0];
};

function Playground(args) {

  this.smoothing = true;

  for (var key in args) this[key] = args[key];

  if (!this.width || !this.height) this.fitToContainer = true;

  this.scale = 1;

  if (!this.container) this.container = document.body;

  if (this.container !== document.body) this.customContainer = true;

  /* canvas */

  if (!args.layer) {
    cq.smoothing = this.smoothing;

    if (window.CocoonJS) {
      this.layer = cq.cocoon(1, 1);
      this.layer.appendTo(this.container);
      this.screen = this.layer;
    } else {
      this.layer = cq(1, 1);

      if (this.scaleToFit) {
        this.screen = cq(1, 1);
        this.screen.appendTo(this.container);
      } else {
        this.layer.appendTo(this.container);
        this.screen = this.layer;
      }
    }

  }

  var canvas = this.screen.canvas;

  /* mouse */

  this.mouse = new playground.Mouse(canvas);

  if (this.mousemove) this.mouse.on("mousemove", this.mousemove.bind(this));
  if (this.mousedown) this.mouse.on("mousedown", this.mousedown.bind(this));
  if (this.mouseup) this.mouse.on("mouseup", this.mouseup.bind(this));

  /* touch */

  this.touch = new playground.Touch(canvas);

  if (this.touchmove) this.touch.on("touchmove", this.touchmove.bind(this));
  if (this.touchstart) this.touch.on("touchstart", this.touchstart.bind(this));
  if (this.touchend) this.touch.on("touchend", this.touchend.bind(this));

  /* keyboard */

  this.keyboard = new playground.Keyboard();

  this.keyboard.preventDefault = this.preventKeyboardDefault;

  if (this.keydown) this.keyboard.on("keydown", this.keydown.bind(this));
  if (this.keyup) this.keyboard.on("keyup", this.keyup.bind(this));

  /* window resize */

  window.addEventListener("resize", this.resizeHandler.bind(this));

  setTimeout(this.resizeHandler.bind(this), 1);

  /* game loop */

  var self = this;

  var lastTick = Date.now();

  function step() {

    requestAnimationFrame(step);

    var delta = Date.now() - lastTick;
    lastTick = Date.now();

    if (delta > 1000) return;

    if (self.loader.count <= 0) {
      if (self.step) self.step(delta / 1000);
      if (self.render) self.render(delta / 1000);
    } else {
      self.renderLoader(delta / 1000);
    }

    if (self.scaleToFit) {
      self.screen.save();
      self.screen.translate(self.offsetX, self.offsetY);
      self.screen.scale(self.scale, self.scale);
      // self.layer.drawImage(self.scanlines.canvas, 0, 0);
      self.screen.drawImage(self.layer.canvas, 0, 0);
      self.screen.restore();
    }

  };

  requestAnimationFrame(step);

  /* assets */

  /* default audio format */
  var canPlayOgg = (new Audio).canPlayType('audio/ogg; codecs="vorbis"');
  var canPlayMp3 = (new Audio).canPlayType("audio/mp3");

  if (canPlayOgg) this.audioFormat = "ogg";
  else this.audioFormat = "mp3";

  this.loader = new playground.Loader();

  this.images = {};
  this.sounds = {};

  this.loadFoo(0.5);

  if (this.create) setTimeout(this.create.bind(this));

  this.loader.on("ready", function() {
    if (self.ready) self.ready();

    self.ready = function() {};
  });


};

Playground.prototype = {

  resizeHandler: function() {

    if (this.customContainer) {
      var containerWidth = this.container.offsetWidth;
      var containerHeight = this.container.offsetHeight;
    } else {
      var containerWidth = window.innerWidth;
      var containerHeight = window.innerHeight;
    }

    if (this.fitToContainer) {
      this.width = this.containerWidth;
      this.height = this.containerHeight;
    }

    if (!this.scaleToFit) {

      if (this.fitToContainer) {
        this.width = containerWidth;
        this.height = containerHeight;
      }

      this.offsetX = 0;
      this.offsetY = 0;

    } else {

      this.screen.width = containerWidth;
      this.screen.height = containerHeight;

      this.scale = Math.min(containerWidth / this.width, containerHeight / this.height);

      if (this.roundScale) this.scale = Math.max(1, Math.floor(this.scale));

      this.offsetX = (containerWidth / 2 - this.scale * (this.width / 2) | 0);
      this.offsetY = (containerHeight / 2 - this.scale * (this.height / 2) | 0);

      this.mouse.scale = this.scale;
      this.mouse.offsetX = this.offsetX;
      this.mouse.offsetY = this.offsetY;

      this.touch.scale = this.scale;
      this.touch.offsetX = this.offsetX;
      this.touch.offsetY = this.offsetY;
    }

    this.layer.width = this.width;
    this.layer.height = this.height;

    this.center = {
      x: this.width / 2 | 0,
      y: this.height / 2 | 0
    };

    this.screen.clear("#000");

    if (this.resize) this.resize();

    this.mouse.update();
    this.touch.update();
  },

  renderLoader: function() {

    var height = this.height / 10 | 0;
    var x = 32;
    var width = this.width - x * 2;
    var y = this.height / 2 - height / 2 | 0;

    this.layer.clear("#000");
    this.layer.strokeStyle("#fff").lineWidth(2).strokeRect(x, y, width, height);
    this.layer.fillStyle("#fff").fillRect(x, y, width * this.loader.progress | 0, height);

  },


  /* foo 
  /* imaginary timeout to delay loading */

  loadFoo: function(timeout) {
    if (!this.foofooLoader) this.foofooLoader = 0;

    var loader = this.loader;

    this.loader.add("foo " + timeout);

    setTimeout(function() {
      loader.ready("foo " + timeout);
    }, (this.foofooLoader += timeout * 1000));

  },

  /* images */

  loadImages: function() {

    for (var i = 0; i < arguments.length; i++) {

      var arg = arguments[i];

      /* polymorphism at its finest */

      if (typeof arg === "object") {

        for (var key in arg) this.addImages(arg[key]);

      } else {

        /* if argument is not an object/array let's try to load it */

        var filename = arg;

        var loader = this.loader;

        var fileinfo = filename.match(/(.*)\..*/);
        var key = fileinfo ? fileinfo[1] : filename;

        /* filename defaults to png */

        if (!fileinfo) filename += ".png";

        var path = "images/" + filename;

        this.loader.add(path);

        var image = this.images[key] = new Image;

        image.addEventListener("load", function() {
          loader.ready(path);
        });

        image.addEventListener("error", function() {
          loader.error(path);
        });

        image.src = path;
      }
    }
  },

  /* sounds */

  loadSounds: function() {

    for (var i = 0; i < arguments.length; i++) {

      var arg = arguments[i];

      /* polymorphism at its finest */

      if (typeof arg === "object") {

        for (var key in arg) this.loadSounds(arg[key]);

      } else {

        /* if argument is not an object/array let's try to load it */

        var filename = arg;

        var loader = this.loader;

        var key = filename;

        filename += "." + this.audioFormat;

        var path = "sounds/" + filename;

        this.loader.add(path);

        var audio = this.sounds[key] = new Audio;

        audio.addEventListener("canplay", function() {
          loader.ready(path);
        });

        audio.addEventListener("error", function() {
          loader.error(path);
        });

        audio.src = path;
      }
    }

  },

  loadFont: function(name) {
    var styleNode = document.createElement("style");
    styleNode.type = "text/css";

    var formats = {
      "woff": "woff",
      "ttf": "truetype"
    };

    var sources = "";

    for (var ext in formats) {
      var type = formats[ext];
      sources += " url(\"fonts/" + name + "." + ext + "\") format('" + type + "');"
    }

    styleNode.textContent = "@font-face { font-family: '" + name + "'; src: " + sources + " }";

    document.head.appendChild(styleNode);

    var layer = cq(32, 32);

    layer.font("10px huj");
    layer.fillText(16, 16, 16).trim();

    var width = layer.width;
    var height = layer.height;

    this.loader.add("font " + name);

    var self = this;

    function check() {
      var layer = cq(32, 32);
      layer.font("10px " + name).fillText(16, 16, 16);
      layer.trim();

      console.log(width, height, layer.width, layer.height)

      if (layer.width !== width || layer.height !== height) {
        self.loader.ready("font " + name);
      } else {
        setTimeout(check, 250);
      }
    };

    check();
  },

  playSound: function(key, loop) {
    var sound = this.sounds[key];
    sound.currentTime = 0;
    sound.loop = loop;
    sound.play();
    return sound;
  },

  stopSound: function(sound) {
    if (typeof sound === "string") sound = this.sounds[sound];
    sound.pause();
  }


};

playground.Events = function() {

  this.listeners = {};

};

playground.Events.prototype = {

  on: function(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];

    this.listeners[event].push(callback);

    return callback;
  },

  once: function(event, callback) {
    callback.once = true;

    if (!this.listeners[event]) this.listeners[event] = [];

    this.listeners[event].push(callback);

    return callback;
  },

  off: function(event, callback) {
    for (var i = 0, len = this.listeners[event].length; i < len; i++) {
      if (this.listeners[event][i]._remove) {
        this.listeners[event].splice(i--, 1);
        len--;
      }
    }
  },

  trigger: function(event, data) {

    /* if you prefer events pipe */

    if (this.listeners["event"]) {
      for (var i = 0, len = this.listeners["event"].length; i < len; i++) {
        this.listeners["event"][i](event, data);
      }
    }

    /* or subscribed to single event */

    if (this.listeners[event]) {
      for (var i = 0, len = this.listeners[event].length; i < len; i++) {
        var listener = this.listeners[event][i];
        listener(data);

        if (listener.once) {
          this.listeners[event].splice(i--, 1);
        }
      }
    }
  }
};

/* Mouse */

playground.Mouse = function(element) {

  playground.Events.call(this);

  this.element = element;

  this.buttons = {};

  this.mousemoveEvent = {};
  this.mousedownEvent = {};
  this.mouseupEvent = {};

  this.x = 0;
  this.y = 0;

  this.offsetX = 0;
  this.offsetY = 0;
  this.scale = 1;

  element.addEventListener("mousemove", this.mousemove.bind(this));
  element.addEventListener("mousedown", this.mousedown.bind(this));
  element.addEventListener("mouseup", this.mouseup.bind(this));
};

playground.Mouse.prototype = {

  getElementOffset: function(element) {

    var offsetX = 0;
    var offsetY = 0;

    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    }

    while ((element = element.offsetParent));

    return {
      x: offsetX,
      y: offsetY
    };

  },

  update: function() {
    this.elementOffset = this.getElementOffset(this.element);
  },

  mousemove: function(e) {
    this.x = this.mousemoveEvent.x = (e.pageX - this.elementOffset.x - this.offsetX) / this.scale | 0;
    this.y = this.mousemoveEvent.y = (e.pageY - this.elementOffset.y - this.offsetY) / this.scale | 0;

    this.mousemoveEvent.original = e;

    this.trigger("mousemove", this.mousemoveEvent);
  },

  mousedown: function(e) {
    this.mousedownEvent.x = this.mousemoveEvent.x;
    this.mousedownEvent.y = this.mousemoveEvent.x;
    this.mousedownEvent.button = ["left", "middle", "right"][e.button];
    this.mousedownEvent.original = e;


    this[e.button] = true;

    this.trigger("mousedown", this.mousedownEvent);
  },

  mouseup: function(e) {
    this.mouseupEvent.x = this.mousemoveEvent.x;
    this.mouseupEvent.y = this.mousemoveEvent.x;
    this.mouseupEvent.button = ["none", "left", "middle", "right"][e.button];
    this.mouseupEvent.original = e;

    this[e.button] = false;

    this.trigger("mouseup", this.mouseupEvent);
  }

};

playground.extend(playground.Mouse.prototype, playground.Events.prototype);

/* Touch */

playground.Touch = function(element) {

  playground.Events.call(this);

  this.element = element;

  this.buttons = {};

  this.touchmoveEvent = {};
  this.touchstartEvent = {};
  this.touchendEvent = {};

  this.x = 0;
  this.y = 0;

  this.offsetX = 0;
  this.offsetY = 0;
  this.scale = 1;

  element.addEventListener("touchmove", this.touchmove.bind(this));
  element.addEventListener("touchstart", this.touchstart.bind(this));
  element.addEventListener("touchend", this.touchend.bind(this));
};

playground.Touch.prototype = {

  getElementOffset: function(element) {

    var offsetX = 0;
    var offsetY = 0;

    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    }

    while ((element = element.offsetParent));

    return {
      x: offsetX,
      y: offsetY
    };

  },

  update: function() {
    this.elementOffset = this.getElementOffset(this.element);
  },

  touchmove: function(e) {
    var touch = e.touches[0] || e.changedTouches[0];

    this.x = this.touchmoveEvent.x = (touch.pageX - this.elementOffset.x - this.offsetX) / this.scale | 0;
    this.y = this.touchmoveEvent.y = (touch.pageY - this.elementOffset.y - this.offsetY) / this.scale | 0;

    this.touchmoveEvent.original = e;

    this.trigger("touchmove", this.touchmoveEvent);

    e.preventDefault();
  },

  touchstart: function(e) {
    this.touchstartEvent.x = this.touchmoveEvent.x;
    this.touchstartEvent.y = this.touchmoveEvent.x;

    this.touchstartEvent.original = e;

    this.pressed = true;

    this.trigger("touchstart", this.touchstartEvent);
  },

  touchend: function(e) {
    this.touchendEvent.x = this.touchmoveEvent.x;
    this.touchendEvent.y = this.touchmoveEvent.x;

    this.touchendEvent.original = e;

    this.pressed = false;

    this.trigger("touchend", this.touchendEvent);
  }

};

playground.extend(playground.Touch.prototype, playground.Events.prototype);

/* Keyboard */

playground.Keyboard = function() {

  playground.Events.call(this);

  this.keys = {};

  document.addEventListener("keydown", this.keydown.bind(this));
  document.addEventListener("keyup", this.keyup.bind(this));
  document.addEventListener("keypress", this.keypress.bind(this));

  this.keydownEvent = {};
  this.keyupEvent = {};

};

playground.Keyboard.prototype = {

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
    36: "home",
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

  keypress: function(e) {

  },

  keydown: function(e) {
    if (e.which >= 48 && e.which <= 90) var keyName = String.fromCharCode(e.which).toLowerCase();
    else var keyName = this.keycodes[e.which];

    if (this.keys[keyName]) return;

    this.keydownEvent.key = keyName;
    this.keydownEvent.original = e;

    this.keys[keyName] = true;

    this.trigger("keydown", this.keydownEvent);

    if (this.preventDefault && document.activeElement === document.body) {
      e.returnValue = false;
      e.keyCode = 0;
      e.preventDefault();
      e.stopPropagation();
    }
  },

  keyup: function(e) {

    if (e.which >= 48 && e.which <= 90) var keyName = String.fromCharCode(e.which).toLowerCase();
    else var keyName = this.keycodes[e.which];

    this.keyupEvent.key = keyName;
    this.keyupEvent.original = e;

    this.keys[keyName] = false;

    this.trigger("keyup", this.keyupEvent);
  }

};

playground.extend(playground.Keyboard.prototype, playground.Events.prototype);



playground.Loader = function() {

  playground.Events.call(this);

  this.reset();

};

playground.Loader.prototype = {

  /* loader */

  add: function(id) {
    this.queue++;
    this.count++;
    this.trigger("add", id);
  },

  error: function(id) {
    console.log("unable to load " + id);
    this.trigger("error", id);
  },

  ready: function(id) {
    this.queue--;

    this.progress = 1 - this.queue / this.count;

    this.trigger("load", id);

    if (this.queue <= 0) {
      this.trigger("ready");
      this.reset();
    }
  },

  reset: function() {
    this.progress = 0;
    this.queue = 0;
    this.count = 0;
  }
};

playground.extend(playground.Loader.prototype, playground.Events.prototype);

CanvasQuery.Layer.prototype.playground = function(args) {
  args.layer = this;
  return playground(args);
};