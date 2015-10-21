var FiltersPanel = function(container, model) {

  var self = this,

      createDropdown = function() {
        var select = jQuery('<select></select>');

        model.getFilterValues().map(function(val) {
          select.append('<option>' + val + '</val>');
        });

        select.change(function(e) {
          var val = select.find('option:selected').text();
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

FiltersPanel.prototype = Object.create(FiltersPanel.prototype);
