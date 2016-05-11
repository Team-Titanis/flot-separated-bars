/*
 * Flot plugin to order and display bars side-by-side.
 * 
 * Released under the MIT license by Alec LaLonde, October 8, 2013.
 *
 * Forked from Benjamin Buffet's orderBars plugin: 
 *   http://www.benjaminbuffet.com/public/js/jquery.flot.orderBars.js
 *
 * To activate the plugin you must specify the parameter "order" for the specific series:
 *   $.plot($("#placeholder"), [{ data: [ ... ], bars :{ order = null or integer }])
 *
 * Specifying a bar width along with the order is recommended. (e.g. {barWidth: 0.3})
 *
 * If 2 series have the same order param, they are ordered by the position in the array
 *
 */
(function($){
  'use strict';
  function init(plot){
    var orderedBarSeries, nbOfBarsToOrder, borderWidth, borderWidthInXabsWidth, barWidth,
        pixelInXWidthEquivalent = 1,
        isHorizontal = false;

    /*
     * This method add shift to x values
     */
    function reOrderBars(plot, serie, datapoints){
      var shiftedPoints = null;
      
      if(serieNeedToBeReordered(serie)){                
        checkIfGraphIsHorizontal(serie);
        calculPixel2XWidthConvert(plot);
        retrieveBarSeries(plot);
        calculBorderAndBarWidth(serie);
        
        if(nbOfBarsToOrder >= 2){  
          var position = findPosition(serie);
          var barShift = 0;

          if(!isBarInCenter(position)) {
            barShift = positionOffsetFromCenter(position) * (barWidth + borderWidthInXabsWidth * 2);
            if(nbOfBarsToOrder % 2 === 0) {
              barShift -= (barWidth / 2);
            }
            if(isBarAtLeftOfCenter(position)) {
              barShift = barShift * -1;
            }
          }

          shiftedPoints = shiftPoints(datapoints, serie, barShift);
          datapoints.points = shiftedPoints;
         }
       }
       return shiftedPoints;
    }

    function serieNeedToBeReordered(serie){
      return serie.bars != null && serie.bars.show && serie.bars.order != null;
    }

    function calculPixel2XWidthConvert(plot){
      var gridDimSize = isHorizontal ? plot.getPlaceholder().innerHeight() : plot.getPlaceholder().innerWidth();
      var minMaxValues = isHorizontal ? getAxeMinMaxValues(plot.getData(),1) : getAxeMinMaxValues(plot.getData(),0);
      var AxeSize = minMaxValues[1] - minMaxValues[0];
      if (AxeSize!=AxeSize) //AxeSize is NaN
        AxeSize = 0;
      pixelInXWidthEquivalent = AxeSize / gridDimSize;
    }

    function getAxeMinMaxValues(series,AxeIdx){
      var minMaxValues = [];
      for(var i = 0; i < series.length; i++){
        minMaxValues[0] = series[i].data[0][AxeIdx];
        minMaxValues[1] = series[i].data[series[i].data.length - 1][AxeIdx];
      }
      return minMaxValues;
    }

    function retrieveBarSeries(plot){
      orderedBarSeries = findOthersBarsToReOrders(plot.getData());
      nbOfBarsToOrder = orderedBarSeries.length;
    }

    function findOthersBarsToReOrders(series){
      var retSeries = [];

      for(var i = 0; i < series.length; i++){
        if(series[i].bars.order != null && series[i].bars.show){
          retSeries.push(series[i]);
        }
      }

      return retSeries.sort(sortByOrder);
    }

    function sortByOrder(serie1,serie2){
      var x = serie1.bars.order;
      var y = serie2.bars.order;
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }

    function  calculBorderAndBarWidth(serie){
      borderWidth = serie.bars.lineWidth ? serie.bars.lineWidth  : 2;
      borderWidthInXabsWidth = borderWidth * pixelInXWidthEquivalent;
      barWidth = orderedBarSeries[0].bars.barWidth;
    }
    
    function checkIfGraphIsHorizontal(serie){
      if(serie.bars.horizontal){
        isHorizontal = true;
      }
    }

    function findPosition(serie){
      var pos = 0;
      for (var i = 0; i < orderedBarSeries.length; ++i) {
        if (serie == orderedBarSeries[i]){
          pos = i;
          break;
        }
      }

      return pos+1;
    }

    function calculCenterBarShift(){
      var width = (orderedBarSeries[Math.ceil(nbOfBarsToOrder / 2)].bars.barWidth) / 2;
      return width;
    }

    function isBarAtLeftOfCenter(position){
      return position <= Math.ceil(nbOfBarsToOrder / 2);
    }

    function isBarInCenter(position) {
      return nbOfBarsToOrder - position === position - 1;
    }

    function positionOffsetFromCenter(position) {
      var positionFromCenter = Math.floor(nbOfBarsToOrder / 2) - position + 1;
      if(!isBarAtLeftOfCenter(position)) {
        positionFromCenter = position - Math.ceil(nbOfBarsToOrder / 2);
      }
      return positionFromCenter;
    }

    function sumWidth(series,start,end){
      var totalWidth = 0;

      for(var i = start; i <= end; i++){
        totalWidth += series[i].bars.barWidth+borderWidthInXabsWidth*2;
      }

      return totalWidth;
    }

    function shiftPoints(datapoints,serie,dx){
      var ps = datapoints.pointsize;
      var points = datapoints.points;
      var j = 0;           
      for(var i = isHorizontal ? 1 : 0;i < points.length; i += ps){
        points[i] += dx;
        //Adding the new x value in the serie to be abble to display the right tooltip value,
        //using the index 3 to not overide the third index.
        serie.data[j][3] = points[i];
        j++;
      }

      return points;
    }

    plot.hooks.processDatapoints.push(reOrderBars);

  }

  var options = {
    series : {
      bars: {order: null} // or number/string
    }
  };

  $.plot.plugins.push({
    init: init,
    options: options,
    name: "distinctBars",
    version: "0.1"
  });

})(jQuery);