flot-separated-bars
===================

A distinct bars plugin for flot that plays nicely with the categories plugin (make sure to include this AFTER jquery.flot.categories.js!)

Enables displaying ordered bars side-by-side.

Forked from Benjamin Buffet's orderBars plugin: 
  http://www.benjaminbuffet.com/public/js/jquery.flot.orderBars.js

To activate the plugin you must specify the parameter "order" for the specific series:
  `$.plot($("#placeholder"), [{ data: [ ... ], bars :{ order = null or integer }])`

Specifying a bar width along with the order is recommended. (e.g. `{barWidth: 0.3}`)

If multiple series have the same order param, they are ordered by the position in the array
