var ResultList = function(container, model) {

  var self = this,

      THUMBNAIL_PLACEHOLDER =
        'https://pbs.twimg.com/profile_images/1814515189/picard1_400x400.jpg',

      MONTH_NAMES =
        [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ],

      listSectionHeadHeight = jQuery('.resultListSection h3').first().outerHeight(),

      formatDate = function(date) {
        var d = new Date(date);
        return MONTH_NAMES[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
      },

      createSection = function(results, date) {
        var html = '<div class="resultListSection" data-date="' + date + '">' +
                     '<h3>' + formatDate(date) + '</h3>' +
                     '<ul>',

            wrappedHTML;

        jQuery.each(results, function(idx, result) {
          var title = (result.title) ? result.title : '',

              thumbnail = (result.thumbnail) ?
                '<img class="thumbnail" src="' + result.thumbnail +'">' :
                '<div class="thumbnail"></div>',

              classes = 'resultContainer ' +
                result.key + ' ' +
                result.dataSource + ' ' +
                result.contentType,

              keywords = model.getKeywords(result).map(function(keyword) {
                return '<span>' + keyword.term + '</span>';
              }).join('');

          html +=
            '<li>' + // TODO bind click event
              '<div class="' + classes  + '" data-key="' + result.key + '">' + thumbnail +
              '<span class="title">' + title + '</span>' +
              '<div class="date created">' +
                '<span class="label">Erstellt: </span>' + formatDate(result.createdAt) +
              '</div>' +
              '<div class="keywords">' + keywords + '</div>' +
            '</div>' +
          '</li>';
        });

        html += '</ul></div>';
        wrappedHTML = jQuery(html);
        wrappedHTML.find('img').on('error', function(e) {
          // Fallback placeholder
          e.target.src = THUMBNAIL_PLACEHOLDER;
        });

        return wrappedHTML;
      },

      highlight = function(results) {
        jQuery('.resultContainer').removeClass('selected');

        if (results) {
          var selector = results.map(function(result) {
            return '.' + result.key;
          }).join(', ');
          jQuery(selector).addClass('selected');
        }
      },

      scrollTo = function(result) {
        var element = jQuery('.resultContainer.' + result.key);
        jQuery('html, body').animate({
          scrollTop: element.position().top - listSectionHeadHeight
        }, 500);
      },

      render = function() {
        container.empty();
        jQuery.each(model.getResultsByDate(), function(idx, tuple) {
          container.append(createSection(tuple.results, tuple.date));
        });
      };

  container.on('click', '.resultContainer', function(e) {
    var target = jQuery(e.target).closest('.resultContainer');
    self.fireEvent('select', model.findByKey(target.data('key')));
  });

  this.render = render;
  this.highlight = highlight;
  this.scrollTo = scrollTo;

  HasEvents.apply(this);
};

ResultList.prototype = Object.create(ResultList.prototype);
