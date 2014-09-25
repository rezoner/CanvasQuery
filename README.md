<p class="center"><img src="http://canvasquery.com/images/scheme-x3.png"></p>

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

<a href="http://qbqbqb.rezoner.net/play/"><img src="http://canvasquery.com/showcase/qbqbqb.png"></a>
<a href="http://www.rockpapershotgun.com/2014/09/04/jameson-the-pilot-elite-space-game/"><img src="http://canvasquery.com/showcase/jamesonthepilot.png"></a>
<a href="http://hotlinetrail.rezoner.net/"><img src="http://canvasquery.com/showcase/hotlinetrail.png"></a>
