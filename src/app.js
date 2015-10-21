var SpatioTemporalUI = function(props)  {

  var model = new Model({ token: props.token }),

      resultListContainer = jQuery(props.resultList),
      resultList = new ResultList(resultListContainer, model),

      timeHistogramContainer = jQuery(props.timeHistogram),
      timeHistogram = new TimeHistogram(timeHistogramContainer, model),

      mapContainer = jQuery(props.map),
      map = new Map(mapContainer, model, props.imagePath),

      filtersContainer = (props.filters) ? jQuery(props.filters) : false,
      filters = (filtersContainer) ? new FiltersPanel(filtersContainer, model) : false,

      dateFlipperContainer = (function() {
        var el = jQuery('<div id="dateflipper"></div>');
        resultListContainer.parent().append(el);
        return el;
      })(),
      dateFlipper = new DateFlipper(dateFlipperContainer),

      dateFlipperDisplayTimer,

      update = function(json_or_query) {
        model.load(json_or_query, function() {
          map.render();
          filters.render();
          resultList.render();
          timeHistogram.render();
        });
      },

      onSelectOnList = function(result) {
        console.log(result);
        window.open(result.path, '_blank');
      },

      onSelectOnMap = function(results) {
        resultList.highlight(results);
        if (results.length > 0)
          resultList.scrollTo(results[0]);
      },

      onChangeFilters = function(e) {
        model.setFilter(e);
        map.render();
        resultList.render();
        timeHistogram.render();
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
  filters.on('change', onChangeFilters);
  timeHistogram.on('select', onSelectTimeRange);
  resultList.on('select', onSelectOnList);

  this.update = update;

};
