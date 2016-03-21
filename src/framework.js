 /* Micro framework */

  cq.images = {};
  cq.atlases = {};
  cq.loaderscount = 0;
  cq.loadercallback = function() {

    cq.loaderscount--;

  };

  cq.loadImages = function(keys) {

    var promises = [];

    for (var key in keys) {

      cq.loaderscount++;

      var path = keys[key];

      var image = new orgImage();

      cq.images[key] = image;
      cq.loaderscount++;

      var promise = new Promise(function(resolve, reject) {

        image.addEventListener("load", function() {

          cq.loadercallback();

          resolve();

        });

        image.addEventListener("error", function() {

          throw ("unable to load " + this.src);

        });

      });

      image.src = path;

    }

    return Promise.all(promises);

  };

  cq.loadAtlases = function() {

  };

  /* WIP */

  cq.run = function(callback) {

    var lasTick = Date.now();

    var frame = function() {

      requestAnimationFrame(frame);

      var dt = Date.now() - lastTick;
      lastTick = Date.now();

      if (cq.loaderscount === 0) callback(dt);

    }

    requestAnimationFrame(frame);

  };

  /* WIP */

  cq.viewport = function() {

    if (!cq.layer) {

      cq.layer = cq();
      cq.layer.appendTo(document.body);

    }

  };

  /* WIP */
  cq.mouse = function(callback) {

    document.addEventListener('mousedown', function(e) {

      console.log(e);

    });

  }