<p style="text-align:center"><img src="http://canvasquery.com/images/scheme-transparent-github.png"></p>

## Canvas Query

<a href="http://canvasquery.com/script/canvasquery.js">canvasquery.js</a> - an extended canvas for gamedevelopers

```javascript
var layer = cq()  
  .fillStyle("#ff0000")
  .fillRect(0, 0, 32, 32);
```

## Playground

<a href="http://canvasquery.com/script/playground.js">playground.js</a> - out of box - mouse, keyboard, scaling, gameloop and a layer to draw on.

```javascript
playground({ 
  
  render: function() {

    this.layer.clear("#007");
    this.layer.drawImage(this.images.cursor, this.mouse.x, this.mouse.y);

  },

  mousedown: function() {

    this.playSound("click");
    
  }

});
```

*ZIP* <a href="http://canvasquery.com/canvasquery-bootstrap.zip">bootstrap.zip</a> - download template using canvasquery + playground.

## Works with:

* *chrome, firefox* (cutting edge browser experienece)
* *node-webkit* (native desktop applications)
* *cocoonjs* (native mobile applications) 
* *nodejs* (serverside)

## These are games using CanvasQuery


[![QbQbQb](http://canvasquery.com/showcase-images/qbqbqb.png)](http://qbqbqb.rezoner.net/play/)
[![Jameson the Pilot](http://canvasquery.com/showcase-images/jamesonthepilot.png)](http://www.rockpapershotgun.com/2014/09/04/jameson-the-pilot-elite-space-game/)
[![Hotline Trail](http://canvasquery.com/showcase-images/hotlinetrail.png)](http://hotlinetrail.rezoner.net/)
