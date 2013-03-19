window["cq"] = window["CanvasQuery"] = $;

if(typeof define === "function" && define.amd) {
  define([], function() {
    return $;
  });
}