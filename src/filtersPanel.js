var FiltersPanel = function(container, model) {

  var self = this,

      NAMES = {
        'image': 'Image',
        'text': 'Text File',
        'html': 'HTML Document',
        'other': 'Other...'
      },

      getScreenName = function(contentType) {
        if (NAMES.hasOwnProperty(contentType))
          return NAMES[contentType];
        else
          return contentType;
      },

      createDropdown = function() {
        var select = jQuery(
          '<select>' +
            '<option selected="true" value=""></option>' +
          '</select>');

        model.getFilterValues().map(function(val) {
          select.append('<option value="' + val + '">' + getScreenName(val) + '</val>');
        });

        select.change(function(e) {
          var val = select.val();
          if (val === '')
            self.fireEvent('change');
          else
            self.fireEvent('change', val);
        });

        return select;
      },

      render = function() {
        container.html(createDropdown());
      };

  this.render = render;

  HasEvents.apply(this);
};

FiltersPanel.prototype = Object.create(HasEvents.prototype);
