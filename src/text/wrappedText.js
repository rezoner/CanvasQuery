CanvasQuery.Layer.prototype.wrappedText = function(text, x, y, maxWidth, lineHeight) {

  if (maxWidth < 0) maxWidth = 0;

  var words = text.split(" ");

  var lineHeight = lineHeight || this.fontHeight();

  var ox = 0;
  var oy = 0;

  var textAlign = this.context.textAlign;
  var textBaseline = this.context.textBaseline;

  this.textBaseline("top");

  var spaceWidth = this.context.measureText(" ").width | 0;

  if (maxWidth) {

    var line = 0;
    var lines = [""];
    var linesWidth = [0];

    for (var i = 0; i < words.length; i++) {

      var word = words[i];

      var wordWidth = Math.ceil(this.context.measureText(word).width);


      if (wordWidth > maxWidth) {

        /* 4 is still risky, it's valid as long as `-` is the delimiter */

        if (word.length <= 5) return;

        var split = word.length / 2 | 0;

        words.splice(i, 1);
        words.splice(i, 0, "-" + word.substr(split));
        words.splice(i, 0, word.substr(0, split) + "-");

        i--;

        continue;
      }

      if (ox + wordWidth > maxWidth || words[i] === "\n") {

        lines[line] = lines[line].substr(0, lines[line].length - 1);
        linesWidth[line] -= spaceWidth;

        lines[++line] = "";
        linesWidth[line] = 0;
        ox = 0;
      }

      if (words[i] !== "\n") {

        lines[line] += word + " ";

        ox += wordWidth + spaceWidth;

        linesWidth[line] += wordWidth + spaceWidth;

      }

    }

    if (words[i] !== "\n") {
      lines[line] = lines[line].substr(0, lines[line].length - 1);
      linesWidth[line] -= spaceWidth;
    }


  } else {

    var lines = [text];
    var linesWidth = [this.context.measureText(text).width];

  }

  for (var i = 0; i < lines.length; i++) {

    var oy = y + i * lineHeight | 0;

    var text = lines[i];
    var width = linesWidth[i];

    this.textAlign("left");

    if (textAlign === "left" || textAlign === "start")
      this.fillText(text, x, oy);
    else if (textAlign === "center")
      this.fillText(text, x + maxWidth * 0.5 - width * 0.5 | 0, oy);
    else
      this.fillText(text, x + maxWidth - width, oy);

  }

  this.textAlign(textAlign);
  this.textBaseline(textBaseline);

  return this;

};