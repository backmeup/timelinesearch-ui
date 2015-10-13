var Model = function(props) {

  var ES_BASE_URL = 'http://localhost:9200/backmeup/_search?size=1500&q=',

      UNWANTED_RECORDS =
        [ 'album.html', 'albuminfo.xml', 'photo.jpg', 'commentinfo.xml',
          'groups.html', 'groupinfo.xml', 'postinfo.xml', 'user.xml' ],

      data = { results: [], resultsByDate: [], resultsByCoordinate: [] },

      fullTextCorpus = new WordList(),

      buildFromJSON = function(json) {
        data = processThemisResponse(json.files);
      },

      buildFromURL = function(url, callback) {
        jQuery.getJSON(url, function(response) {
          data = processESResponse(response.hits.hits);
          if (callback)
            callback();
        });
      },

      load = function(json_or_query, opt_callback) {
        if (jQuery.type(json_or_query) === 'string') {
          console.log('Searching ElasticSearch for "' + json_or_query + '"');
          buildFromURL(ES_BASE_URL + encodeURIComponent(json_or_query), opt_callback);
        } else {
          console.log('Normalizing THEMIS search results');
          buildFromJSON(json_or_query);
          if (opt_callback)
            opt_callback();
        }
      },

      /** A hack to 'beautify' THEMIS search result issues **/
      filterResults = function(results) {
        // Each Facebook photo has a 'photo.jpg' and a 'photoinfo.xml' record.
        // We want to throw away the photo.jpg record, and keep only the photoinfo.xml,
        // BUT first, we want to copy the image + thumbnail paths from 'photo.jpg' to
        // 'photoinfo.xml'. (Savvy?)
        jQuery.each(results, function(idx, result) {
          var photoPath, photoRecord;

          if (result.title === 'photoinfo.xml') {
            photoPath = result.path.replace('photoinfo.xml', 'photo.jpg');
            photoRecord = findByProperty('path', results)(photoPath);
            result.title = false;
            if (photoRecord) {
              result.createdAt = photoRecord.createdAt;
              result.path = photoRecord.path;
              result.contentType = photoRecord.contentType;
              result.thumbnail = photoRecord.thumbnail;
            } else {
              // Most of the time, the photo won't actually be part of the results.
              // So we need to make a stab in the dark...
              result.path = photoPath;
              result.contentType = 'image-jpeg';
              result.thumbnail = photoPath;
            }
          }
        });

        // Throw out all unwanted records
        return jQuery.grep(results, function(result) {
          return UNWANTED_RECORDS.indexOf(result.title) === -1;
        });
      },

      normalizeESResults = function(hits) {
        return hits.map(function(hit, index) {
          var s = hit._source;

          if (s.fulltext)
            fullTextCorpus.append(s.fulltext);

          return {
            key: index,
            title: s.filename,
            createdAt: (s.document_creation_date) ? s.document_creation_date : s.backup_at,
            createdBy: s.authorName,
            thumbnail: s.thumbnail_path,
            fulltext: s.fulltext,
            dataSource: s.backup_source_plugin_id.replace(/\./g, '-'),
            contentType: s['Content-Type'].replace(/\.|\/|\+/g, '-'),
            lat: parseFloat(s.location_latitude),
            lon: parseFloat(s.location_longitude),
            path: s.path,
            _source: s
          };
        });
      },

      normalizeThemisResults = function(files) {
        return files.map(function(hit, index) {

          if (hit.preview)
            fullTextCorpus.append(hit.preview);

          return {
            key: index,
            title: hit.title,
            createdAt: (hit.metadata.document_creation_date) ?
              parseInt(hit.metadata.document_creation_date) :
              hit.timeStamp,
            createdBy: hit.ownerId,
            thumbnail: (hit.thumbnailUrl) ?
              hit.thumbnailUrl.replace('###TOKEN###', encodeURIComponent(props.token)) :
              false,
            fulltext: hit.preview,
            dataSource: hit.datasource,
            contentType: hit.type,
            lat: (hit.metadata.location_latitude) ?
              parseFloat(hit.metadata.location_latitude) :
              false,
            lon: (hit.metadata.location_longitude) ?
              parseFloat(hit.metadata.location_longitude) :
              false,
            path: (hit.downloadUrl) ?
              hit.downloadUrl.replace('###TOKEN###', encodeURIComponent(props.token)) :
              false,
            _source: hit
          };
        });
      },

      groupByDate = function(results) {
        var grouped = {}, sorted = [], days;

        // Put them into a hash map first...
        jQuery.each(results, function(idx, result) {
          var dayCreated = (result.createdAt) - (result.createdAt % 86400000);
          if (dayCreated in grouped) {
            grouped[dayCreated].push(result);
          } else {
            grouped[dayCreated] = [ result ];
          }
        });

        // ... then create a sorted array with { date: ..., results: } pairs
        days = Object.keys(grouped);
        days.sort(function(a,b) { return b - a; });
        sorted = days.map(function(day) {
          return { date: parseInt(day), results: grouped[day] };
        });

        return sorted;
      },

      groupByCoordinate = function(results) {
        var grouped = {}, asArray = [], coords;

        // Put them into a hash map first...
        jQuery.each(results, function(idx, result) {
          var coordHash = (result.lat && result.lon) ? result.lat + ',' + result.lon : false;
          if (coordHash) {
            if (coordHash in grouped)
              grouped[coordHash].push(result);
            else
              grouped[coordHash] = [ result ];
          }
        });

        // ... then create an with { lat: ..., lon: ..., results: } triples
        coords = Object.keys(grouped);
        asArray = coords.map(function(coord) {
          var latLon = coord.split(','),
              results = grouped[coord];

          // Sort results for this coordinate by time
          results.sort(function(a,b) { return b.createdAt - a.createdAt; });

          return {
            lat: parseFloat(latLon[0]),
            lon: parseFloat(latLon[1]),
            results: results
          };
        });

        return asArray;
      },

      processESResponse = function(hits) {
        var filteredAndNormalized = filterResults(normalizeESResults(hits));
        return {
          results: filteredAndNormalized,
          resultsByDate: groupByDate(filteredAndNormalized),
          resultsByCoordinate: groupByCoordinate(filteredAndNormalized)
        };
      },

      processThemisResponse = function(files) {
        var filteredAndNormalized = filterResults(normalizeThemisResults(files));
        return {
          results: filteredAndNormalized,
          resultsByDate: groupByDate(filteredAndNormalized),
          resultsByCoordinate: groupByCoordinate(filteredAndNormalized)
        };
      },

      getData = function(key) {
        return function() { return data[key]; };
      },

      getKeywords = function(result) {
        var text = result.fulltext;

        if (text)
          return TFIDF.compute(fullTextCorpus, new WordList(text), 3, 0.45);
        else
          return [];
      },

      /** Gest the first result older than a specific timestamp **/
      getFirstResultBefore = function(date) {
        var first;

        data.resultsByDate.some(function(tuple) {
          if (tuple.date <= date) {
            first = tuple.results[0];
            return true;
          } else {
            return false;
          }
        });

        return first;
      },

      findByProperty = function(key, opt_results) {
        return function(value) {
          var results = (opt_results) ? opt_results : data.results,
              result;

          results.some(function(r) {
            if (r[key] === value) {
              result = r;
              return true;
            } else {
              return false;
            }
          });
          return result;
        };
      };

  this.load = load;
  this.getFirstResultBefore = getFirstResultBefore;
  this.getResults = getData('results');
  this.getKeywords = getKeywords;
  this.getResultsByDate = getData('resultsByDate');
  this.getResultsByCoordinate = getData('resultsByCoordinate');
  this.findByKey = findByProperty('key');
  this.findByPath = findByProperty('path');

};
