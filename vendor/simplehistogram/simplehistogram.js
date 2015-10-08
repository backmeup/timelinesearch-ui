var SimpleHistogram = function(container, opts) {

  var getOpt = function(key, defaultVal) {
        return (opts) ? ((opts[key]) ? opts[key] : defaultVal) : defaultVal;
      },

      ALIGN = getOpt('align', 'bottom'),

      ORIENTATION = (ALIGN === 'bottom') ? 'landscape' : 'portrait',

      NUMBER_OF_BINS = getOpt('bins', 20),

      LOG_SCALE = getOpt('logScale', false),

      TOOLTIP_FN = getOpt('tooltip', false),

      computeBinWidth = function() {
        var binWidth = (ORIENTATION === 'landscape') ?
          Math.floor(jQuery(container).innerWidth() / NUMBER_OF_BINS) :
          Math.floor(jQuery(container).innerHeight() / NUMBER_OF_BINS);

        return binWidth;
      },

      BIN_WIDTH = computeBinWidth(),

      data = getOpt('data', []),

      containerEl = jQuery(container),

      eventHandlers = {},

      stepSize,

      /** Calculates the sum of all values within the specified interval [fromX, toX) **/
      sum = function(data, fromX, toX) {
        var sum = 0,

            valuesInInterval = jQuery.grep(data, function(value) {
              return (value.x >= fromX && value.x < toX);
            });

        jQuery.each(valuesInInterval, function(idx, value) {
          sum += value.y;
        });

        return sum;
      },

      /** Function to re-bin the histogram **/
      resample = function(data, numberOfBins) {
        var startX, endX, runningX, i,
            bins = [];

        if (data.length > 0) {
          startX = data[0].x;
          endX = data[data.length - 1].x;

          // Note: can be zero in edge case length == 1
          stepSize = (endX - startX) / numberOfBins;

          for (i=0; i<numberOfBins; i++) {
            runningX = startX + stepSize * i;
            bins.push({
              x: runningX,
              y: sum(data, runningX, runningX + stepSize)
            });
          }
        }

        return bins;
      },

      /** Renders the histogram into the parent DOM element **/
      render = function() {
        var bins = resample(data, NUMBER_OF_BINS);
        var maxY = Math.max.apply(null, jQuery.map(bins, function(val) { return val.y; })),
            fixedDimension = (ORIENTATION === 'landscape') ? 'width' : 'height',
            varDimension = (ORIENTATION === 'landscape') ? 'height' : 'width';

        if (LOG_SCALE)
          maxY = Math.log(maxY);

        containerEl.empty();
        jQuery.each(bins, function(idx, bin) {
          var len = LOG_SCALE ? Math.log(bin.y + 1) / maxY * 100 : bin.y / maxY * 100,

              title = TOOLTIP_FN ? TOOLTIP_FN(bin.x, bin.x + stepSize, bin.y) : bin.y,

              html = '<div class="histogram column ' + ALIGN + ' ' + ORIENTATION + '" style="' +
                       fixedDimension + ':' + BIN_WIDTH + 'px" data-x="' + bin.x + '" data-y="'  +
                       bin.y + '" title="' + title + '">' +
                       '<div class="histogram bar" style="' + varDimension + ': ' + len + '%">' +
                       '</div>' +
                     '</div>';

          containerEl.append(html);
        });
      },

      setData = function(d) {
        data = d;
        render();
      },

      redraw = function() {
        BIN_WIDTH = computeBinWidth();
        render();
      },

      on = function(eventName, handler) {
        var handlers = eventHandlers[eventName];
        if (handlers)
          handlers.push(handler);
        else
          eventHandlers[eventName] = [ handler ];
      },

      triggerEvent = function(handlers, e) {
        if (handlers) {
          var targetColumn = jQuery(e.target).closest('.column'),
              fromX = targetColumn.data('x'),
              toX = fromX + stepSize,
              y = targetColumn.data('y');

          jQuery.each(handlers, function(idx, h) {
            h(fromX, toX, y, e);
          });
        }
      };

  // Listen to window resize events
  jQuery(window).on('resize', redraw);

  // Listen to mouse events on columns
  containerEl.on('mouseenter', '.column', function(e) {
    triggerEvent(eventHandlers.enterbar, e);
  });

  containerEl.on('click', '.column', function(e) {
    triggerEvent(eventHandlers.click, e);
  });

  render();

  // Export public methods
  this.on = on;
  this.redraw = redraw;
  this.setData = setData;

};
