var SpatioTemporalUI = function(props)  {

  var BASE_URL = 'http://localhost:9200/backmeup/_search?size=1500&q=',

      model = new Model(),

      resultListContainer = jQuery(props.resultList),
      resultList = new ResultList(resultListContainer, model),

      timeHistogramContainer = jQuery(props.timeHistogram),
      timeHistogram = new TimeHistogram(timeHistogramContainer, model),

      mapContainer = jQuery(props.map),
      map = new Map(mapContainer, model, props.imagePath),

      dateFlipperContainer = (function() {
        var el = jQuery('<div id="dateflipper"></div>');
        resultListContainer.parent().append(el);
        return el;
      })(),
      dateFlipper = new DateFlipper(dateFlipperContainer),

      dateFlipperDisplayTimer,

      update = function(query) {
        console.log('Searching for "' + query + '"');
        console.log(BASE_URL + encodeURIComponent(query));
        model.load(BASE_URL + encodeURIComponent(query), function() {
          map.render();
          resultList.render();
          timeHistogram.render();
        });
      },

      onSelectOnList = function(result) {
        console.log(result);
      },

      onSelectOnMap = function(results) {
        resultList.highlight(results);
        if (results.length > 0)
          resultList.scrollTo(results[0]);
      },

      onSelectTimeRange = function(e) {
        resultList.highlight(); // De-highlight
        resultList.scrollTo(model.getFirstResultBefore(e.to));
      },

      onScroll = function(e) {
        var winHeight = $(window).height(), latestVisible, date;

        if (dateFlipperDisplayTimer) {
          clearTimeout(dateFlipperDisplayTimer);
          dateFlipperDisplayTimer = false;
        }

        dateFlipperContainer.fadeIn();
        dateFlipperDisplayTimer = setTimeout(function() {
          dateFlipperContainer.fadeOut();
        }, 1200);

        jQuery('.resultListSection').toArray().some(function(element) {
          var elementTop = element.getBoundingClientRect().top;

          if (elementTop < winHeight) {
            latestVisible = element;
            return false;
          } else {
            return true;
          }
        });

        date = jQuery(latestVisible).data('date');
        if (date)
          dateFlipper.set(new Date(date));
      };

  dateFlipperContainer.hide();
  jQuery(document).scroll(onScroll);

  map.on('select', onSelectOnMap);
  timeHistogram.on('select', onSelectTimeRange);
  resultList.on('select', onSelectOnList);

  this.update = update;

};
