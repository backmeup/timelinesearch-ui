/** A generic pub-sub trait **/
var HasEvents = function() {

  var handlers = {};

  this.on = function(event, handler) {
    handlers[event] = handler;
  };

  this.fireEvent = function(event, e, args) {
    if (handlers[event])
      handlers[event](e, args);
  };

};
