var TimeHistogram = function(container, model) {

  var self = this,

      MONTH_NAMES =
        [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ],

      now = new Date().getTime(),

      /** Gets the data from the model and converts to SimpleHistogram format **/
      convertData = function() {
        return model.getResultsByDate().map(function(tuple) {
          return { x: now - tuple.date, y: tuple.results.length };
        });
      },

      histogram = (function () {
        var h = new SimpleHistogram(container, {
              data: convertData(),
              bins:36,
              logScale: true,
              align: 'right',
              tooltip: function(xFrom, xTo, y) {
                var toDate = new Date(now - xFrom),
                    fromDate = new Date(now - xTo);

                return y + ' results from ' +
                  MONTH_NAMES[fromDate.getMonth()] + ' ' + fromDate.getDate() + ', ' +
                  fromDate.getFullYear() + ' to ' + MONTH_NAMES[toDate.getMonth()] + ' ' +
                  toDate.getDate() + ', ' + toDate.getFullYear();
              }
            });

        h.on('click', function(xFrom, xTo, y) {
          var fromDate = now - xTo,
              toDate = now - xFrom;

          self.fireEvent('select', { from: fromDate, to: toDate });
        });

        return h;
      })(),

      render = function() {
        histogram.setData(convertData());
        histogram.redraw();
      };

  this.render = render;

  HasEvents.apply(this);
};

TimeHistogram.prototype = Object.create(TimeHistogram.prototype);
