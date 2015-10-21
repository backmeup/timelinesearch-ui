var Map = function(container, model, opt_imagepath) {

  var self = this,

      baseLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }),

      map = L.map(container[0], {
        center: new L.LatLng(48.2, 16.4),
        zoom: 12,
        layers: [ baseLayer ]
      }),

      markers = L.featureGroup().addTo(map),

      markerIndex = {},

      onSelect = function(results) {
        self.fireEvent('select', results);
        if (results.length > 0)
          selectFirst(results[0]);
      },

      clear = function() {
        markerIndex = {};
        markers.clearLayers();
      },

      render = function() {
        map.invalidateSize();
        clear();

        jQuery.each(model.getResultsByCoordinate(), function(idx, tuple) {
          // Create marker
          var marker = L.marker([tuple.lat, tuple.lon])
           .on('click', onSelect.bind(null, tuple.results))
           .addTo(markers);

          // Add results to index
          jQuery.each(tuple.results, function(idx, result) {
            markerIndex[result.key] = marker;
          });
        });

        if (markers.getLayers().length > 0)
          map.fitBounds(markers.getBounds());
      },

      selectFirst = function(results) {
        if (results && results.length > 0) {
          var marker = markerIndex[results[0].key];
          if (marker) {
            marker
              .bindPopup('<strong>' + results[0].title + '</strong>')
              .openPopup();
          } else {
            map.closePopup();
          }
        } else {
          map.closePopup();
        }
      };

  if (opt_imagepath)
    L.Icon.Default.imagePath = opt_imagepath;

  this.render = render;
  this.selectFirst = selectFirst;

  HasEvents.apply(this);
};

Map.prototype = Object.create(HasEvents.prototype);
