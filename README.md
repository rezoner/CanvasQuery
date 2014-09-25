<p class="center"><img src="http://canvasquery.com/images/scheme-x3.png"></p>

## Canvas Query

*1.0* <a href="script/canvasquery.js">canvasquery.js</a> - an extended canvas for gamedevelopers


```javascript
var layer = cq()  
  .fillStyle("#ff0000")
  .fillRect(0, 0, 32, 32);
```

## Playground

*1.0* <a href="script/playground.js">playground.js</a> - out of box - mouse, keyboard, scaling, gameloop and a layer to draw on.

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

*ZIP* <a href="canvasquery-bootstrap.zip">bootstrap.zip</a> - download template using canvasquery + playground.

## Works with:

* *chrome, firefox* (cutting edge browser experienece)
* *node-webkit* (native desktop applications)
* *cocoonjs* (native mobile applications) 
* *nodejs* (serverside)

## These are games using CanvasQuery

<a href="http://qbqbqb.rezoner.net/play/"><img src="<?=cms::url("showcase/qbqbqb.png")?>"></a>
<a href="http://www.rockpapershotgun.com/2014/09/04/jameson-the-pilot-elite-space-game/"><img src="<?=cms::url("showcase/jamesonthepilot.png")?>"></a>
<a href="http://hotlinetrail.rezoner.net/"><img src="<?=cms::url("showcase/hotlinetrail.png")?>"></a>
<a href="http://gamejolt.com/games/puzzle/limbs-repair-station/23780/"><img src="<?=cms::url("showcase/limbs.png")?>"></a>
<a href="http://rezoner.net/labs/potatolagoon/next/"><img src="<?=cms::url("showcase/potatolagoon.png")?>"></a>
<a href="http://chirp.rezoner.net"><img src="<?=cms::url("showcase/chirp.png")?>"></a>
<img src="<?=cms::url("showcase/anitroubles.png")?>">
<img src="<?=cms::url("showcase/superrotoshooter.png")?>">
