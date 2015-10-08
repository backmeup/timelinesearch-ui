var DateFlipper = function(parent, options) {

  var DURATION = 150,

      FIELD_STRETCH = 1.1,

      MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],

      el = jQuery(
        '<div class="dateflipper-container">' +
          '<div class="dateflipper-col dateflipper-col-year">' +
            '<p class="dateflipper-field">2015</p>' +
          '</div>' +
          '<div class="dateflipper-col dateflipper-col-month">' +
            '<p class="dateflipper-field">Sept</p>' +
          '</div>' +
          '<div class="dateflipper-col dateflipper-col-day">' +
            '<p class="dateflipper-field">17</p>' +
          '</div>' +
        '</div>'),

      currentDate, currentYear, currentMonth, currentDay,

      busy = false,

      pending = false,

      colYear = el.find('.dateflipper-col-year'),
      colMonth = el.find('.dateflipper-col-month'),
      colDay = el.find('.dateflipper-col-day'),

      /** Initializes the absolute widths of the fields **/
      initFields = function() {
        // Fields have dummy content, so that they have
        // determined width according to the current external
        // CSS settings. We want to fix that width (but
        // hide the dummy content while we do).
        // el.find('p').css({ 'opacity': 0 });
        jQuery(parent).append(el);

        /*
        colYear.css('width', colYear.outerWidth() * FIELD_STRETCH);
        colMonth.css('width', colMonth.outerWidth() * FIELD_STRETCH);
        colDay.css('width', colDay.outerWidth() * FIELD_STRETCH);

        el.css('height', colYear.height());
        */
      },

      /** Helper function to scroll one column up **/
      scrollUp = function(column, nextValue, onComplete) {
        var first = column.children().first(),
            lineheight = first.outerHeight(),
            colTop = column.position().top;

        column.append('<p class="dateflipper-field">' + nextValue + '</p>');

        column.animate({ top: colTop - lineheight }, {
          duration: DURATION,
          complete: function() {
            first.remove();
            column.css('top', colTop);
            onComplete();
          }
        });
      },

      /** Helper function to scroll one column down **/
      scrollDown = function(column, nextValue, onComplete) {
        var last = column.children().last(),
            lineheight = last.outerHeight(),
            colTop = column.position().top;

        column.css('top', colTop - lineheight);
        column.prepend('<p class="dateflipper-field">' + nextValue + '</p>');

        column.animate({ top: colTop }, {
          duration: DURATION,
          complete: function() {
            last.remove();
            onComplete();
          }
        });
      },

      checkComplete = function(completeY, completeM, completeD) {
        var currentlyPending = pending;
        if (completeY && completeM && completeD) {
          busy = false;
          if (pending) {
            pending = false;
            set(currentlyPending);
          }
        }
      },

      /** Sets the dial to the specified year, month and day **/
      set = function(date) {
        var y = date.getFullYear(),
            m = MONTH_NAMES[date.getMonth()],
            d = date.getDate(),

            completeY = false,
            completeM = false,
            completeD = false,

            scroll = ((currentDate - date) < 0) ? scrollUp : scrollDown;

        if (busy) {
          // Update animation currently running - just buffer the update for later
          pending = date;
        } else {
          busy = true;
          currentDate = new Date(date.getTime());

          if (y === currentYear) {
            // No change - just set flag to completed
            completeY = true;
          } else {
            currentYear = y;
            scroll(colYear, y, function() {
              completeY = true;
              checkComplete(completeY, completeM, completeD);
            });
          }

          if (m === currentMonth) {
            completeM = true;
          } else {
            currentMonth = m;
            scroll(colMonth, m, function() {
              completeM = true;
              checkComplete(completeY, completeM, completeD);
            });
          }

          if (d === currentDay) {
            completeD = true;
          } else {
            currentDay = d;
            scroll(colDay, d, function() {
              completeD = true;
              checkComplete(completeY, completeM, completeD);
            });
          }

          // Just in case we had an identical date set
          checkComplete(completeY, completeM, completeD);
        }

      };

  initFields();

  // Export public methods
  this.set = set;

};
