CanvasQuery.Layer.prototype.textBoundaries = function(text, maxWidth) {

  if (maxWidth < 0) maxWidth = 0;

  var words = text.split(" ");

  var h = this.fontHeight();

  var ox = 0;
  var oy = 0;

  var spaceWidth = this.context.measureText(" ").width;

  var line = 0;
  var lines = [""];

  var width = 0;

  for (var i = 0; i < words.length; i++) {

    var word = words[i];
    var wordWidth = Math.ceil(this.context.measureText(word).width);

    if (maxWidth && (wordWidth > maxWidth)) {

      if (word.length <= 5) continue;

      var split = word.length / 2 | 0;

      words.splice(i, 1);
      words.splice(i, 0, "-" + word.substr(split));
      words.splice(i, 0, word.substr(0, split) + "-");

      i--;

      continue;
    }

    if (((ox + wordWidth > maxWidth) && maxWidth) || words[i] === "\n") {

      if (ox > width) width = ox;

      lines[++line] = "";

      ox = 0;

    }

    if (words[i] !== "\n") {

      lines[line] += word;

      ox += wordWidth + spaceWidth;

    }

  }

  if (maxWidth) {

    var width = maxWidth;

  } else {

    if (!width) {

      width = this.context.measureText(text).width;

    }

  }

  return {
    height: lines.length * h,
    width: Math.ceil(width),
    lines: lines.length,
    fontHeight: h
  }

};